import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

interface SheetConnectorProps {
  onSyncComplete?: () => void;
}

export function SheetConnector({ onSyncComplete }: SheetConnectorProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract sheet ID from Google Sheets URL
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleSync = async () => {
    const sheetId = extractSheetId(sheetUrl);
    
    if (!sheetId) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL Google Sheets valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sync-google-sheet', {
        body: { sheetId, sheetName },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setLastSync(new Date().toLocaleString('fr-FR'));
        toast({
          title: "Synchronisation réussie",
          description: `${data.imported.events} événements, ${data.imported.players} joueurs importés`,
        });
        onSyncComplete?.();
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Impossible de synchroniser les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Connexion Google Sheets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-url">URL du Google Sheet</Label>
          <Input
            id="sheet-url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Assurez-vous que le fichier est partagé en mode "Tout le monde avec le lien peut voir"
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sheet-name">Nom de l'onglet</Label>
          <Input
            id="sheet-name"
            placeholder="Sheet1"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Onglets synchronisés :
          </p>
          <div className="space-y-1 text-xs">
            <p><span className="font-medium">Statistiques:</span> Date | Buteur | Passeur1 | Equipe | Match</p>
            <p><span className="font-medium">Calendrier:</span> Date | Heure (GMT) | Visiteur (Abr.) | Receveur (Abr.) | Match Complet</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Les noms de colonnes sont flexibles (buteur/scorer, equipe/team, etc.)
          </p>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={isLoading || !sheetUrl}
          className="w-full gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isLoading ? "Synchronisation..." : "Synchroniser maintenant"}
        </Button>

        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            Dernière sync : {lastSync}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
