-- Create table for NHL teams
CREATE TABLE public.nhl_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  abbreviation TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo TEXT,
  division TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  otl INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for NHL players
CREATE TABLE public.nhl_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_abbreviation TEXT NOT NULL,
  position TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for matches
CREATE TABLE public.nhl_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for match events (goals with scorers and assists)
CREATE TABLE public.nhl_match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.nhl_matches(id) ON DELETE CASCADE,
  event_type TEXT DEFAULT 'goal',
  scorer TEXT NOT NULL,
  assist1 TEXT,
  assist2 TEXT,
  period INTEGER,
  event_time TEXT,
  team TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for sheet sync settings
CREATE TABLE public.sheet_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sheet_id TEXT NOT NULL,
  sheet_name TEXT DEFAULT 'Sheet1',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nhl_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhl_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhl_match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_settings ENABLE ROW LEVEL SECURITY;

-- Create public read policies for stats (anyone can view)
CREATE POLICY "Anyone can view teams" ON public.nhl_teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON public.nhl_players FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON public.nhl_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON public.nhl_match_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view sheet settings" ON public.sheet_settings FOR SELECT USING (true);

-- Create insert/update/delete policies for edge functions (using service role)
CREATE POLICY "Service role can manage teams" ON public.nhl_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage players" ON public.nhl_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage matches" ON public.nhl_matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage events" ON public.nhl_match_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage sheet settings" ON public.sheet_settings FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_nhl_teams_updated_at BEFORE UPDATE ON public.nhl_teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nhl_players_updated_at BEFORE UPDATE ON public.nhl_players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nhl_matches_updated_at BEFORE UPDATE ON public.nhl_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sheet_settings_updated_at BEFORE UPDATE ON public.sheet_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();