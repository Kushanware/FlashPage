'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookMarked, Trash2, Share2 } from 'lucide-react'

interface Collection {
  id: string
  title: string
  description: string
  cardCount: number
  lastUpdated: string
  color: string
}

const collections: Collection[] = [
  {
    id: '1',
    title: 'Shakespeare Collection',
    description: 'Vocabulary and themes from Shakespeare\'s works',
    cardCount: 156,
    lastUpdated: '2 days ago',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '2',
    title: 'Science Reading',
    description: 'Scientific terminology and complex text analysis',
    cardCount: 234,
    lastUpdated: '1 week ago',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '3',
    title: 'Daily Practice',
    description: 'Your personal collection of frequently missed words',
    cardCount: 89,
    lastUpdated: 'Yesterday',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: '4',
    title: 'Literature Classics',
    description: 'Key passages and vocabulary from classic novels',
    cardCount: 412,
    lastUpdated: '3 days ago',
    color: 'from-orange-500 to-red-500',
  },
]

export function CollectionsSection() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full flex flex-col overflow-hidden border-border hover:border-primary/50 transition-all group">
              {/* Color Header */}
              <div
                className={`h-28 bg-gradient-to-br ${collection.color} relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity" />
                <div className="absolute top-3 right-3">
                  <BookMarked className="w-6 h-6 text-white/80" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 flex flex-col">
                <h3 className="font-semibold text-foreground mb-1">{collection.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{collection.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mb-4">
                  <span>{collection.cardCount} cards</span>
                  <span>Updated {collection.lastUpdated}</span>
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

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center py-12"
      >
        <Card className="p-8 border-border bg-muted/30">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Want to create a custom collection? Start building your own deck to personalize your learning journey.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Create Your First Custom Collection
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
