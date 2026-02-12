'use client'

import { useState } from 'react'
import { LaunchpadSection } from '@/components/launchpad/launchpad-section'
import { ShortsSection } from '@/components/shorts/shorts-section'
import { SkillTreeSection } from '@/components/skill-tree/skill-tree-section'
import { Sparkles, BookOpen, TrendingUp } from 'lucide-react'

export default function Page() {
  const [activeView, setActiveView] = useState<'launchpad' | 'shorts' | 'skill-tree'>('launchpad')
  const [activeDeck, setActiveDeck] = useState<any>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Literacy Stamina</h1>
          </div>
          <p className="text-muted-foreground text-sm">Build your reading skills, one card at a time</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveView('launchpad')}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${activeView === 'launchpad'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              Launchpad
            </button>
            <button
              onClick={() => setActiveView('shorts')}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${activeView === 'shorts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              Shorts Deck
            </button>
            <button
              onClick={() => setActiveView('skill-tree')}
              className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${activeView === 'skill-tree'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Skill Tree
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeView === 'launchpad' && (
          <LaunchpadSection
            onDeckGenerated={(deck) => {
              setActiveDeck(deck)
              setActiveView('shorts')
            }}
          />
        )}
        {activeView === 'shorts' && (
          <ShortsSection
            deck={activeDeck}
            onComplete={() => setActiveView('skill-tree')}
          />
        )}
        {activeView === 'skill-tree' && <SkillTreeSection />}
      </div>
    </main>
  )
}
