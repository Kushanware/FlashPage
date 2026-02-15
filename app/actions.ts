'use server'

import { generateStudyDeck } from '@/lib/groq-client'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'
type DifficultyMode = Difficulty | 'auto'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const splitIntoSections = (text: string) =>
    text
        .split(/\n\s*\n/g)
        .map((section) => section.trim())
        .filter(Boolean)

const buildSectionHints = (sections: string[]) =>
    sections.map((section, index) => {
        const normalized = section.replace(/\s+/g, ' ').trim()
        const words = normalized.split(' ').slice(0, 12).join(' ')
        return `Section ${index + 1}: ${words}${normalized.split(' ').length > 12 ? '...' : ''}`
    })

const inferDifficulty = (text: string): Difficulty => {
    const words = text.match(/\b[\w']+\b/g) ?? []
    const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)
    const wordCount = words.length || 1
    const sentenceCount = sentences.length || 1
    const totalWordChars = words.reduce((sum, word) => sum + word.length, 0)

    const avgWordLength = totalWordChars / wordCount
    const avgSentenceLength = wordCount / sentenceCount
    const complexityScore = avgSentenceLength * 0.6 + avgWordLength * 2

    if (complexityScore < 12) return 'beginner'
    if (complexityScore < 18) return 'intermediate'
    return 'advanced'
}

export async function generateDeckAction(text: string, vibe: string, difficulty: DifficultyMode = 'auto') {
    try {
        const words = text.match(/\b[\w']+\b/g) ?? []
        const wordCount = words.length
        const sections = splitIntoSections(text)
        const sectionHints = buildSectionHints(sections)
        const targetDifficulty = difficulty === 'auto' ? inferDifficulty(text) : difficulty

        // Scale by length with coverage in mind: ~1 card per 120 words, min 6, max 24
        const baseCount = Math.ceil(wordCount / 120)
        const sectionBoost = sections.length ? Math.min(sections.length, 12) : 0
        const cardLimit = clamp(Math.max(baseCount, sectionBoost, 6), 6, 24)

        const cards = await generateStudyDeck(text, vibe, cardLimit, {
            targetDifficulty,
            sectionHints,
        })
        return { success: true, cards }
    } catch (error) {
        console.error('Failed to generate deck:', error)
        return { success: false, error: 'Failed to generate deck' }
    }
}

const stripHtml = (html: string) => {
    const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, ' ')
    const withoutTags = withoutStyles.replace(/<[^>]+>/g, ' ')
    return withoutTags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
}

export async function fetchUrlTextAction(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Flashpages/1.0',
            },
        })

        if (!response.ok) {
            return { success: false, error: `Failed to fetch URL (${response.status})` }
        }

        const html = await response.text()
        const text = stripHtml(html)
        const sliced = text.length > 5000 ? text.slice(0, 5000) : text
        return { success: true, text: sliced }
    } catch (error) {
        console.error('Failed to fetch URL text:', error)
        return { success: false, error: 'Failed to fetch URL' }
    }
}
