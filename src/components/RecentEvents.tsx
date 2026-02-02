import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchEvent, getTeamByAbbr } from "@/data/mockData";
import { Target } from "lucide-react";

interface RecentEventsProps {
  events: MatchEvent[];
}

export function RecentEvents({ events }: RecentEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Derniers buts enregistrés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => {
          const team = getTeamByAbbr(event.team);
          return (
            <div
              key={event.id}
              className="p-3 rounded-lg bg-muted/30 border"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="gap-1">
                  <span>{team?.logo}</span>
                  <span>{event.team}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  P{event.period} - {event.time}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {event.scorer}
                </p>
                {(event.assist1 || event.assist2) && (
                  <p className="text-sm text-muted-foreground">
                    Passes: {[event.assist1, event.assist2].filter(Boolean).join(' + ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
