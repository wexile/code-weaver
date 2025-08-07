
import { GoogleGenerativeAI } from "@google/generative-ai";
import {NextResponse} from "next/server";

// IMPORTANT! Set the runtime to "edge"
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { apiKey, prompt, context, userLanguage, mode = 'chat', codeToRefactor, codeLanguage } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required." }, { status: 400 });
        }

        if (mode === 'chat' && !prompt) {
            return NextResponse.json({ error: "Prompt is required for chat mode." }, { status: 400 });
        }
        
        if (mode === 'refactor' && !codeToRefactor) {
            return NextResponse.json({ error: "Code to refactor is required for refactor mode." }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        let fullPrompt: string;

        if (mode === 'refactor') {
            fullPrompt = `
                You are an expert AI code refactoring agent. Your goal is to analyze a piece of code, identify areas for improvement, and provide a refactored version along with a clear explanation.

                **Instructions:**
                1.  **Analyze the Code:** Carefully review the provided code snippet for issues related to performance, readability, best practices, and potential bugs.
                2.  **Refactor:** Rewrite the code to address the identified issues. The new code should be clean, efficient, and easy to understand.
                3.  **Explain:** Provide a concise but thorough explanation of the changes you made and why they are beneficial. Use a bulleted list for clarity.
                4.  **Format Response:** Your final output MUST be a JSON object with two keys: "explanation" (a string with your analysis and reasoning) and "refactoredCode" (a string containing ONLY the new, improved code). Do not include any other text or markdown formatting outside of this JSON object.

                **User's Code Language:** ${codeLanguage || 'unknown'}

                **Code to Refactor:**
                \`\`\`
                ${codeToRefactor}
                \`\`\`

                Respond in the user's language, which is '${userLanguage || 'en'}'.
            `;
        } else { // Chat mode
            fullPrompt = `
                ${context}

                User's Request: "${prompt}"

                ---
                Instruction: Respond in the user's language, which is '${userLanguage || 'en'}'.
            `;
        }


        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Gemini API proxy error:", error);
        // Extract a user-friendly error message if possible
        const errorMessage = error.message?.includes('API key not valid')
            ? 'Invalid API Key. Please check your key in the settings.'
            : 'An error occurred while communicating with the Gemini API.';

        return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
    }
}
