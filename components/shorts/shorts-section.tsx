'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SwipeCard } from './swipe-card'
import { Clock, RotateCcw, Volume2, Sparkles } from 'lucide-react'
import { recordCardCompletion, updateUserStamina } from '@/lib/supabase-client'

// TODO: Replace with real user ID from auth context
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000'
// const MOCK_DECK_ID = '123' // Removed, using actual deck ID if available

interface ShortsSectionProps {
  deck?: any
  onComplete?: () => void
}

interface ShortCard {
  id: string
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

const mockCards: ShortCard[] = [
  {
    id: '1',
    hook: 'Ephemeral',
    meat: 'Ephemeral means something that lasts for a very short time. Like cherry blossoms that bloom and fall within weeks, or a mayfly that lives only one day. This word is often used in philosophical contexts to describe the fleeting nature of beauty and life.',
    simplified: 'Something that doesn\'t last long; temporary.',
    category: 'Vocabulary',
    difficulty: 'intermediate',
  },
  {
    id: '2',
    hook: 'Inclement Weather',
    meat: 'Inclement weather describes harsh, rough, or stormy conditions—rain, snow, strong winds. Explorers and sailors must prepare carefully for inclement weather as it can be dangerous. Understanding this term helps in reading travel narratives and scientific texts.',
    simplified: 'Bad or harsh weather.',
    category: 'Reading',
    difficulty: 'intermediate',
  },
  {
    id: '3',
    hook: 'Quiz: Which word fits here?',
    meat: 'The festival only lasted three days, making it a truly _____ event.',
    simplified: '',
    category: 'Comprehension',
    difficulty: 'beginner',
    isQuiz: true,
    quizQuestion: 'Which word best fits in the blank?',
    quizOptions: ['ephemeral', 'inclement', 'propensity', 'luminescent'],
    quizAnswer: 0,
  },
  {
    id: '4',
    hook: 'Propensity',
    meat: 'Propensity refers to a tendency or inclination to act in a certain way. "He has a propensity for conflict" means he tends to get into fights. This is a useful word for character analysis in literature and understanding human behavior patterns.',
    simplified: 'A natural tendency or habit.',
    category: 'Analysis',
    difficulty: 'intermediate',
  },
  {
    id: '5',
    hook: 'Luminescent',
    meat: 'Luminescent describes something that produces light without heat—like fireflies or certain deep-sea creatures. This term is crucial in scientific writing. Many organisms in dark environments are luminescent to communicate or attract prey.',
    simplified: 'Something that glows or produces light.',
    category: 'Vocabulary',
    difficulty: 'intermediate',
  },
  {
    id: '6',
    hook: 'Quiz: True or False?',
    meat: 'All luminescent organisms live in the deep ocean.',
    simplified: '',
    category: 'Comprehension',
    difficulty: 'beginner',
    isQuiz: true,
    quizQuestion: 'Is this statement true or false?',
    quizOptions: ['True', 'False'],
    quizAnswer: 1,
  },
  {
    id: '7',
    hook: 'Perspicacious',
    meat: 'Perspicacious means having keen insight and the ability to understand things deeply. A perspicacious author reveals truths about human nature. This advanced vocabulary word is common in literary analysis and academic writing.',
    simplified: 'Having good judgment and keen insight.',
    category: 'Vocabulary',
    difficulty: 'advanced',
  },
]

export function ShortsSection({ deck, onComplete }: ShortsSectionProps) {
  const [cards, setCards] = useState<ShortCard[]>(deck?.cards || mockCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSimplified, setShowSimplified] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [stats, setStats] = useState({ learned: 0, skipped: 0, timeElapsed: 0 })
  const [xp, setXp] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentCard = cards[currentIndex]

  const handleCardAction = async (action: 'learned' | 'skipped') => {
    setShowSimplified(false)
    setQuizAnswer(null)

    // Fire and forget progress tracking (BATCHED NOW)
    // We only update local state here, DB update happens at end
    /* 
    if (currentCard) {
      recordCardCompletion(MOCK_USER_ID, MOCK_DECK_ID, currentCard.id.toString(), action)
      if (action === 'learned') {
        updateUserStamina(MOCK_USER_ID, 1, 15) // Assume 15 words per card for now
      }
    }
    */

    if (currentIndex < cards.length) {
      setStats((prev) => ({
        ...prev,
        learned: action === 'learned' ? prev.learned + 1 : prev.learned,
        skipped: action === 'skipped' ? prev.skipped + 1 : prev.skipped,
      }))
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleQuizSubmit = (optionIndex: number) => {
    setQuizAnswer(optionIndex)
    if (currentCard && optionIndex === currentCard.quizAnswer) {
      setXp(prev => prev + 50)
      // toast.success('Correct! +50 XP') // Optional: add toast
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // Batch update Supabase
      // 1 Card = 1 Stamina point (roughly)
      // XP maps to "wordsLearned" for now in our simple schema
      await updateUserStamina(MOCK_USER_ID, stats.learned, xp)

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    // Legacy reset, maybe redirect instead?
    if (onComplete) onComplete()
    else {
      setCurrentIndex(0)
      setShowSimplified(false)
      setQuizAnswer(null)
      setStats({ learned: 0, skipped: 0, timeElapsed: 0 })
      setXp(0)
    }
  }

  const isComplete = currentIndex >= cards.length
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-semibold">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(stats.timeElapsed)}</span>
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Progress</p>
          <p className="text-2xl font-bold text-primary">
            {currentIndex + 1}/{cards.length}
          </p>
        </Card>
        <Card className="p-4 border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Learned</p>
          <p className="text-2xl font-bold text-green-600">{stats.learned}</p>
        </Card>
        <Card className="p-4 border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Skipped</p>
          <p className="text-2xl font-bold text-orange-600">{stats.skipped}</p>
        </Card>
      </div>

      {/* Swipe Card Section */}
      <div className="relative min-h-96 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isComplete && currentCard ? (
            <div key={currentCard.id} className="w-full">
              {!currentCard.isQuiz ? (
                <SwipeCard
                  card={currentCard}
                  onLearn={() => handleCardAction('learned')}
                  onSkip={() => handleCardAction('skipped')}
                  onShowSimplified={() => setShowSimplified(!showSimplified)}
                  showSimplified={showSimplified}
                  index={currentIndex}
                />
              ) : (
                /* Quiz Card */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-2xl mx-auto"
                >
                  <Card className="p-8 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Boss Card: Test Yourself</h3>
                      <p className="text-muted-foreground">{currentCard.quizQuestion}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {currentCard.quizOptions?.map((option, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => handleQuizSubmit(idx)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={quizAnswer !== null}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${quizAnswer === idx
                            ? idx === currentCard.quizAnswer
                              ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'border-red-500 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                            : quizAnswer !== null && idx === currentCard.quizAnswer
                              ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              : 'border-border hover:border-primary/50 bg-card text-foreground'
                            }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>

                    {quizAnswer !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg mb-6 ${quizAnswer === currentCard.quizAnswer
                          ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                          : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                          }`}
                      >
                        {quizAnswer === currentCard.quizAnswer ? (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <p className="font-semibold">Correct! +50 XP</p>
                          </div>
                        ) : (
                          <p className="font-semibold">Not quite. The correct answer was: {currentCard.quizOptions?.[currentCard.quizAnswer!]}</p>
                        )}
                      </motion.div>
                    )}

                    {quizAnswer !== null && (
                      <Button
                        onClick={() => handleCardAction('learned')}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Continue
                      </Button>
                    )}
                  </Card>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <Card className="p-12 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 max-w-md">
                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h3>
                <p className="text-muted-foreground mb-6">
                  You learned <span className="font-semibold text-primary">{stats.learned}</span> cards in{' '}
                  <span className="font-semibold text-primary">{formatTime(stats.timeElapsed)}</span>
                </p>
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Saving...' : 'Claim Rewards'}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Info */}
      {!isComplete && currentCard && !currentCard.isQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between text-sm text-muted-foreground px-4 py-3 rounded-lg bg-muted/30 border border-border"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span>Swipe right to learn, left for simplified view</span>
          </div>
          <span className="text-xs">Difficulty: {currentCard.difficulty}</span>
        </motion.div>
      )}
    </div>
  )
}
