-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR --

-- 1. Create the Profiles table to link Usernames to Auth accounts
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Create the Scores table
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level_id INT NOT NULL,
  sublevel INT NOT NULL,
  deaths INT NOT NULL,
  time_ms INT NOT NULL,
  total_score BIGINT NOT NULL, -- (deaths * 1000000) + time_ms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, level_id) -- Only store ONE best score per level per user
);

-- Turn on RLS for scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scores
CREATE POLICY "Scores are viewable by everyone." 
  ON public.scores FOR SELECT USING (true);

-- Allow authenticated users to insert their own scores
CREATE POLICY "Users can insert their own scores." 
  ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own scores (for beating personal bests)
CREATE POLICY "Users can update their own scores." 
  ON public.scores FOR UPDATE USING (auth.uid() = user_id);


-- 3. Automatic Profile Creation Trigger
-- When a user signs up via OTP, this trigger automatically creates a profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We extract a default username from their email or let the frontend update it later
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
