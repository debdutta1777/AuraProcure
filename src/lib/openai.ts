import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI | null {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }
    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return geminiClient;
}

export function hasGeminiKey(): boolean {
    return !!process.env.GEMINI_API_KEY;
}

export async function generateJSON(prompt: string, systemInstruction: string): Promise<unknown> {
    const gemini = getGemini();
    if (!gemini) return null;

    const model = gemini.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
}

export async function generateText(prompt: string, systemInstruction: string): Promise<string> {
    const gemini = getGemini();
    if (!gemini) return "";

    const model = gemini.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction,
        generationConfig: {
            temperature: 0.3,
        },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}
