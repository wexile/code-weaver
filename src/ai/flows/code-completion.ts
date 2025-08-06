'use server';

/**
 * @fileOverview Code completion AI agent.
 *
 * - codeCompletion - A function that provides code completion suggestions.
 * - CodeCompletionInput - The input type for the codeCompletion function.
 * - CodeCompletionOutput - The return type for the codeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeCompletionInputSchema = z.object({
  language: z.string().describe('The programming language of the code.'),
  codePrefix: z.string().describe('The code prefix to complete.'),
  importedLibraries: z.string().optional().describe('A list of libraries to consider for code completion.'),
});
export type CodeCompletionInput = z.infer<typeof CodeCompletionInputSchema>;

const CodeCompletionOutputSchema = z.object({
  completion: z.string().describe('The code completion suggestion.'),
});
export type CodeCompletionOutput = z.infer<typeof CodeCompletionOutputSchema>;

export async function codeCompletion(input: CodeCompletionInput): Promise<CodeCompletionOutput> {
  return codeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeCompletionPrompt',
  input: {schema: CodeCompletionInputSchema},
  output: {schema: CodeCompletionOutputSchema},
  prompt: `You are a code completion expert for {{{language}}}. You will receive a code prefix and you will generate a possible completion for it.

Consider the following libraries for code completion: {{{importedLibraries}}}

Code Prefix: {{{codePrefix}}}
Completion:`,
});

const codeCompletionFlow = ai.defineFlow(
  {
    name: 'codeCompletionFlow',
    inputSchema: CodeCompletionInputSchema,
    outputSchema: CodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
