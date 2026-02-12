import Groq from 'groq-sdk'
import { Card } from './types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Note: user mentioned calling from frontend in prompt but usually best via server action. 
  // However, the prompt says "Create a utility file src/utils/groqClient.ts" and "Frontend Workflow... call this function".
  // If we utilize server actions (which is better for Next.js), we don't need this. 
  // I will stick to server-side usage via actions.ts as planned to keep key safe.
})

export async function generateStudyDeck(boringText: string, vibe: string = 'Student'): Promise<Card[]> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a viral education creator. Transform textbook text into 5 interactive cards. 
        Output ONLY a JSON array. 
        Vibe: ${vibe} (Kid, Student, or Pro).
        Schema: [{ "id": number, "emoji": string, "hook": string, "content": string, "quiz": string }]`
        },
        { role: "user", content: boringText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    // The model might return an object with a key like "cards": [...] or just the array.
    // The prompt asks for "ONLY a JSON array", so we expect [ ... ].
    // However, sometimes models wrap it. We'll try to parse safely.
    const parsed = JSON.parse(content);

    // If it returns { cards: [...] } handle that
    if (parsed.cards && Array.isArray(parsed.cards)) {
      return parsed.cards;
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch (error) {
    console.error("Error generating study deck:", error);
    throw new Error("Failed to generate study deck");
  }
}
