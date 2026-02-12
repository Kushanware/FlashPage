'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Share2, Award, TrendingUp, Zap, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getUserStamina, UserStamina } from '@/lib/supabase-client'
import { useEffect } from 'react'

// TODO: Replace with real user ID
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000'

const weeklyData = [
  { day: 'Mon', minutes: 24 },
  { day: 'Tue', minutes: 35 },
  { day: 'Wed', minutes: 28 },
  { day: 'Thu', minutes: 42 },
  { day: 'Fri', minutes: 51 },
  { day: 'Sat', minutes: 38 },
  { day: 'Sun', minutes: 55 },
]

const badges = [
  {
    id: 1,
    name: '3 Day Streak',
    description: 'Learn for 3 days in a row',
    unlocked: true,
    icon: '🔥',
  },
  {
    id: 2,
    name: '1,000 Words Conquered',
    description: 'Master 1000 vocabulary words',
    unlocked: true,
    icon: '📚',
  },
  {
    id: 3,
    name: 'Complexity Master',
    description: 'Complete 10 advanced cards',
    unlocked: false,
    icon: '🎓',
  },
  {
    id: 4,
    name: '10 Decks Completed',
    description: 'Finish 10 complete decks',
    unlocked: false,
    icon: '🏆',
  },
  {
    id: 5,
    name: '100 Hour Scholar',
    description: 'Read for 100 total hours',
    unlocked: false,
    icon: '⏰',
  },
  {
    id: 6,
    name: 'Perfect Week',
    description: 'Learn every day for a week',
    unlocked: false,
    icon: '✨',
  },
]

export function SkillTreeSection() {
  const [copiedLink, setCopiedLink] = useState(false)

  const [userStamina, setUserStamina] = useState<UserStamina | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const stats = await getUserStamina(MOCK_USER_ID)
      if (stats) {
        setUserStamina(stats)
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  // Stamina Score Calculation
  // Use DB value or default to 14 if loading/null for demo preservation
  const staminaScore = userStamina ? Math.floor(userStamina.totalCardsCompleted / 5) : 14

  const getStaminaTitle = (score: number) => {
    if (score >= 20) return 'Master Reader'
    if (score >= 15) return 'Focus Knight'
    if (score >= 10) return 'Reading Sage'
    if (score >= 5) return 'Word Warrior'
    return 'Literacy Learner'
  }

  const handleSharePortfolio = () => {
    const portfolioLink = `${window.location.origin}?portfolio=user123`
    navigator.clipboard.writeText(portfolioLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Stamina Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="p-8 border-primary/50 bg-gradient-to-br from-primary/10 via-card to-accent/5">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Stamina Info */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Stamina Score
              </p>
              <div className="space-y-2 mb-6">
                <h2 className="text-5xl font-bold text-foreground">Level {staminaScore}</h2>
                <p className="text-2xl font-semibold text-primary">{getStaminaTitle(staminaScore)}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress to Level 15</span>
                  <span className="text-sm font-semibold text-primary">75%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <BookOpen className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                <p className="text-2xl font-bold text-foreground">
                  {userStamina ? Math.floor(userStamina.totalTimeSpent / 60) + 'h' : '0h'}
                </p>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <Zap className="w-6 h-6 text-accent mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">
                  {userStamina?.currentStreak || 0} days
                </p>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Avg. Daily Time</p>
                <p className="text-2xl font-bold text-foreground">38 min</p>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <Award className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Badges Earned</p>
                <p className="text-2xl font-bold text-foreground">2 of 6</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Growth Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Minutes Read - Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Trophy Case - Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Trophy Case</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border-2 transition-all ${badge.unlocked
                  ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5'
                  : 'border-border bg-muted/50 opacity-60'
                  }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-foreground mb-1">{badge.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                {badge.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400"
                  >
                    <span>✓ Unlocked</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Shareable Skills Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Share Your Skills Portfolio</h3>
          <p className="text-muted-foreground mb-4">
            Show your teacher or learning partner your progress with a shareable link
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio?user=you`}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none"
            />
            <Button
              onClick={handleSharePortfolio}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Copy className="w-4 h-4" />
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 flex-1 border-border hover:border-primary/50 bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Share on Social
            </Button>
            <Button
              variant="outline"
              className="gap-2 flex-1 border-border hover:border-primary/50 bg-transparent"
            >
              Download Report
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Achievement Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 border-border bg-gradient-to-r from-green-50 dark:from-green-950 to-emerald-50 dark:to-emerald-950">
          <h3 className="text-lg font-semibold text-foreground mb-3">This Week's Highlights</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>
                Maintained a <span className="font-semibold text-foreground">5-day streak</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>
                Read <span className="font-semibold text-foreground">273 minutes</span> this week
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>
                Unlocked <span className="font-semibold text-foreground">1,000 Words Conquered</span>
              </span>
            </li>
          </ul>
        </Card>
      </motion.div>
    </div>
  )
}
