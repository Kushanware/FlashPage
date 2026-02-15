import Groq from 'groq-sdk'
import { Card } from './types'

interface DeckGenerationOptions {
  targetDifficulty?: 'beginner' | 'intermediate' | 'advanced'
  sectionHints?: string[]
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Note: user mentioned calling from frontend in prompt but usually best via server action. 
  // However, the prompt says "Create a utility file src/utils/groqClient.ts" and "Frontend Workflow... call this function".
  // If we utilize server actions (which is better for Next.js), we don't need this. 
  // I will stick to server-side usage via actions.ts as planned to keep key safe.
})

export async function generateStudyDeck(
  boringText: string,
  vibe: string = 'student',
  quantity: number = 5,
  options: DeckGenerationOptions = {}
): Promise<Card[]> {
  try {
    const coverageHints = options.sectionHints?.length ? `\nCoverage targets:\n${options.sectionHints.map((hint) => `- ${hint}`).join('\n')}` : ''
    const targetDifficulty = options.targetDifficulty ?? 'intermediate'

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert Educational Engineer and Viral Content Creator. 
        Your goal is to transform input text into a micro-learning deck using Cognitive Load Theory.

        # 1. CARD COUNT + COVERAGE
        Create exactly ${quantity} cards.
        - Cards 1-${quantity - 1}: Learning Cards (Concepts)
        - Card ${quantity}: Quiz Card (Verification)
        - Cover the full range of topics in the input text. Make sure each major section is represented at least once. If there are more sections than cards, merge nearby sections into a single card.

        # 2. SELECTION FRAMEWORK (What to extract)
        Priority 1: Key Terms & Definitions (Bold, Italic, "is defined as")
        Priority 2: Relationships (Cause & Effect, "Because of X, Y happens")
        Priority 3: The "So What?" (Main summary/Takeaway)
        *Ignore anecdotal stories, fluff, or repetitive examples.*
        *Extract only Tier 2 (academic) and Tier 3 (subject-specific) vocabulary.*

        # 3. VIBE STRATEGY: ${vibe}
        ${vibe === 'kid' ? '- Strategy: Use Visual Metaphors (e.g., "A CPU is like a tiny post office"). Keep language simple, fun, and emoji-rich.' : ''}
        ${vibe === 'student' ? '- Strategy: Focus on Concepts & Connections (e.g., "Compare X vs Y"). Balance depth with accessibility.' : ''}
        ${vibe === 'pro' ? '- Strategy: Focus on Implementation, Logic, and "How-To". Use professional insights and nuanced analysis.' : ''}

        # 4. DIFFICULTY STRATEGY
        Auto-assign difficulty per card using: beginner | intermediate | advanced.
        Target overall difficulty: ${targetDifficulty}.
        Use the target as a center of gravity but vary per card based on concept complexity.

        # 5. JSON STRUCTURE
        Output ONLY a valid JSON object with a top-level "cards" array.
        
        Schema for Learning Cards:
        { 
          "id": string, 
          "emoji": string, 
          "hook": string (max 4 words, punchy), 
          "meat": string (the core lesson, concise), 
          "simplified": string (EL15 version), 
          "category": string, 
          "difficulty": string,
        }
        
        Schema for Quiz Card (The LAST card):
        { 
          "id": string, 
          "isQuiz": true, 
          "hook": "Quiz Time!", 
          "meat": "Test your knowledge", 
          "quizQuestion": string, 
          "quizOptions": string[], 
          "quizAnswer": number (index 0-3), 
          "category": "Quiz", 
          "difficulty": string,
        }`
        },
        {
          role: "user",
          content: `Source text:\n${boringText}\n${coverageHints}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    // The model should return { "cards": [...] }. We'll still be defensive.
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
