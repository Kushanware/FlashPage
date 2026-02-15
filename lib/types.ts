export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Card {
  id: string
  emoji?: string
  hook: string
  meat: string
  simplified?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  isQuiz?: boolean
  quizQuestion?: string
  quizOptions?: string[]
  quizAnswer?: number
}

export interface Deck {
  id: string
  title: string
  description: string
  cards: Card[]
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

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
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
