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

// Helper function to normalize headers
const normalizeHeader = (h: string): string => 
  h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Helper function to find column index with multiple possible names
const findColumn = (headers: string[], ...names: string[]): number => {
  for (const name of names) {
    const normalized = normalizeHeader(name);
    const idx = headers.indexOf(normalized);
    if (idx !== -1) return idx;
  }
  return -1;
};

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

    const { sheetId, sheetName = 'Sheet1', calendarSheetName = 'Calendrier', action = 'sync' } = await req.json();

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

    // Parse headers (first row) - normalize headers
    const headers = rows[0].map((h: string) => normalizeHeader(h));
    console.log('Headers found:', headers);

    // Map column indices with flexible naming
    const colIndex = {
      date: findColumn(headers, 'date'),
      match: findColumn(headers, 'match'),
      scorer: findColumn(headers, 'scorer', 'buteur', 'goal', 'but'),
      assist1: findColumn(headers, 'assist1', 'passeur1', 'passeur', 'assist', 'passe1'),
      assist2: findColumn(headers, 'assist2', 'passeur2', 'passe2'),
      period: findColumn(headers, 'period', 'periode'),
      time: findColumn(headers, 'time', 'temps', 'heure'),
      team: findColumn(headers, 'team', 'equipe', 'équipe'),
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

    // === SYNC CALENDAR/MATCHES ===
    let matchesImported = 0;
    
    if (calendarSheetName) {
      console.log(`Syncing calendar from sheet: ${calendarSheetName}`);
      
      const calendarRange = `${calendarSheetName}!A:E`;
      const calendarUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(calendarRange)}?key=${GOOGLE_API_KEY}`;
      
      try {
        const calendarResponse = await fetch(calendarUrl);
        
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          const calendarRows = calendarData.values || [];
          
          if (calendarRows.length >= 2) {
            const calendarHeaders = calendarRows[0].map((h: string) => normalizeHeader(h));
            console.log('Calendar headers found:', calendarHeaders);
            
            // Map calendar column indices
            // Format: Date | Heure (GMT) | Visiteur (Abr.) | Receveur (Abr.) | Match Complet
            const calColIndex = {
              date: findColumn(calendarHeaders, 'date'),
              time: findColumn(calendarHeaders, 'heure (gmt)', 'heure', 'time', 'temps'),
              awayTeam: findColumn(calendarHeaders, 'visiteur (abr.)', 'visiteur', 'away', 'awayteam', 'away_team'),
              homeTeam: findColumn(calendarHeaders, 'receveur (abr.)', 'receveur', 'home', 'hometeam', 'home_team'),
              matchFull: findColumn(calendarHeaders, 'match complet', 'match', 'matchup'),
            };
            
            console.log('Calendar column indices:', calColIndex);
            
            // Clear existing matches and insert new ones
            await supabase.from('nhl_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            for (let i = 1; i < calendarRows.length; i++) {
              const row = calendarRows[i];
              if (!row || row.length === 0) continue;
              
              const matchDate = calColIndex.date !== -1 ? row[calColIndex.date]?.trim() : null;
              const matchTime = calColIndex.time !== -1 ? row[calColIndex.time]?.trim() : null;
              const awayTeam = calColIndex.awayTeam !== -1 ? row[calColIndex.awayTeam]?.trim() : null;
              const homeTeam = calColIndex.homeTeam !== -1 ? row[calColIndex.homeTeam]?.trim() : null;
              
              if (matchDate && homeTeam && awayTeam) {
                // Parse date - handle various formats
                let parsedDate = matchDate;
                
                // Try to parse DD/MM/YYYY format
                const dateMatch = matchDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                if (dateMatch) {
                  parsedDate = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
                }
                
                const { error } = await supabase.from('nhl_matches').insert({
                  match_date: parsedDate,
                  match_time: matchTime || null,
                  home_team: homeTeam,
                  away_team: awayTeam,
                  status: 'upcoming',
                });
                
                if (!error) {
                  matchesImported++;
                  
                  // Also add teams if not already present
                  if (homeTeam) teams.add(homeTeam);
                  if (awayTeam) teams.add(awayTeam);
                } else {
                  console.error('Error inserting match:', error);
                }
              }
            }
            
            console.log(`Imported ${matchesImported} matches from calendar`);
          }
        } else {
          console.log('Calendar sheet not found or not accessible, skipping matches sync');
        }
      } catch (calError) {
        console.error('Error fetching calendar sheet:', calError);
      }
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
          matches: matchesImported,
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
