'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react'

import { Card as FlashCard } from '@/lib/types'

interface SwipeCardProps {
  card: FlashCard
  onLearn: () => void
  onSkip: () => void
  onShowSimplified: () => void
  showSimplified: boolean
  index: number
}

export function SwipeCard({
  card,
  onLearn,
  onSkip,
  onShowSimplified,
  showSimplified,
  index,
}: SwipeCardProps) {
  const [dragX, setDragX] = useState(0)

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50
    const velocity = info.velocity.x
    const distance = info.offset.x

    if (velocity > 500 || distance > swipeThreshold) {
      onLearn()
    } else if (velocity < -500 || distance < -swipeThreshold) {
      onShowSimplified()
    }
  }

  const opacityRight = dragX > 0 ? Math.min(dragX / 100, 1) : 0
  const opacityLeft = dragX < 0 ? Math.min(Math.abs(dragX) / 100, 1) : 0

  const difficultyColor = {
    beginner: 'from-green-500 to-green-600',
    intermediate: 'from-yellow-500 to-yellow-600',
    advanced: 'from-red-500 to-red-600',
  }

  return (
    <motion.div
      drag="x"
      dragElastic={0.2}
      dragConstraints={{ left: -100, right: 100 }}
      onDrag={(e, info) => {
        setDragX(info.offset.x)
      }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="w-full max-w-2xl mx-auto cursor-grab active:cursor-grabbing"
    >
      <Card
        className={`relative h-[600px] border-2 overflow-hidden shadow-lg hover:shadow-xl transition-all ${showSimplified
          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5'
          : `border-border bg-gradient-to-br ${difficultyColor[card.difficulty]}/10`
          }`}
      >
        {/* Right Swipe Indicator (Learn) */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-green-500/10 pointer-events-none"
          style={{ opacity: opacityRight }}
        >
          <div className="absolute top-0 left-0 text-white text-8xl font-bold opacity-20 p-4">✓</div>
        </motion.div>

        {/* Left Swipe Indicator (Simplified) */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-blue-500/10 pointer-events-none"
          style={{ opacity: opacityLeft }}
        >
          <div className="absolute top-0 right-0 text-white text-8xl font-bold opacity-20 p-4 rotate-12">
            ?
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="h-full p-8 flex flex-col justify-between relative z-10">
          {/* Image Section */}
          {card.imagePrompt && !showSimplified && (
            <div className="w-full h-48 mb-4 shrink-0 rounded-lg overflow-hidden bg-black/20 relative group">
              <img
                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card.imagePrompt.replace(/["']/g, ''))}?width=600&height=400&seed=${card.id}&model=flux`}
                alt={card.hook}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 shadow-md"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/20', 'to-accent/20');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                AI Generated
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {card.category}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${card.difficulty === 'beginner'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                : card.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                }`}
            >
              {card.difficulty}
            </span>
          </div>

          {/* Main Content */}
          <motion.div
            className="flex-1 flex flex-col justify-center items-center text-center space-y-4"
            animate={{ opacity: showSimplified ? 1 : 1 }}
          >
            {!showSimplified ? (
              <>
                {/* Hook */}
                <motion.h3
                  className="text-5xl font-bold text-foreground leading-tight text-balance"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {card.hook}
                </motion.h3>

                {/* Meat */}
                <motion.p
                  className="text-sm text-muted-foreground leading-relaxed max-w-sm line-clamp-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {card.meat}
                </motion.p>
              </>
            ) : (
              <>
                {/* Simplified View */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Lightbulb className="w-12 h-12 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">{card.hook}</h3>
                  <p className="text-lg text-primary leading-relaxed max-w-sm font-semibold">
                    {card.simplified}
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Footer - Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/50">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onSkip()
                }}
                variant="outline"
                className="gap-2 border-border hover:border-destructive hover:text-destructive"
              >
                <ThumbsDown className="w-4 h-4" />
                Skip
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onLearn()
                }}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <ThumbsUp className="w-4 h-4" />
                Learn
              </Button>
            </motion.div>
          </div>

          {/* Instructions */}
          {!showSimplified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 right-4 text-xs text-muted-foreground"
            >
              Swipe left for help
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div >
  )
}
