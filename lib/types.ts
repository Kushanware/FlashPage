export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Card {
  id: string
  content: string
  context?: string
  category: string
  difficulty: Difficulty
}

export interface Deck {
  id: string
  title: string
  description: string
  cards: Card[]
  cardCount: number
  difficulty: Difficulty
  colorClass: string
  createdAt?: string
  updatedAt?: string
}

export interface Collection {
  id: string
  title: string
  description: string
  cards: Card[]
  cardCount: number
  color: string
  lastUpdated: string
  userId?: string
}

export interface UserStats {
  totalCardsCompleted: number
  totalWordsLearned: number
  currentStreak: number
  longestStreak: number
  consistencyPercentage: number
  thisWeekCards: number
  totalTimeSpent: string
}

export interface SessionStats {
  learned: number
  skipped: number
  total: number
  completionTime: number
}
