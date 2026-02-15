const { createClient } = require('@supabase/supabase-js')
const { randomUUID } = require('crypto')
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const idx = args.indexOf(name)
  if (idx === -1 || !args[idx + 1]) return fallback
  return args[idx + 1]
}

const hasFlag = (name) => args.includes(name)

const userId = getArg('--user', 'f2187c42-4586-482b-bfff-bbf476dd6193')
const shouldReset = hasFlag('--reset')

const deckCount = 10
const completionCount = 120
const daysBack = 30

const categories = ['Vocabulary', 'Reading', 'Comprehension', 'Analysis', 'Science', 'History']
const difficulties = ['beginner', 'intermediate', 'advanced']

const hooks = [
  'Gravity Basics',
  'Ancient Egypt',
  'Metaphor Magic',
  'Ecosystem Essentials',
  'Civil Rights',
  'Fractions Fun',
  'States of Matter',
  'Poetry Pulse',
  'Energy Flow',
  'World War II',
  'Photosynthesis',
  'Probability Play',
  'Story Structure',
  'Plate Tectonics',
  'The Water Cycle',
]

const meats = [
  'A clear, student-friendly explanation with a real-world example that keeps it short and punchy.',
  'A quick breakdown of the idea with one key fact and a simple analogy.',
  'A short definition plus a practical use case in daily life or a classroom example.',
  'A summary that focuses on the main concept and why it matters in one sentence.',
]

const simplifieds = [
  'Short and simple version for quick understanding.',
  'Easy explanation in plain words.',
  'Quick version: just the main idea.',
]

const makeCard = (seed, index) => {
  const hook = hooks[(seed + index) % hooks.length]
  const category = categories[(seed + index) % categories.length]
  const difficulty = difficulties[(seed + index) % difficulties.length]

  return {
    id: randomUUID(),
    hook,
    meat: meats[(seed + index) % meats.length],
    simplified: simplifieds[(seed + index) % simplifieds.length],
    category,
    difficulty,
  }
}

const makeDecks = () => {
  const decks = []
  for (let i = 0; i < deckCount; i += 1) {
    const title = `Mock Deck ${i + 1}`
    const description = `Mock data deck ${i + 1} for testing collections and shorts.`
    const cardCount = 6 + (i % 3)
    const cards = Array.from({ length: cardCount }, (_, idx) => makeCard(i, idx))

    decks.push({
      user_id: userId,
      title,
      description,
      cards,
    })
  }
  return decks
}

const randomDateWithinDays = (days) => {
  const now = Date.now()
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)
  return new Date(now - offset)
}

const buildCompletions = (savedDecks) => {
  const completions = []

  for (let i = 0; i < completionCount; i += 1) {
    const deck = savedDecks[i % savedDecks.length]
    const cards = Array.isArray(deck.cards) ? deck.cards : []
    const card = cards[i % cards.length]
    const action = Math.random() < 0.8 ? 'learned' : 'skipped'

    completions.push({
      user_id: userId,
      deck_id: deck.id,
      card_id: card?.id || `card-${i + 1}`,
      action,
      completed_at: randomDateWithinDays(daysBack).toISOString(),
    })
  }

  return completions
}

const computeStreaks = (completions) => {
  const daysWithActivity = new Set()

  completions.forEach((entry) => {
    const d = new Date(entry.completed_at)
    d.setHours(0, 0, 0, 0)
    daysWithActivity.add(d.getTime())
  })

  const sortedDays = Array.from(daysWithActivity).sort((a, b) => b - a)
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0

  for (let i = 0; i < sortedDays.length; i += 1) {
    if (i === 0) {
      streak = 1
      currentStreak = 1
      longestStreak = 1
      continue
    }

    const diffDays = Math.round((sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak += 1
    } else {
      streak = 1
    }

    if (i === 1) {
      currentStreak = streak
    }

    if (streak > longestStreak) longestStreak = streak
  }

  return { currentStreak, longestStreak }
}

const run = async () => {
  if (shouldReset) {
    await supabase.from('card_completions').delete().eq('user_id', userId)
    await supabase.from('decks').delete().eq('user_id', userId)
    await supabase.from('user_stamina').delete().eq('user_id', userId)
  }

  const { data: decksData, error: decksError } = await supabase
    .from('decks')
    .insert(makeDecks())
    .select('id, title, cards')

  if (decksError) {
    console.error('Failed to insert decks:', decksError)
    process.exit(1)
  }

  const completions = buildCompletions(decksData || [])
  const learnedCount = completions.filter((c) => c.action === 'learned').length
  const totalTimeMinutes = learnedCount * 2
  const totalWordsLearned = learnedCount * 20
  const { currentStreak, longestStreak } = computeStreaks(completions)
  const lastActivity = completions.reduce((latest, entry) => {
    const ts = new Date(entry.completed_at).getTime()
    return ts > latest ? ts : latest
  }, 0)

  const { error: completionsError } = await supabase
    .from('card_completions')
    .insert(completions)

  if (completionsError) {
    console.error('Failed to insert completions:', completionsError)
    process.exit(1)
  }

  const { error: staminaError } = await supabase
    .from('user_stamina')
    .upsert({
      user_id: userId,
      total_cards_completed: learnedCount,
      total_words_learned: totalWordsLearned,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_time_spent: totalTimeMinutes,
      last_activity_date: new Date(lastActivity || Date.now()).toISOString(),
    })

  if (staminaError) {
    console.error('Failed to upsert user_stamina:', staminaError)
    process.exit(1)
  }

  console.log('Mock data inserted')
  console.log(`User: ${userId}`)
  console.log(`Decks: ${decksData?.length || 0}`)
  console.log(`Completions: ${completions.length}`)
  console.log(`Total time: ${totalTimeMinutes} minutes`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
