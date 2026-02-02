import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Player, getTeamByAbbr } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

interface PlayerStatsTableProps {
  players: Player[];
  title?: string;
}

export function PlayerStatsTable({ players, title }: PlayerStatsTableProps) {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="rounded-lg border bg-card">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Joueur</TableHead>
            <TableHead className="text-center">Équipe</TableHead>
            <TableHead className="text-center">POS</TableHead>
            <TableHead className="text-center">B</TableHead>
            <TableHead className="text-center">A</TableHead>
            <TableHead className="text-center">PTS</TableHead>
            <TableHead className="text-center">PJ</TableHead>
            <TableHead className="text-center">P/PJ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map((player, index) => {
            const team = getTeamByAbbr(player.team);
            return (
              <TableRow key={player.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-semibold">{player.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="gap-1">
                    <span>{team?.logo}</span>
                    <span>{player.team}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{player.position}</Badge>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">
                  {player.goals}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {player.assists}
                </TableCell>
                <TableCell className="text-center font-bold text-lg">
                  {player.points}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {player.gamesPlayed}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {player.pointsPerGame.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
