// Mock NHL data for demonstration
export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  goals: number;
  assists: number;
  points: number;
  gamesPlayed: number;
  pointsPerGame: number;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  wins: number;
  losses: number;
  otl: number;
  goalsFor: number;
  goalsAgainst: number;
  division: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal';
  scorer: string;
  assist1?: string;
  assist2?: string;
  period: number;
  time: string;
  team: string;
}

export const teams: Team[] = [
  { id: '1', name: 'Toronto Maple Leafs', abbreviation: 'TOR', logo: '🍁', wins: 35, losses: 18, otl: 5, goalsFor: 198, goalsAgainst: 165, division: 'Atlantic' },
  { id: '2', name: 'Boston Bruins', abbreviation: 'BOS', logo: '🐻', wins: 38, losses: 14, otl: 6, goalsFor: 212, goalsAgainst: 148, division: 'Atlantic' },
  { id: '3', name: 'Florida Panthers', abbreviation: 'FLA', logo: '🐆', wins: 36, losses: 17, otl: 5, goalsFor: 205, goalsAgainst: 170, division: 'Atlantic' },
  { id: '4', name: 'Tampa Bay Lightning', abbreviation: 'TBL', logo: '⚡', wins: 32, losses: 20, otl: 6, goalsFor: 190, goalsAgainst: 175, division: 'Atlantic' },
  { id: '5', name: 'Edmonton Oilers', abbreviation: 'EDM', logo: '🛢️', wins: 37, losses: 16, otl: 5, goalsFor: 225, goalsAgainst: 180, division: 'Pacific' },
  { id: '6', name: 'Colorado Avalanche', abbreviation: 'COL', logo: '🏔️', wins: 34, losses: 19, otl: 5, goalsFor: 208, goalsAgainst: 172, division: 'Central' },
  { id: '7', name: 'Dallas Stars', abbreviation: 'DAL', logo: '⭐', wins: 36, losses: 15, otl: 7, goalsFor: 195, goalsAgainst: 155, division: 'Central' },
  { id: '8', name: 'New York Rangers', abbreviation: 'NYR', logo: '🗽', wins: 35, losses: 17, otl: 6, goalsFor: 202, goalsAgainst: 168, division: 'Metropolitan' },
];

export const players: Player[] = [
  { id: '1', name: 'Auston Matthews', team: 'TOR', position: 'C', goals: 45, assists: 35, points: 80, gamesPlayed: 58, pointsPerGame: 1.38 },
  { id: '2', name: 'Mitch Marner', team: 'TOR', position: 'RW', goals: 22, assists: 58, points: 80, gamesPlayed: 58, pointsPerGame: 1.38 },
  { id: '3', name: 'Connor McDavid', team: 'EDM', position: 'C', goals: 42, assists: 68, points: 110, gamesPlayed: 58, pointsPerGame: 1.90 },
  { id: '4', name: 'Leon Draisaitl', team: 'EDM', position: 'C', goals: 40, assists: 52, points: 92, gamesPlayed: 58, pointsPerGame: 1.59 },
  { id: '5', name: 'David Pastrnak', team: 'BOS', position: 'RW', goals: 44, assists: 40, points: 84, gamesPlayed: 58, pointsPerGame: 1.45 },
  { id: '6', name: 'Nathan MacKinnon', team: 'COL', position: 'C', goals: 38, assists: 55, points: 93, gamesPlayed: 58, pointsPerGame: 1.60 },
  { id: '7', name: 'Nikita Kucherov', team: 'TBL', position: 'RW', goals: 35, assists: 65, points: 100, gamesPlayed: 58, pointsPerGame: 1.72 },
  { id: '8', name: 'Matthew Tkachuk', team: 'FLA', position: 'LW', goals: 30, assists: 55, points: 85, gamesPlayed: 58, pointsPerGame: 1.47 },
  { id: '9', name: 'Sam Reinhart', team: 'FLA', position: 'C', goals: 42, assists: 38, points: 80, gamesPlayed: 58, pointsPerGame: 1.38 },
  { id: '10', name: 'Artemi Panarin', team: 'NYR', position: 'LW', goals: 32, assists: 58, points: 90, gamesPlayed: 58, pointsPerGame: 1.55 },
  { id: '11', name: 'Jason Robertson', team: 'DAL', position: 'LW', goals: 38, assists: 42, points: 80, gamesPlayed: 58, pointsPerGame: 1.38 },
  { id: '12', name: 'Roope Hintz', team: 'DAL', position: 'C', goals: 28, assists: 35, points: 63, gamesPlayed: 58, pointsPerGame: 1.09 },
];

export const upcomingMatches: Match[] = [
  { id: '1', homeTeam: 'TOR', awayTeam: 'BOS', date: '2026-02-03', time: '19:00', status: 'upcoming' },
  { id: '2', homeTeam: 'EDM', awayTeam: 'COL', date: '2026-02-03', time: '21:00', status: 'upcoming' },
  { id: '3', homeTeam: 'FLA', awayTeam: 'TBL', date: '2026-02-04', time: '19:30', status: 'upcoming' },
  { id: '4', homeTeam: 'DAL', awayTeam: 'NYR', date: '2026-02-04', time: '20:00', status: 'upcoming' },
  { id: '5', homeTeam: 'BOS', awayTeam: 'FLA', date: '2026-02-05', time: '19:00', status: 'upcoming' },
  { id: '6', homeTeam: 'COL', awayTeam: 'TOR', date: '2026-02-05', time: '21:00', status: 'upcoming' },
];

export const recentEvents: MatchEvent[] = [
  { id: '1', matchId: 'prev1', type: 'goal', scorer: 'Auston Matthews', assist1: 'Mitch Marner', assist2: 'William Nylander', period: 1, time: '08:32', team: 'TOR' },
  { id: '2', matchId: 'prev1', type: 'goal', scorer: 'Connor McDavid', assist1: 'Leon Draisaitl', period: 2, time: '14:15', team: 'EDM' },
  { id: '3', matchId: 'prev2', type: 'goal', scorer: 'David Pastrnak', assist1: 'Brad Marchand', assist2: 'Charlie McAvoy', period: 1, time: '05:48', team: 'BOS' },
  { id: '4', matchId: 'prev2', type: 'goal', scorer: 'Sam Reinhart', assist1: 'Matthew Tkachuk', period: 3, time: '12:22', team: 'FLA' },
  { id: '5', matchId: 'prev3', type: 'goal', scorer: 'Nathan MacKinnon', assist1: 'Mikko Rantanen', assist2: 'Cale Makar', period: 2, time: '09:45', team: 'COL' },
];

// Helper to get team by abbreviation
export const getTeamByAbbr = (abbr: string): Team | undefined => {
  return teams.find(t => t.abbreviation === abbr);
};

// Helper to get players by team
export const getPlayersByTeam = (teamAbbr: string): Player[] => {
  return players.filter(p => p.team === teamAbbr);
};
