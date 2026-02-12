# Literacy Stamina

A modern, interactive learning app built for the hackathon that helps users build reading skills and expand vocabulary through swipeable, AI-generated cards.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Next.js 16** (App Router)
- **Tailwind CSS** - Mobile-first responsive design
- **Framer Motion** - Smooth swipe card animations

### Backend & Database
- **Supabase** - PostgreSQL database for:
  - User accounts and authentication
  - Deck data (JSON structures)
  - Stamina statistics
  - Custom collections
  - Learning progress tracking

### AI Engine
- **Groq SDK** (llama-3.3-70b)
  - Generate reading comprehension cards
  - Analyze text difficulty
  - Explain vocabulary
  - Create quiz questions

### Deployment
- **Vercel** - One-click deployment with live preview

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main app with tab navigation
│   └── globals.css         # Design tokens & theming
├── components/
│   ├── launchpad/
│   │   └── launchpad-section.tsx    # Deck selection interface
│   ├── shorts/
│   │   ├── shorts-section.tsx       # Main card session
│   │   └── swipe-card.tsx          # Swipeable card component
│   ├── collections/
│   │   └── collections-section.tsx  # User collection management
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── groq-client.ts      # AI card generation (TODO: implement)
│   ├── supabase-client.ts  # Database operations (TODO: implement)
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
```

## Features

### Launchpad Page
- Welcome message with user streak counter
- Statistics display (cards completed, words learned)
- Available decks with difficulty levels
- Quick deck selection with hover effects

### Shorts Deck
- Swipeable card interface with smooth animations
- Click to flip for context/explanation
- Swipe right to mark as "learned"
- Swipe left to "skip"
- Real-time progress tracking
- Session completion screen

### Collections
- Browse user's personal collections
- Create custom decks
- Share collections with others
- Delete unwanted collections
- Quick study shortcuts

## Integration Setup

### 1. Groq AI Setup
```bash
npm install groq-sdk
```

Add to `.env.local`:
```
GROQ_API_KEY=your_groq_api_key
```

The Groq client is set up in `lib/groq-client.ts`. Uncomment the implementation to:
- Generate cards from raw text
- Analyze text difficulty
- Explain vocabulary
- Create quiz questions

### 2. Supabase Setup
```bash
npm install @supabase/supabase-js
```

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Database schema needed:
```sql
-- Users table (Supabase Auth)
-- user_stamina table
CREATE TABLE user_stamina (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users,
  total_cards_completed INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  total_time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  cards JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Card completions table
CREATE TABLE card_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users,
  deck_id UUID NOT NULL REFERENCES decks,
  card_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('learned', 'skipped')),
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  cards JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Design System

### Colors
- **Primary**: Blue (#3b82f6) - Trust, learning
- **Success**: Green (#22c55e) - Progress
- **Warning**: Amber (#f59e0b) - Caution
- **Background**: Light gray (#f8f8f8)
- **Neutrals**: Grays for text hierarchy

### Typography
- **Headings**: Geist (bold, clear)
- **Body**: Geist (readable, consistent)

### Animation
Framer Motion for:
- Card entry/exit animations
- Swipe gesture feedback
- Smooth transitions between screens
- Hover effects on interactive elements

## Future Enhancements

1. **User Authentication**
   - Supabase Auth integration
   - Social login options

2. **Advanced AI Features**
   - Dynamic difficulty adjustment
   - Personalized card generation based on learning history
   - Audio pronunciation with text-to-speech

3. **Gamification**
   - Leaderboards
   - Achievement badges
   - Daily challenges
   - Streak rewards

4. **Mobile App**
   - React Native version
   - Offline card access
   - Push notifications for daily practice

5. **Social Features**
   - Share decks with friends
   - Collaborative learning groups
   - Public deck marketplace

## Deployment

Deploy to Vercel with one click:

```bash
# Connect your GitHub repo and deploy
# Vercel will automatically detect Next.js and optimize the build
```

Environment variables will be synced from your Vercel project settings.

## License

Built for the hackathon - feel free to fork and improve!
