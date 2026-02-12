'use server'

import { generateStudyDeck } from '@/lib/groq-client'

export async function generateDeckAction(text: string, vibe: string) {
    try {
        const cards = await generateStudyDeck(text, vibe)
        return { success: true, cards }
    } catch (error) {
        console.error('Failed to generate deck:', error)
        return { success: false, error: 'Failed to generate deck' }
    }
}
