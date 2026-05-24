-- Migration: add highlights column to user_data
-- Run once in the Supabase SQL editor:
--   Project → SQL editor → paste → Run
-- Or via Supabase CLI: supabase db push

ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb;
