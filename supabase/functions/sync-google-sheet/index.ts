import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SheetRow {
  date?: string;
  homeTeam?: string;
  awayTeam?: string;
  scorer?: string;
  assist1?: string;
  assist2?: string;
  period?: string;
  time?: string;
  team?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { sheetId, sheetName = 'Sheet1', action = 'sync' } = await req.json();

    if (!sheetId) {
      throw new Error('sheetId is required');
    }

    console.log(`Syncing sheet: ${sheetId}, sheet name: ${sheetName}`);

    // Fetch data from Google Sheets API
    const range = `${sheetName}!A:I`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;

    console.log('Fetching from Google Sheets...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ success: true, message: 'No data to sync', imported: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse headers (first row)
    const headers = rows[0].map((h: string) => h.toLowerCase().trim());
    console.log('Headers found:', headers);

    // Map column indices
    const colIndex = {
      date: headers.indexOf('date'),
      homeTeam: headers.indexOf('home_team') !== -1 ? headers.indexOf('home_team') : headers.indexOf('hometeam'),
      awayTeam: headers.indexOf('away_team') !== -1 ? headers.indexOf('away_team') : headers.indexOf('awayteam'),
      scorer: headers.indexOf('scorer') !== -1 ? headers.indexOf('scorer') : headers.indexOf('buteur'),
      assist1: headers.indexOf('assist1') !== -1 ? headers.indexOf('assist1') : headers.indexOf('passeur1'),
      assist2: headers.indexOf('assist2') !== -1 ? headers.indexOf('assist2') : headers.indexOf('passeur2'),
      period: headers.indexOf('period') !== -1 ? headers.indexOf('period') : headers.indexOf('periode'),
      time: headers.indexOf('time') !== -1 ? headers.indexOf('time') : headers.indexOf('temps'),
      team: headers.indexOf('team') !== -1 ? headers.indexOf('team') : headers.indexOf('equipe'),
    };

    console.log('Column indices:', colIndex);

    // Process data rows
    const events: Array<{
      scorer: string;
      assist1?: string;
      assist2?: string;
      period?: number;
      event_time?: string;
      team: string;
      match_date?: string;
    }> = [];

    const playerStats: Map<string, { goals: number; assists: number; team: string }> = new Map();
    const teams: Set<string> = new Set();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const scorer = colIndex.scorer !== -1 ? row[colIndex.scorer]?.trim() : null;
      const assist1 = colIndex.assist1 !== -1 ? row[colIndex.assist1]?.trim() : null;
      const assist2 = colIndex.assist2 !== -1 ? row[colIndex.assist2]?.trim() : null;
      const team = colIndex.team !== -1 ? row[colIndex.team]?.trim() : null;
      const period = colIndex.period !== -1 ? parseInt(row[colIndex.period]) || null : null;
      const time = colIndex.time !== -1 ? row[colIndex.time]?.trim() : null;
      const date = colIndex.date !== -1 ? row[colIndex.date]?.trim() : null;

      if (scorer && team) {
        events.push({
          scorer,
          assist1: assist1 || undefined,
          assist2: assist2 || undefined,
          period: period || undefined,
          event_time: time || undefined,
          team,
          match_date: date || undefined,
        });

        teams.add(team);

        // Update player stats
        if (!playerStats.has(scorer)) {
          playerStats.set(scorer, { goals: 0, assists: 0, team });
        }
        playerStats.get(scorer)!.goals++;

        if (assist1) {
          if (!playerStats.has(assist1)) {
            playerStats.set(assist1, { goals: 0, assists: 0, team });
          }
          playerStats.get(assist1)!.assists++;
        }

        if (assist2) {
          if (!playerStats.has(assist2)) {
            playerStats.set(assist2, { goals: 0, assists: 0, team });
          }
          playerStats.get(assist2)!.assists++;
        }
      }
    }

    console.log(`Parsed ${events.length} events, ${playerStats.size} players, ${teams.size} teams`);

    // Upsert teams
    for (const teamAbbr of teams) {
      await supabase
        .from('nhl_teams')
        .upsert({ abbreviation: teamAbbr, name: teamAbbr }, { onConflict: 'abbreviation' });
    }

    // Upsert players
    for (const [playerName, stats] of playerStats) {
      const { error } = await supabase
        .from('nhl_players')
        .upsert(
          {
            name: playerName,
            team_abbreviation: stats.team,
            goals: stats.goals,
            assists: stats.assists,
          },
          { onConflict: 'name' }
        );
      
      if (error) {
        console.error('Error upserting player:', playerName, error);
      }
    }

    // Insert events (clear old ones first)
    await supabase.from('nhl_match_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    for (const event of events) {
      await supabase.from('nhl_match_events').insert({
        scorer: event.scorer,
        assist1: event.assist1,
        assist2: event.assist2,
        period: event.period,
        event_time: event.event_time,
        team: event.team,
      });
    }

    // Update sheet settings
    await supabase
      .from('sheet_settings')
      .upsert({
        sheet_id: sheetId,
        sheet_name: sheetName,
        last_sync_at: new Date().toISOString(),
      }, { onConflict: 'sheet_id' });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sync completed successfully',
        imported: {
          events: events.length,
          players: playerStats.size,
          teams: teams.size,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error syncing sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
