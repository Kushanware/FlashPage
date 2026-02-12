/**
 * Supabase Client for Literacy Stamina
 * 
 * This module handles database operations for:
 * - User accounts and authentication
 * - Deck data (JSON structures with cards)
 * - Stamina stats and learning progress
 * - Custom collections
 * 
 * Setup:
 * 1. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 * 2. Install: npm install @supabase/supabase-js
 * 3. Uncomment the implementation below
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface UserStamina {
  userId: string
  totalCardsCompleted: number
  totalWordsLearned: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  totalTimeSpent: number
}

export interface DeckData {
  id: string
  title: string
  description: string
  cards: Array<{
    id: string
    content: string
    context?: string
    category: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
  createdAt: string
  updatedAt: string
}

/**
 * Get user's stamina statistics
 * @param userId - User ID
 * @returns User stamina data
 */
export async function getUserStamina(userId: string): Promise<UserStamina | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_stamina')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user stamina:', error)
    return null
  }

  return {
    userId: data.user_id,
    totalCardsCompleted: data.total_cards_completed,
    totalWordsLearned: data.total_words_learned,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastActivityDate: data.last_activity_date,
    totalTimeSpent: data.total_time_spent
  }
}

/**
 * Update user's stamina after completing cards
 * @param userId - User ID
 * @param cardsCompleted - Number of cards completed
 * @param wordsLearned - Number of new words learned
 */
export async function updateUserStamina(
  userId: string,
  cardsCompleted: number,
  wordsLearned: number
) {
  if (!supabase) return

  // First get current stats to increment
  const { data: currentStats } = await supabase
    .from('user_stamina')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (currentStats) {
    const { error } = await supabase
      .from('user_stamina')
      .update({
        total_cards_completed: (currentStats.total_cards_completed || 0) + cardsCompleted,
        total_words_learned: (currentStats.total_words_learned || 0) + wordsLearned,
        last_activity_date: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) console.error('Error updating stamina:', error)
  } else {
    // Create new record if none exists
    const { error } = await supabase
      .from('user_stamina')
      .insert([{
        user_id: userId,
        total_cards_completed: cardsCompleted,
        total_words_learned: wordsLearned,
        last_activity_date: new Date().toISOString()
      }])

    if (error) console.error('Error creating stamina record:', error)
  }
}

/**
 * Get all decks for a user
 * @param userId - User ID
 * @returns Array of deck data
 */
export async function getUserDecks(userId: string): Promise<DeckData[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching decks:', error)
    return []
  }

  return data || []
}

/**
 * Save a new deck
 * @param userId - User ID
 * @param deck - Deck data
 */
export async function saveDeck(userId: string, deck: Omit<DeckData, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('decks')
    .insert([{
      user_id: userId,
      title: deck.title,
      description: deck.description,
      cards: deck.cards
    }])
    .select()

  if (error) {
    console.error('Error saving deck:', error)
    return null
  }

  return data?.[0]
}

/**
 * Get user's learning progress for a specific deck
 * @param userId - User ID
 * @param deckId - Deck ID
 */
export async function getDeckProgress(userId: string, deckId: string) {
  if (!supabase) return { cardsCompleted: 0, cardsSkipped: 0, lastReviewedDate: null }

  const { data, error } = await supabase
    .from('card_completions')
    .select('action, completed_at')
    .eq('user_id', userId)
    .eq('deck_id', deckId)

  if (error) {
    console.error('Error fetching deck progress:', error)
    return { cardsCompleted: 0, cardsSkipped: 0, lastReviewedDate: null }
  }

  const cardsCompleted = data.filter(d => d.action === 'learned').length
  const cardsSkipped = data.filter(d => d.action === 'skipped').length
  // improved logic to safer acess to date
  const lastReviewedDate = data.length > 0 ? data.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at : null

  return {
    cardsCompleted,
    cardsSkipped,
    lastReviewedDate,
  }
}

/**
 * Save card completion record
 * @param userId - User ID
 * @param deckId - Deck ID
 * @param cardId - Card ID
 * @param action - 'learned' or 'skipped'
 */
export async function recordCardCompletion(
  userId: string,
  deckId: string,
  cardId: string,
  action: 'learned' | 'skipped'
) {
  if (!supabase) return

  const { error } = await supabase
    .from('card_completions')
    .insert([{
      user_id: userId,
      deck_id: deckId,
      card_id: cardId,
      action,
      //@ts-ignore - supabase types might be strict about dates but strings usually work
      completed_at: new Date().toISOString()
    }])

  if (error) console.error('Error recording completion:', error)
}
