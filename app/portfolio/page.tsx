'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SkillTreeSection } from '@/components/skill-tree/skill-tree-section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function PortfolioContent() {
  const searchParams = useSearchParams()
  const user = searchParams.get('user')

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">Please provide a valid user ID.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Learner Portfolio
        </h1>
      </div>
      <SkillTreeSection userId={user} />
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<div>Loading portfolio...</div>}>
        <PortfolioContent />
      </Suspense>
    </div>
  )
}
