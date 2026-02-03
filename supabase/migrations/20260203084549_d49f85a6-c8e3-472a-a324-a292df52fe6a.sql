-- Add unique constraint on player name for upserts
ALTER TABLE public.nhl_players ADD CONSTRAINT nhl_players_name_key UNIQUE (name);

-- Add unique constraint on sheet_id for upserts
ALTER TABLE public.sheet_settings ADD CONSTRAINT sheet_settings_sheet_id_key UNIQUE (sheet_id);