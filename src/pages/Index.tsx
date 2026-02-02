import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCard } from "@/components/TeamCard";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { CombinationSuggester } from "@/components/CombinationSuggester";
import { RecentEvents } from "@/components/RecentEvents";
import { StatsOverview } from "@/components/StatsOverview";
import { SheetConnector } from "@/components/SheetConnector";
import { teams as mockTeams, players as mockPlayers, upcomingMatches, recentEvents, Match, Player, Team } from "@/data/mockData";
import { useNHLPlayers, useNHLTeams, useNHLEvents } from "@/hooks/useNHLData";
import { BarChart3, Users, Calendar, Zap, Target, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(upcomingMatches[0] || null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch data from database
  const { data: dbPlayers } = useNHLPlayers();
  const { data: dbTeams } = useNHLTeams();
  const { data: dbEvents } = useNHLEvents();

  // Use DB data if available, otherwise use mock data
  const players: Player[] = dbPlayers && dbPlayers.length > 0 
    ? dbPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team_abbreviation,
        position: p.position || 'F',
        goals: p.goals,
        assists: p.assists,
        points: p.goals + p.assists,
        gamesPlayed: p.games_played || 1,
        pointsPerGame: (p.goals + p.assists) / (p.games_played || 1),
      }))
    : mockPlayers;

  const teams: Team[] = dbTeams && dbTeams.length > 0
    ? dbTeams.map(t => ({
        id: t.id,
        name: t.name,
        abbreviation: t.abbreviation,
        logo: t.logo || '🏒',
        wins: t.wins,
        losses: t.losses,
        otl: t.otl,
        goalsFor: t.goals_for,
        goalsAgainst: t.goals_against,
        division: t.division || 'NHL',
      }))
    : mockTeams;

  const events = dbEvents && dbEvents.length > 0
    ? dbEvents.map(e => ({
        id: e.id,
        matchId: e.match_id || '',
        type: 'goal' as const,
        scorer: e.scorer,
        assist1: e.assist1 || undefined,
        assist2: e.assist2 || undefined,
        period: e.period || 1,
        time: e.event_time || '',
        team: e.team,
      }))
    : recentEvents;

  const filteredPlayers = selectedTeam
    ? players.filter((p) => p.team === selectedTeam)
    : players;

  const handleSyncComplete = () => {
    // Refresh all queries after sync
    queryClient.invalidateQueries({ queryKey: ['nhl-players'] });
    queryClient.invalidateQueries({ queryKey: ['nhl-teams'] });
    queryClient.invalidateQueries({ queryKey: ['nhl-events'] });
  };

  const hasDBData = (dbPlayers && dbPlayers.length > 0) || (dbTeams && dbTeams.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">NHL Stats Tracker</h1>
                <p className="text-sm text-muted-foreground">
                  {hasDBData ? 'Données synchronisées' : 'Données de démonstration'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content */}
        <Tabs defaultValue="combinations" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="combinations" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Combinaisons</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Équipes</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Joueurs</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Matchs</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Combinations Tab */}
          <TabsContent value="combinations" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <UpcomingMatches
                  matches={upcomingMatches}
                  onMatchSelect={setSelectedMatch}
                  selectedMatchId={selectedMatch?.id}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedMatch ? (
                  <CombinationSuggester match={selectedMatch} />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border">
                    <p className="text-muted-foreground">Sélectionnez un match pour voir les suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={selectedTeam === team.abbreviation}
                  onClick={() =>
                    setSelectedTeam(
                      selectedTeam === team.abbreviation ? null : team.abbreviation
                    )
                  }
                />
              ))}
            </div>
            {selectedTeam && (
              <PlayerStatsTable
                players={filteredPlayers}
                title={`Joueurs - ${teams.find((t) => t.abbreviation === selectedTeam)?.name}`}
              />
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <PlayerStatsTable players={players} title="Classement des joueurs" />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <UpcomingMatches
                matches={upcomingMatches}
                onMatchSelect={setSelectedMatch}
                selectedMatchId={selectedMatch?.id}
              />
              <RecentEvents events={events} />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-xl">
              <SheetConnector onSyncComplete={handleSyncComplete} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
