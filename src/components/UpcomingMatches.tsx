import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match, getTeamByAbbr } from "@/data/mockData";
import { Calendar, Clock } from "lucide-react";

interface UpcomingMatchesProps {
  matches: Match[];
  onMatchSelect?: (match: Match) => void;
  selectedMatchId?: string;
}

export function UpcomingMatches({ matches, onMatchSelect, selectedMatchId }: UpcomingMatchesProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Matchs à venir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.map((match) => {
          const homeTeam = getTeamByAbbr(match.homeTeam);
          const awayTeam = getTeamByAbbr(match.awayTeam);
          const isSelected = selectedMatchId === match.id;

          return (
            <div
              key={match.id}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
              onClick={() => onMatchSelect?.(match)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(match.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{match.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{awayTeam?.logo}</span>
                  <div>
                    <p className="font-semibold">{awayTeam?.abbreviation}</p>
                    <p className="text-xs text-muted-foreground">Visiteur</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold px-4">
                  VS
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold">{homeTeam?.abbreviation}</p>
                    <p className="text-xs text-muted-foreground">Domicile</p>
                  </div>
                  <span className="text-2xl">{homeTeam?.logo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
