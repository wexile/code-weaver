
import { GoogleGenerativeAI } from "@google/generative-ai";
import {NextResponse} from "next/server";

// IMPORTANT! Set the runtime to "edge"
export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { apiKey, prompt, context, userLanguage } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required." }, { status: 400 });
        }

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const fullPrompt = `
            ${context}

            User's Request: "${prompt}"

            ---
            Instruction: Respond in the user's language, which is '${userLanguage || 'en'}'.
        `;

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
