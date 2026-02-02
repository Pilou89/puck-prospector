import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/data/mockData";

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TeamCard({ team, onClick, isSelected }: TeamCardProps) {
  const winPercentage = (team.wins / (team.wins + team.losses + team.otl) * 100).toFixed(1);
  const goalDiff = team.goalsFor - team.goalsAgainst;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">{team.logo}</span>
          <div>
            <p className="text-lg font-semibold">{team.name}</p>
            <p className="text-sm text-muted-foreground">{team.division}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{team.wins}</p>
            <p className="text-xs text-muted-foreground">Victoires</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{team.losses}</p>
            <p className="text-xs text-muted-foreground">Défaites</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{team.otl}</p>
            <p className="text-xs text-muted-foreground">OTL</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span>Buts +/-</span>
            <span className={goalDiff >= 0 ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
              {goalDiff >= 0 ? '+' : ''}{goalDiff}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>% Victoires</span>
            <span className="font-semibold">{winPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
