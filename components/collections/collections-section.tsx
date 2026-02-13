'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookMarked, Trash2, Share2, Loader2 } from 'lucide-react'
import { DeckData, getUserDecks } from '@/lib/supabase-client'
import { useUserId } from '@/hooks/use-user-id'
import { formatDistanceToNow } from 'date-fns'

// Helper to generate consistent gradients based on string
const getGradient = (str: string) => {
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-teal-400 to-blue-500',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

export function CollectionsSection() {
  const userId = useUserId()
  const [decks, setDecks] = useState<DeckData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDecks() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const userDecks = await getUserDecks(userId)
        // Sort by newest first
        const sortedDecks = userDecks.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setDecks(sortedDecks)
      } catch (error) {
        console.error('Failed to load decks', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDecks()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Collections</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Organize and personalize your learning decks
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-border hover:border-primary/50 transition-all group">
                {/* Color Header */}
                <div
                  className={`h-28 bg-gradient-to-br ${getGradient(deck.title || deck.id)} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity" />
                  <div className="absolute top-3 right-3">
                    <BookMarked className="w-6 h-6 text-white/80" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{deck.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                    {deck.description || 'No description'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mb-4">
                    <span>{deck.cards?.length || 0} cards</span>
                    <span>
                      {deck.createdAt ? formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true }) : 'Unknown date'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border hover:border-primary hover:text-primary bg-transparent"
                    >
                      <BookMarked className="w-4 h-4 mr-1" />
                      Study
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-primary hover:text-primary bg-transparent"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center py-12"
        >
          <Card className="p-8 border-border bg-muted/30">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You haven't generated any decks yet. Go to the Launchpad to create your first one!
              </p>
              {/* Could link back to Launchpad but for now just text */}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
