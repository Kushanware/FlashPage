'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Lightbulb, Sparkles } from 'lucide-react'

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

  const difficultyTheme = {
    beginner: {
      gradient: 'from-emerald-400 via-lime-400 to-yellow-300',
      glow: 'shadow-[0_0_40px_rgba(34,197,94,0.45)]',
      orb: 'bg-emerald-200/60',
      orbAlt: 'bg-yellow-200/60',
      badge: 'bg-emerald-900/25',
    },
    intermediate: {
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      glow: 'shadow-[0_0_40px_rgba(59,130,246,0.5)]',
      orb: 'bg-sky-200/60',
      orbAlt: 'bg-indigo-200/60',
      badge: 'bg-sky-900/25',
    },
    advanced: {
      gradient: 'from-rose-400 via-fuchsia-500 to-purple-600',
      glow: 'shadow-[0_0_40px_rgba(236,72,153,0.55)]',
      orb: 'bg-rose-200/60',
      orbAlt: 'bg-purple-200/60',
      badge: 'bg-rose-900/25',
    },
  }

  const theme = difficultyTheme[card.difficulty] ?? difficultyTheme.intermediate

  const categoryStickers: Record<string, string[]> = {
    Vocabulary: ['✨', '🧠', '📚'],
    Reading: ['🔍', '📖', '💡'],
    Comprehension: ['✅', '🧩', '⭐'],
    Analysis: ['🧪', '🧭', '⚡'],
    Default: ['⭐', '✨', '🎯'],
  }

  const stickers = categoryStickers[card.category] ?? categoryStickers.Default

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
        className={`relative h-[70vh] min-h-[600px] overflow-hidden rounded-[28px] border-4 border-white/80 text-white shadow-2xl transition-all ${showSimplified
          ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600'
          : `bg-gradient-to-br ${theme.gradient}`
          } ${theme.glow}`}
      >
        {/* Background Layers */}
        <div className="absolute inset-0">
          <div className={`absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl ${theme.orb}`} />
          <div className={`absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl ${theme.orbAlt}`} />
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.35),transparent_50%)]" />
          <div className="absolute inset-0 opacity-50 mix-blend-soft-light bg-[linear-gradient(120deg,rgba(255,255,255,0.4),transparent_40%,rgba(255,255,255,0.25))]" />
        </div>

        {/* Sticker Pack */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute left-6 top-20 rotate-[-8deg] text-2xl sm:text-3xl drop-shadow">{stickers[0]}</span>
          <span className="absolute right-8 top-32 rotate-[10deg] text-3xl sm:text-4xl drop-shadow">{stickers[1]}</span>
          <span className="absolute left-10 bottom-24 rotate-[6deg] text-2xl sm:text-3xl drop-shadow">{stickers[2]}</span>
        </div>

        {/* Right Swipe Indicator (Learn) */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-white/20 pointer-events-none"
          style={{ opacity: opacityRight }}
        >
          <div className="absolute top-0 left-0 text-white text-9xl font-bold opacity-40 p-4">✓</div>
        </motion.div>

        {/* Left Swipe Indicator (Simplified) */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-white/20 pointer-events-none"
          style={{ opacity: opacityLeft }}
        >
          <div className="absolute top-0 right-0 text-white text-9xl font-bold opacity-40 p-4 rotate-12">
            ?
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="h-full p-8 flex flex-col justify-between relative z-10">
          {/* Image Section */}

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider text-white/95 ${theme.badge} px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-md`}>
              {card.category}
            </span>
            <span
              className="text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30 shadow-sm"
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
                  className="text-5xl sm:text-6xl font-black font-fredoka text-white leading-tight text-balance drop-shadow-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {card.hook}
                </motion.h3>

                {/* Meat */}
                <motion.p
                  className="text-lg sm:text-xl font-semibold text-white/95 leading-relaxed max-w-sm line-clamp-5 drop-shadow-sm"
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
                  <Lightbulb className="w-16 h-16 text-yellow-300 fill-yellow-300 drop-shadow-lg" />
                  <h3 className="text-3xl font-bold font-fredoka text-white">{card.hook}</h3>
                  <p className="text-xl sm:text-2xl text-white leading-relaxed max-w-sm font-bold bg-white/15 p-4 rounded-2xl backdrop-blur-md border border-white/30">
                    {card.simplified}
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Footer - Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/20">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onSkip()
                }}
                variant="outline"
                className="gap-2 border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-full px-6 py-5 text-base font-bold"
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
                className="gap-2 bg-white text-black hover:bg-white/90 font-bold shadow-lg rounded-full px-6 py-5 text-base"
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
              className="absolute bottom-4 right-4 text-xs text-white/80 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Swipe left for help
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div >
  )
}
