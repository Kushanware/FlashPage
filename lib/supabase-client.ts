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

const isValidUrl = (url: string | undefined) => {
  try {
    return url && new URL(url)
  } catch {
    return false
  }
}

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl!, supabaseAnonKey)
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

import { Card } from '@/lib/types'

export interface DeckData {
  id: string
  title: string
  description: string
  cards: Card[]
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
    .maybeSingle()

  if (error) {
    console.error('Error fetching user stamina:', error)
    return null
  }

  // If no data found (new user), return zero initialized stats
  if (!data) {
    return {
      userId: userId,
      totalCardsCompleted: 0,
      totalWordsLearned: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
      totalTimeSpent: 0
    }
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
    .maybeSingle()

  if (currentStats) {
    const lastDate = new Date(currentStats.last_activity_date || 0)
    const today = new Date()

    // Reset hours to compare just the calendar days
    lastDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = Math.abs(today.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let newStreak = currentStats.current_streak || 0

    if (diffDays === 1) {
      // Consecutive day!
      newStreak += 1
    } else if (diffDays > 1) {
      // Missed a day (or more), reset to 1
      newStreak = 1
    } else if (diffDays === 0 && newStreak === 0) {
      // First activity of the day but streak was 0
      newStreak = 1
    }
    // If diffDays === 0, keep same streak (already counted for today)

    const { error } = await supabase
      .from('user_stamina')
      .update({
        total_cards_completed: (currentStats.total_cards_completed || 0) + cardsCompleted,
        total_words_learned: (currentStats.total_words_learned || 0) + wordsLearned,
        current_streak: newStreak,
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
        current_streak: 1,
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

  const cardsCompleted = data.filter((d: { action: string }) => d.action === 'learned').length
  const cardsSkipped = data.filter((d: { action: string }) => d.action === 'skipped').length
  // improved logic to safer acess to date
  const lastReviewedDate = data.length > 0 ? data.sort((a: { completed_at: string | number | Date }, b: { completed_at: string | number | Date }) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at : null

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
      completed_at: new Date().toISOString()
    }])

  if (error) console.error('Error recording completion:', error)
}

/**
 * Get weekly progress for the chart
 * @param userId - User ID
 */
export async function getWeeklyProgress(userId: string) {
  if (!supabase) return []

  // Get start of 7 days ago
  const date = new Date()
  date.setDate(date.getDate() - 6) // Go back 6 days + today
  date.setHours(0, 0, 0, 0)
  const startDate = date.toISOString()

  const { data, error } = await supabase
    .from('card_completions')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startDate)
    .eq('action', 'learned') // Only count learned cards as "minutes"

  if (error) {
    console.error('Error fetching weekly progress:', error)
    return []
  }

  // Initialize last 7 days with 0
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const chartData = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = days[d.getDay()]
    const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD

    // Count completions for this day
    // Est. 1 minute per card for simplicity
    const minutes = data.filter((row: { completed_at: string }) =>
      row.completed_at.startsWith(dateStr)
    ).length

    chartData.push({ day: dayName, minutes })
  }

  return chartData
}
