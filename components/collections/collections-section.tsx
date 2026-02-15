'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, BookMarked, Trash2, Share2, Loader2, PencilLine } from 'lucide-react'
import { DeckData, getUserDecks, deleteDeck, updateDeckTitle } from '@/lib/supabase-client'
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

interface CollectionsSectionProps {
  onOpenDeck?: (deck: DeckData) => void
}

export function CollectionsSection({ onOpenDeck }: CollectionsSectionProps) {
  const userId = useUserId()
  const [decks, setDecks] = useState<DeckData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [renameDeckId, setRenameDeckId] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [cardCountFilter, setCardCountFilter] = useState<'all' | '0-10' | '11-20' | '21+'>('all')

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

  const handleDelete = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening deck
    if (!userId) return
    if (!confirm('Are you sure you want to delete this deck?')) return

    const success = await deleteDeck(deckId, userId)
    if (success) {
      setDecks(decks.filter((d) => d.id !== deckId))
    } else {
      alert('Failed to delete deck')
    }
  }

  const handleShare = (deck: DeckData, e: React.MouseEvent) => {
    e.stopPropagation()
    // For now, share the simplified text content or just the title/desc
    const text = `Check out my deck: ${deck.title}\n${deck.description}\n\nCreated with Flashpages`
    navigator.clipboard.writeText(text)
    alert('Deck info copied to clipboard!')
  }

  const handleOpenDeck = (deck: DeckData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (onOpenDeck) onOpenDeck(deck)
  }

  const handleOpenRename = (deck: DeckData, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameDeckId(deck.id)
    setRenameValue(deck.title || '')
    setIsRenameOpen(true)
  }

  const handleRenameSave = async () => {
    if (!userId || !renameDeckId) return
    const trimmed = renameValue.trim()
    if (!trimmed) return

    setIsRenaming(true)
    const success = await updateDeckTitle(renameDeckId, userId, trimmed)
    if (success) {
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === renameDeckId ? { ...deck, title: trimmed, updatedAt: new Date().toISOString() } : deck
        )
      )
      setIsRenameOpen(false)
    } else {
      alert('Failed to rename deck')
    }
    setIsRenaming(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredDecks = decks.filter((deck) => {
    const titleMatch = (deck.title || '').toLowerCase().includes(normalizedSearch)
    const descMatch = (deck.description || '').toLowerCase().includes(normalizedSearch)
    const searchMatch = !normalizedSearch || titleMatch || descMatch

    const count = deck.cards?.length || 0
    const countMatch =
      cardCountFilter === 'all' ||
      (cardCountFilter === '0-10' && count <= 10) ||
      (cardCountFilter === '11-20' && count >= 11 && count <= 20) ||
      (cardCountFilter === '21+' && count >= 21)

    const difficultyMatch =
      difficultyFilter === 'all' ||
      (deck.cards || []).some((card) => card.difficulty === difficultyFilter)

    return searchMatch && countMatch && difficultyMatch
  })

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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-3">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or description..."
          className="bg-card"
        />
        <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as typeof difficultyFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cardCountFilter} onValueChange={(value) => setCardCountFilter(value as typeof cardCountFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Card count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sizes</SelectItem>
            <SelectItem value="0-10">0-10 cards</SelectItem>
            <SelectItem value="11-20">11-20 cards</SelectItem>
            <SelectItem value="21+">21+ cards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collections Grid */}
      {decks.length > 0 ? (
        filteredDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  onClick={() => handleOpenDeck(deck)}
                  className="h-full flex flex-col overflow-hidden border-border hover:border-primary/50 transition-all group cursor-pointer"
                >
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
                      onClick={(e) => handleOpenDeck(deck, e)}
                    >
                      <BookMarked className="w-4 h-4 mr-1" />
                      Study
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-primary hover:text-primary bg-transparent"
                      onClick={(e) => handleOpenRename(deck, e)}
                    >
                      <PencilLine className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-primary hover:text-primary bg-transparent"
                      onClick={(e) => handleShare(deck, e)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-destructive hover:text-destructive bg-transparent"
                      onClick={(e) => handleDelete(deck.id, e)}
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
          <Card className="p-8 border-border bg-muted/30 text-center">
            <p className="text-muted-foreground">No decks match your filters. Try clearing or adjusting them.</p>
          </Card>
        )
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

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename deck</DialogTitle>
            <DialogDescription>Give your deck a clear, memorable name.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Deck title"
            maxLength={80}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSave}
              disabled={isRenaming || !renameValue.trim()}
            >
              {isRenaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
