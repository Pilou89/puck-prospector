import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Match, Player, getPlayersByTeam, getTeamByAbbr } from "@/data/mockData";
import { Target, TrendingUp, Zap, Star } from "lucide-react";
import { useState, useMemo } from "react";

interface CombinationSuggesterProps {
  match: Match;
}

interface Combination {
  scorer: Player;
  assister: Player;
  confidence: number;
  reason: string;
}

export function CombinationSuggester({ match }: CombinationSuggesterProps) {
  const [selectedType, setSelectedType] = useState<'goal' | 'point'>('goal');
  
  const homeTeam = getTeamByAbbr(match.homeTeam);
  const awayTeam = getTeamByAbbr(match.awayTeam);
  const homePlayers = getPlayersByTeam(match.homeTeam);
  const awayPlayers = getPlayersByTeam(match.awayTeam);

  const combinations = useMemo(() => {
    const allCombinations: Combination[] = [];
    
    // Generate combinations for both teams
    [homePlayers, awayPlayers].forEach((teamPlayers) => {
      if (teamPlayers.length < 2) return;
      
      // Sort by goals for scorers, assists for assisters
      const scorers = [...teamPlayers].sort((a, b) => b.goals - a.goals);
      const assisters = [...teamPlayers].sort((a, b) => b.assists - a.assists);
      
      // Top scorer with top assister
      if (scorers[0] && assisters[0] && scorers[0].id !== assisters[0].id) {
        allCombinations.push({
          scorer: scorers[0],
          assister: assisters[0],
          confidence: Math.min(95, Math.round((scorers[0].pointsPerGame + assisters[0].pointsPerGame) * 30)),
          reason: 'Meilleure combinaison statistique',
        });
      }
      
      // Second best combo
      if (scorers[1] && assisters[0]) {
        allCombinations.push({
          scorer: scorers[1],
          assister: assisters[0],
          confidence: Math.min(85, Math.round((scorers[1].pointsPerGame + assisters[0].pointsPerGame) * 28)),
          reason: 'Combinaison alternative solide',
        });
      }
    });

    return allCombinations.sort((a, b) => b.confidence - a.confidence);
  }, [homePlayers, awayPlayers]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-primary text-primary-foreground';
    if (confidence >= 60) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Suggestions de combinaisons
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Button
            variant={selectedType === 'goal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('goal')}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            Buteur + Passeur
          </Button>
          <Button
            variant={selectedType === 'point' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('point')}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Points totaux
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Match: <span className="font-semibold">{awayTeam?.logo} {awayTeam?.abbreviation}</span>
          {' @ '}
          <span className="font-semibold">{homeTeam?.abbreviation} {homeTeam?.logo}</span>
        </div>

        {combinations.length > 0 ? (
          combinations.map((combo, index) => (
            <div
              key={`${combo.scorer.id}-${combo.assister.id}`}
              className={`p-4 rounded-lg border ${
                index === 0 ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {index === 0 && <Star className="h-5 w-5 text-primary fill-primary" />}
                  <Badge className={getConfidenceColor(combo.confidence)}>
                    {combo.confidence}% confiance
                  </Badge>
                </div>
                <Badge variant="outline">{combo.reason}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Buteur
                  </p>
                  <p className="font-semibold">{combo.scorer.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getTeamByAbbr(combo.scorer.team)?.logo} {combo.scorer.team}
                    </Badge>
                    <span className="text-sm text-primary font-semibold">
                      {combo.scorer.goals}B
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Passeur
                  </p>
                  <p className="font-semibold">{combo.assister.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getTeamByAbbr(combo.assister.team)?.logo} {combo.assister.team}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {combo.assister.assists}A
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune donnée disponible pour ce match</p>
            <p className="text-sm">Sélectionnez un match avec des joueurs dans la base</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
