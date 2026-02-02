import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCard } from "@/components/TeamCard";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { CombinationSuggester } from "@/components/CombinationSuggester";
import { RecentEvents } from "@/components/RecentEvents";
import { StatsOverview } from "@/components/StatsOverview";
import { teams, players, upcomingMatches, recentEvents, Match } from "@/data/mockData";
import { BarChart3, Users, Calendar, Zap, Target } from "lucide-react";

const Index = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(upcomingMatches[0] || null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const filteredPlayers = selectedTeam
    ? players.filter((p) => p.team === selectedTeam)
    : players;

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
                <p className="text-sm text-muted-foreground">Statistiques & Combinaisons</p>
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
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
              <RecentEvents events={recentEvents} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
