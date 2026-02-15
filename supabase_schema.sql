-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Decks Table
create table if not exists decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid, -- We'll update this to meaningful auth.users reference later
  title text not null,
  description text,
  cards jsonb not null default '[]'::jsonb,
  is_prebuilt boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Stamina Table
create table if not exists user_stamina (
  user_id uuid primary key,
  total_cards_completed integer default 0,
  total_words_learned integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  total_time_spent integer default 0,
  last_activity_date timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Card Completions Table (for detailed tracking)
create table if not exists card_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  deck_id text not null, -- Storing as text to be flexible with ID types
  card_id text not null,
  action text not null, -- 'learned' or 'skipped'
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) but allow public access for now (since we use MOCK_USER)
alter table decks enable row level security;
alter table user_stamina enable row level security;
alter table card_completions enable row level security;

-- Create policies to allow all operations (TEMPORARY: FOR DEV ONLY)
create policy "Allow all operations on decks" on decks for all using (true) with check (true);
create policy "Allow all operations on user_stamina" on user_stamina for all using (true) with check (true);
create policy "Allow all operations on card_completions" on card_completions for all using (true) with check (true);
