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

// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )

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
  // TODO: Implement Supabase query
  // const { data, error } = await supabase
  //   .from('user_stamina')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .single()
  // return data
  return null
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
  // TODO: Implement Supabase update
  // const { error } = await supabase
  //   .from('user_stamina')
  //   .update({
  //     total_cards_completed: cardsCompleted,
  //     total_words_learned: wordsLearned,
  //     last_activity_date: new Date().toISOString()
  //   })
  //   .eq('user_id', userId)
}

/**
 * Get all decks for a user
 * @param userId - User ID
 * @returns Array of deck data
 */
export async function getUserDecks(userId: string): Promise<DeckData[]> {
  // TODO: Implement Supabase query
  // const { data, error } = await supabase
  //   .from('decks')
  //   .select('*')
  //   .eq('user_id', userId)
  // return data || []
  return []
}

/**
 * Save a new deck
 * @param userId - User ID
 * @param deck - Deck data
 */
export async function saveDeck(userId: string, deck: DeckData) {
  // TODO: Implement Supabase insert
  // const { data, error } = await supabase
  //   .from('decks')
  //   .insert([{ user_id: userId, ...deck }])
}

/**
 * Get user's learning progress for a specific deck
 * @param userId - User ID
 * @param deckId - Deck ID
 */
export async function getDeckProgress(userId: string, deckId: string) {
  // TODO: Implement Supabase query
  return {
    cardsCompleted: 0,
    cardsSkipped: 0,
    lastReviewedDate: null,
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
  // TODO: Implement Supabase insert
  // const { error } = await supabase
  //   .from('card_completions')
  //   .insert([{
  //     user_id: userId,
  //     deck_id: deckId,
  //     card_id: cardId,
  //     action,
  //     completed_at: new Date().toISOString()
  //   }])
}
