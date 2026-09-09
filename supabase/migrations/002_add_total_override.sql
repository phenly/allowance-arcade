-- Manual override of a week's total, gated in the UI by an edit code.
-- override_total, when set, supersedes the calculated/paid total everywhere the
-- week's total is displayed or aggregated (progress bar, history, goal savings).
-- The per-section breakdown and "This Week's Earnings" hero stay button-calculated.
-- total_edited_at records when the override was last saved (null = never / reset).
alter table public.weeks
  add column if not exists override_total numeric,
  add column if not exists total_edited_at timestamptz;
