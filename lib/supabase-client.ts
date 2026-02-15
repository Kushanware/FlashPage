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

import { Card, Badge } from '@/lib/types'

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
 * @param timeSpentMinutes - Minutes spent in session
 */
export async function updateUserStamina(
  userId: string,
  cardsCompleted: number,
  wordsLearned: number,
  timeSpentMinutes: number = 0
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
        total_time_spent: (currentStats.total_time_spent || 0) + timeSpentMinutes,
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
        total_time_spent: timeSpentMinutes,
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

  return (data || []).map((deck: any) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cards: deck.cards,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at
  }))
}

/**
 * Get prebuilt decks (public, latest topics)
 * @param limit - Max decks to return
 */
export async function getPrebuiltDecks(limit: number = 9): Promise<DeckData[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('is_prebuilt', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    const message = (error as { message?: string })?.message
    if (message && message.includes('is_prebuilt')) {
      console.warn('Prebuilt decks unavailable: missing is_prebuilt column. Run the migration to add it.')
    } else {
      console.error('Error fetching prebuilt decks:', error)
    }
    return []
  }

  return (data || []).map((deck: any) => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cards: deck.cards,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at
  }))
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

  const saved = data?.[0]
  if (!saved) return null

  return {
    id: saved.id,
    title: saved.title,
    description: saved.description,
    cards: saved.cards,
    createdAt: saved.created_at,
    updatedAt: saved.updated_at
  } as DeckData
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
  date.setDate(date.getDate() - 6) // Go back 6 days (total 7 including today)
  date.setHours(0, 0, 0, 0)

  // We need to query card_completions (expensive) or user_stamina logs (if we had them).
  // For MVP, we'll try to get completions.
  const { data, error } = await supabase
    .from('card_completions')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', date.toISOString())
    .eq('action', 'learned')

  if (error) {
    console.error('Error fetching weekly progress:', error)
    return []
  }

  // Group by day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const grouped: Record<string, number> = {}
  
  // Initialize last 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = days[d.getDay()]
    grouped[dayName] = 0
  }

  data.forEach((item: any) => {
    const day = new Date(item.completed_at).getDay()
    const dayName = days[day]
    grouped[dayName] = (grouped[dayName] || 0) + 1 // Counting cards ~ 1 min per card approx?
  })

  // Format for Recharts
  // Note: This is an approximation (1 card = 1 min) for MVP
  // Ideally we track time_spent in a separate log table
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = days[d.getDay()]
    result.push({
      day: dayName,
      minutes: (grouped[dayName] || 0) * 2
    })
  }

  return result
}

/**
 * Check and return user badges based on stats
 * @param userId - User ID
 */
export async function checkBadges(userId: string): Promise<Badge[]> {
  const stats = await getUserStamina(userId)
  
  // Default values if no stats
  const totalCards = stats?.totalCardsCompleted || 0
  const totalWords = stats?.totalWordsLearned || 0
  const streak = stats?.currentStreak || 0
  const time = stats?.totalTimeSpent || 0

  const badgeDefinitions: Badge[] = [
    {
      id: 1,
      name: '3 Day Streak',
      description: 'Learn for 3 days in a row',
      icon: '🔥',
      unlocked: streak >= 3
    },
    {
      id: 2,
      name: '1,000 Words Conquered',
      description: 'Master 1000 vocabulary words',
      icon: '📚',
      unlocked: totalWords >= 1000
    },
    {
      id: 3,
      name: 'Level 5 Reached',
      description: 'Complete 25 cards',
      icon: '🎓',
      unlocked: totalCards >= 25
    },
    {
      id: 4,
      name: 'Deck Master',
      description: 'Complete 50 cards',
      icon: '🏆',
      unlocked: totalCards >= 50
    },
    {
      id: 5,
      name: '100 Hour Scholar',
      description: 'Read for 100 total hours',
      icon: '⏰',
      unlocked: time >= 6000
    },
    {
      id: 6,
      name: 'Perfect Week',
      description: 'Learn every day for a week',
      icon: '✨',
      unlocked: streak >= 7
    },
  ]

  return badgeDefinitions
}

/**
 * Delete a deck
 * @param deckId - Deck ID
 * @param userId - User ID (for verification)
 */
export async function deleteDeck(deckId: string, userId: string) {
  if (!supabase) return false

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting deck:', error)
    return false
  }

  return true
}

/**
 * Update a deck title
 * @param deckId - Deck ID
 * @param userId - User ID (for verification)
 * @param title - New title
 */
export async function updateDeckTitle(deckId: string, userId: string, title: string) {
  if (!supabase) return false

  const { error } = await supabase
    .from('decks')
    .update({
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', deckId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating deck title:', error)
    return false
  }

  return true
}
              