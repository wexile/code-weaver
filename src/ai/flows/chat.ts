
'use server';
/**
 * @fileOverview AI chat agent that maintains conversation history.
 *
 * - continueChat - A function that handles the chat conversation.
 * - ChatInput - The input type for the continueChat function.
 * - ChatOutput - The return type for the continueChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AIMessage, HumanMessage } from 'genkit/model';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The user\'s latest prompt.'),
  context: z.object({
    fileName: z.string().optional(),
    fileContent: z.string().optional(),
  }).optional().describe('Context about the currently open file.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The model\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function continueChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, prompt, context } = input;

    // Convert the generic history to AIMessage or HumanMessage
    const messages = history.map((msg) => {
      if (msg.role === 'model') {
        return new AIMessage(msg.content);
      } else {
        return new HumanMessage(msg.content);
      }
    });

    let systemPrompt = `You are a helpful AI coding assistant called Code Weaver.
Your goal is to help the user with their coding questions.
Be concise and provide code examples when relevant. Use markdown for code blocks.`;

    if (context?.fileName && context?.fileContent) {
        systemPrompt += `\n\nThe user is currently viewing the file \`${context.fileName}\`. Here is its content, which you should use as the primary context for your answer:\n\n---\n${context.fileContent}\n---`;
    }

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
      history: messages,
      config: {
        system: systemPrompt,
      },
    });

    return { response: llmResponse.text };
  }
);
