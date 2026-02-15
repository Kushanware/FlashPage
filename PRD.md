# Product Requirements Document (PRD): Flashpages

## 1. Product Overview
**Product Name:** Flashpages
**Tagline:** "Turn Boring Text into Viral Shorts for Your Brain."
**Vision:** To revolutionize study habits by transforming dense, boring learning materials into addictive, TikTok-style micro-learning cards.

## 2. Problem Statement
**The Problem:** Students and lifelong learners struggle with information overload. Textbooks, long articles, and PDF notes are dense, unengaging, and difficult to retain. Traditional flashcards are static and boring.
**The Pain Point:** "I have to read this 20-page chapter, but I can't focus, and I won't remember any of it."

## 3. Solution & Value Proposition
**The Solution:** Flashpages uses AI to instantly convert any text into a "Shorts Deck"—a swipeable, gamified set of learning cards.
**Value Props:**
*   **Instant Gratification:** Paste text, get a deck in seconds.
*   **Cognitive Load Management:** The "Goldilocks Rule" ensures content is bite-sized (3-7 cards).
*   **Gamification:** Earn XP, maintain streaks, and level up your "Literacy Stamina."
*   **Vibe Check:** Choose your learning persona (Student, Kid, Pro).

## 4. Target Audience
*   **High School & College Students:** Cramming for exams, needing quick summaries.
*   **Lifelong Learners:** Trying to digest articles or technical docs quickly.
*   **Professionals:** Need to understand a brief or report without reading 50 pages.

## 5. Core Features (MVP)
### A. The Launchpad (Input)
*   **Input Mechanism:** Simple text area to paste content.
*   **Vibe Selector:**
    *   Student: Concepts & Connections (Academic focus).
    *   Kid: Visual metaphors & simple language.
    *   Pro: Implementation & logic.
*   **Action:** "Generate Deck" button triggering AI processing.

### B. The Shorts Deck (Learning Arena)
*   **Interface:** Mobile-first, swipeable card UI (Tinder/TikTok style).
*   **Card Structure:**
    *   Hook: Grab attention (max 4 words).
    *   Meat: The core lesson.
    *   Simp: "Explain Like I'm 5" toggle.
*   **Interaction:**
    *   Swipe Right: "Learned" (Earn XP).
    *   Swipe Left: "Skipped" (No XP).
*   **Completion:** Summary screen with "Deck Complete" & XP awarded.

### C. The Skill Tree (Progress Dashboard)
*   **Stamina Score:** User Level (e.g., "Level 5 - Word Warrior").
*   **Visualizations:**
    *   Progress Bar: To next level.
    *   Weekly Graph: Minutes read over the last 7 days (Real-time data).
*   **Gamification:**
    *   Streaks: Validated usage streaks.
    *   Badges: Unlockable achievements (e.g., "3 Day Streak", "1000 Words").
*   **Shareable Portfolio:** (Future) Public link to show off stats.

## 6. Technical Architecture
### Frontend
*   **Framework:** Next.js 14+ (React)
*   **Styling:** Tailwind CSS + Framer Motion (Animations)
*   **Icons:** Lucide React

### Backend & Database
*   **Database:** Supabase (PostgreSQL)
*   **Tables:** `decks`, `user_stamina`, `card_completions`.
*   **Auth:** (Planned) Supabase Auth. Currently using localized/anonymous user tracking.

### AI Engine
*   **Provider:** Groq API (Llama-3.3-70b-versatile)
*   **Logic:** Custom system prompts implementing "Cognitive Load Theory" and "Goldilocks Rule" (dynamic card count based on word count).

## 7. Future Roadmap
*   **User Accounts:** Full authentication (Email/Google).
*   **Deck Library:** Browse and search previously generated decks.
*   **Social & Community:** Share decks with friends, leaderboards.
*   **File Upload:** PDF/Docx support instead of just text paste.
*   **Spaced Repetition:** Algorithm to resurface old cards for review.
*   **Mobile App:** PWA or Native wrapper.

## 8. Success Metrics
*   **Deck Completion Rate:** % of generated decks that are swiped to completion.
*   **Retention:** Day 1, Day 7, Day 30 retention rates.
*   **Viral Coefficient:** Rate of users sharing their "Skill Tree" portfolio.