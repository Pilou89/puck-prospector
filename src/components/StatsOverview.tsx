import { Card, CardContent } from "@/components/ui/card";
import { players, teams } from "@/data/mockData";
import { Target, TrendingUp, Users, Trophy } from "lucide-react";

export function StatsOverview() {
  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];

  const stats = [
    {
      label: "Équipes suivies",
      value: teams.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Joueurs suivis",
      value: players.length,
      icon: Trophy,
      color: "text-primary",
    },
    {
      label: "Total buts",
      value: totalGoals,
      icon: Target,
      color: "text-destructive",
    },
    {
      label: "Total passes",
      value: totalAssists,
      icon: TrendingUp,
      color: "text-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-primary/10 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
