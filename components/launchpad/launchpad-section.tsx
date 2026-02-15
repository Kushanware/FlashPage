'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link2, Loader2, Play, Sparkles, Zap } from 'lucide-react'
import { fetchUrlTextAction, generateDeckAction } from '@/app/actions'
import { toast } from 'sonner'
import { DeckData, getPrebuiltDecks, getUserStamina, saveDeck } from '@/lib/supabase-client'
import { useUserId } from '@/hooks/use-user-id'
import { localPrebuiltDecks } from '@/lib/prebuilt-decks'

type VibeLevel = 'kid' | 'student' | 'pro'
type DifficultyMode = 'auto' | 'beginner' | 'intermediate' | 'advanced'

interface VibeOption {
  id: VibeLevel
  label: string
  emoji: string
  description: string
  systemPrompt: string
}

const vibes: VibeOption[] = [
  {
    id: 'kid',
    label: 'Kid',
    emoji: '🐥',
    description: 'Simple, fun, colorful explanations',
    systemPrompt:
      'Explain concepts in simple, fun language with emojis and relatable examples. Make learning exciting and easy to understand.',
  },
  {
    id: 'student',
    label: 'Student',
    emoji: '🎓',
    description: 'Balanced, informative approach',
    systemPrompt:
      'Provide clear, informative explanations with examples. Balance depth with accessibility. Include relevant context and connections.',
  },
  {
    id: 'pro',
    label: 'Pro',
    emoji: '💼',
    description: 'Advanced, analytical depth',
    systemPrompt:
      'Deliver sophisticated analysis with academic rigor. Include nuanced interpretations, advanced vocabulary, and professional insights.',
  },
]



interface LaunchpadSectionProps {
  onDeckGenerated?: (deck: DeckData) => void
}

export function LaunchpadSection({ onDeckGenerated }: LaunchpadSectionProps) {
  const [selectedVibe, setSelectedVibe] = useState<VibeLevel>('student')
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>('auto')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [generatedDeck, setGeneratedDeck] = useState<any>(null)
  const [prebuiltDecks, setPrebuiltDecks] = useState<DeckData[]>([])
  const [isLoadingPrebuilt, setIsLoadingPrebuilt] = useState(true)
  const [resumeDeck, setResumeDeck] = useState<DeckData | null>(null)

  const userId = useUserId()
  const [streak, setStreak] = useState(0)

  const buildDeckTitle = (text: string, cards: any[]) => {
    const cleaned = text.replace(/\s+/g, ' ').trim()
    if (cleaned.length > 0) {
      const words = cleaned.split(' ')
      const snippet = words.slice(0, 4).join(' ')
      return `${snippet}${words.length > 4 ? '...' : ''}`
    }
    if (cards?.length && cards[0]?.hook) {
      return `${cards[0].hook} Deck`
    }
    return 'AI Generated Deck'
  }

  // Fetch real streak
  useEffect(() => {
    async function loadStreak() {
      if (userId) {
        const stamina = await getUserStamina(userId)
        if (stamina) {
          setStreak(stamina.currentStreak)
        }
      }
    }
    loadStreak()
  }, [userId])

  useEffect(() => {
    const stored = localStorage.getItem('flashpages:lastDeck')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as DeckData
      if (parsed?.cards?.length) {
        setResumeDeck(parsed)
      }
    } catch {
      setResumeDeck(null)
    }
  }, [])

  useEffect(() => {
    async function loadPrebuiltDecks() {
      setIsLoadingPrebuilt(true)
      try {
        const decks = await getPrebuiltDecks()
        setPrebuiltDecks(decks)
      } catch (error) {
        console.error('Failed to load prebuilt decks', error)
      } finally {
        setIsLoadingPrebuilt(false)
      }
    }
    loadPrebuiltDecks()
  }, [])

  const handleGenerateDeck = async () => {
    if (!textInput.trim()) return

    setIsLoading(true)
    try {
      console.log('Generating deck with vibe:', selectedVibe)

      const result = await generateDeckAction(textInput, selectedVibe, difficultyMode)

      if (result.success && result.cards) {
        const deckTitle = buildDeckTitle(textInput, result.cards)
        setGeneratedDeck({
          title: deckTitle,
          cards: result.cards,
        })

        if (!userId) {
          toast.error('Unable to save deck: User ID missing')
          return
        }

        // Save to Supabase (Step 2: The Transformation)
        const savedDeck = await saveDeck(userId, {
          title: deckTitle,
          description: `Generated from text with ${selectedVibe} vibe`,
          cards: result.cards,
        })

        toast.success('Deck generated and saved!')

        // Redirect to Arena (Show step)
        if (onDeckGenerated) {
          const fallbackDeck: DeckData = {
            id: 'temp-' + Date.now(),
            title: deckTitle,
            description: `Generated from text with ${selectedVibe} vibe`,
            cards: result.cards,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // wait a brief moment to show success
          setTimeout(() => {
            onDeckGenerated(savedDeck || fallbackDeck)
          }, 1000)
        }

      } else {
        throw new Error(result.error || 'Failed to generate deck')
      }
    } catch (error) {
      console.error('Error generating deck:', error)
      toast.error('Failed to generate deck. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportUrl = async () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return

    setIsUrlLoading(true)
    try {
      const result = await fetchUrlTextAction(trimmed)
      if (result.success && result.text) {
        setTextInput(result.text)
        toast.success('Imported text from URL')
      } else {
        toast.error(result.error || 'Failed to import URL')
      }
    } catch (error) {
      console.error('Failed to import URL:', error)
      toast.error('Failed to import URL')
    } finally {
      setIsUrlLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 border border-primary/20"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">De-Boringize Your Text</h2>
              <p className="text-lg text-muted-foreground">
                Transform any boring chapter into an interactive learning deck
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent-foreground">{streak} day streak</span>
            </div>
          </div>
          {resumeDeck && (
            <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div>
                <p className="text-sm text-muted-foreground">Continue where you left off</p>
                <p className="font-semibold text-foreground">{resumeDeck.title}</p>
              </div>
              <Button
                onClick={() => onDeckGenerated && onDeckGenerated(resumeDeck)}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Vibe Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Vibe</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vibes.map((vibe) => (
              <motion.button
                key={vibe.id}
                onClick={() => setSelectedVibe(vibe.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${selectedVibe === vibe.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <div className="text-4xl mb-2">{vibe.emoji}</div>
                <h4 className="font-semibold text-foreground">{vibe.label}</h4>
                <p className="text-sm text-muted-foreground">{vibe.description}</p>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Difficulty Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Choose Difficulty</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'auto', label: 'Auto', desc: 'Match text complexity' },
              { id: 'beginner', label: 'Easy', desc: 'Simple, clear cards' },
              { id: 'intermediate', label: 'Medium', desc: 'Balanced depth' },
              { id: 'advanced', label: 'Hard', desc: 'More advanced' },
            ].map((level) => (
              <motion.button
                key={level.id}
                onClick={() => setDifficultyMode(level.id as DifficultyMode)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${difficultyMode === level.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <h4 className="font-semibold text-foreground">{level.label}</h4>
                <p className="text-xs text-muted-foreground">{level.desc}</p>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Text Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 border-border">
          <label className="block mb-3">
            <h3 className="text-lg font-semibold text-foreground mb-2">Paste Your Text</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Paste that boring chapter here... we'll do the rest.
            </p>
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your textbook chapter, article, or any boring text here... and watch it transform into an interactive learning experience!"
            className="w-full h-48 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste a URL to import text..."
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              onClick={handleImportUrl}
              disabled={!urlInput.trim() || isUrlLoading}
              variant="outline"
              className="h-11 border-border hover:border-primary/50 bg-transparent"
            >
              {isUrlLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Import URL
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {textInput.length} / 5000 characters
            </p>
            <Button
              onClick={handleGenerateDeck}
              disabled={!textInput.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating your deck...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  De-Boringize
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Loading State with Fun Facts */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className="p-8 text-center border-primary/50 bg-primary/5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">Generating your Deck...</h3>
            <p className="text-muted-foreground mb-6">
              Our AI is transforming your text into bite-sized learning cards
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              {[
                '💡 Did you know? Students retain 60% more when learning is broken into smaller chunks.',
                '🧠 Fun fact: Spaced repetition increases long-term memory retention by 2x.',
                '⚡ Reading stamina improves with consistent practice—you\'re building a superpower!',
              ].map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="text-sm text-muted-foreground p-3 bg-card rounded border border-border"
                >
                  {fact}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Generated Deck Preview */}
      {generatedDeck && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Your Deck is Ready!</h3>
                <p className="text-muted-foreground">
                  {generatedDeck.cards?.length || 0} cards generated from your text
                </p>
              </div>
              <div className="text-4xl">✨</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {generatedDeck.cards?.slice(0, 2).map((card: any, idx: number) => (
                <div key={idx} className="p-3 bg-card rounded border border-border">
                  <p className="text-sm font-semibold text-primary">{card.hook}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.meat}</p>
                </div>
              ))}
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Start Learning This Deck
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Quick Start Decks */}
      {!generatedDeck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Or Start with Pre-built Decks</h3>
            {isLoadingPrebuilt ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (() => {
              const merged = [...localPrebuiltDecks, ...prebuiltDecks]
              const seen = new Set<string>()
              const displayDecks = merged.filter((deck) => {
                const key = deck.title.toLowerCase()
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })

              return displayDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {displayDecks.map((deck) => (
                  <Button
                    key={deck.id}
                    variant="outline"
                    onClick={() => onDeckGenerated && onDeckGenerated(deck)}
                    className="p-4 h-auto flex flex-col items-start justify-between border-border hover:border-primary/50 bg-transparent"
                  >
                    <span className="font-semibold text-foreground">{deck.title}</span>
                    <div className="mt-2 space-y-1 text-left">
                      {(deck.cards || []).slice(0, 2).map((card) => (
                        <div key={card.id} className="text-xs text-muted-foreground line-clamp-1">
                          <span className="font-semibold text-foreground">{card.hook}:</span> {card.meat}
                        </div>
                      ))}
                    </div>
                    <span className="mt-2 text-xs text-muted-foreground">{deck.cards?.length || 0} cards</span>
                  </Button>
                ))}
              </div>
              ) : (
              <div className="text-sm text-muted-foreground">
                No pre-built decks yet. Mark decks in Supabase with is_prebuilt = true to show them here.
              </div>
              )
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
