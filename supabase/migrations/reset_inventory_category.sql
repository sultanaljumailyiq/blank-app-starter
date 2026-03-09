
ALTER TABLE public.inventory DROP COLUMN IF EXISTS category;
ALTER TABLE public.inventory ADD COLUMN category text;
