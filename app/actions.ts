'use server'

import { generateStudyDeck } from '@/lib/groq-client'

export async function generateDeckAction(text: string, vibe: string) {
    try {
        // "Goldilocks" Rule: 1 card per ~200 words, min 3, max 7
        const wordCount = text.split(' ').length
        const cardLimit = Math.min(Math.max(Math.ceil(wordCount / 200), 3), 7)

        const cards = await generateStudyDeck(text, vibe, cardLimit)
        return { success: true, cards }
    } catch (error) {
        console.error('Failed to generate deck:', error)
        return { success: false, error: 'Failed to generate deck' }
    }
}
