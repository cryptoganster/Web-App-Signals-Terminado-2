-- Drop the existing check constraint
alter table public.signals drop constraint if exists signals_status_check;

-- Add the new check constraint with regex pattern
alter table public.signals add constraint signals_status_check
  check (
    status in ('active', 'pending', 'completed', 'partial-profits', 'stopped') or
    status ~ '^take-profit-[0-9]+$' or
    status ~ '^stop-loss-[0-9]+$' or
    status ~ '^entry-[0-9]+$'
  );

-- Update any existing 'Partial Profits' status to 'partial-profits'
update public.signals
set status = 'partial-profits'
where status = 'Partial Profits';

-- Update any existing 'Stopped' status that isn't from a stop loss
update public.signals
set status = 'stopped'
where status = 'Stopped';