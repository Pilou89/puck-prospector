import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBPlayer {
  id: string;
  name: string;
  team_abbreviation: string;
  position: string | null;
  goals: number;
  assists: number;
  games_played: number;
}

export interface DBTeam {
  id: string;
  abbreviation: string;
  name: string;
  logo: string | null;
  division: string | null;
  wins: number;
  losses: number;
  otl: number;
  goals_for: number;
  goals_against: number;
}

export interface DBMatch {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export interface DBMatchEvent {
  id: string;
  match_id: string | null;
  event_type: string;
  scorer: string;
  assist1: string | null;
  assist2: string | null;
  period: number | null;
  event_time: string | null;
  team: string;
}

export function useNHLPlayers() {
  return useQuery({
    queryKey: ['nhl-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_players')
        .select('*')
        .order('goals', { ascending: false });
      
      if (error) throw error;
      return data as DBPlayer[];
    },
  });
}

export function useNHLTeams() {
  return useQuery({
    queryKey: ['nhl-teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_teams')
        .select('*')
        .order('wins', { ascending: false });
      
      if (error) throw error;
      return data as DBTeam[];
    },
  });
}

export function useNHLMatches() {
  return useQuery({
    queryKey: ['nhl-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_matches')
        .select('*')
        .order('match_date', { ascending: true });
      
      if (error) throw error;
      return data as DBMatch[];
    },
  });
}

export function useNHLEvents() {
  return useQuery({
    queryKey: ['nhl-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_match_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as DBMatchEvent[];
    },
  });
}
