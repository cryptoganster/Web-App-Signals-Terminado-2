-- Drop the existing check constraint
alter table public.signals drop constraint if exists signals_status_check;

-- Add the new check constraint with the correct status values
alter table public.signals add constraint signals_status_check
  check (
    status in ('active', 'pending', 'completed', 'partial profits', 'stopped') or
    status ~ '^take-profit-\d+$' or
    status ~ '^stop-loss-\d+$' or
    status ~ '^entry-\d+$'
  );

-- Update any existing statuses to match new format
update public.signals
set status = 'partial profits'
where status = 'partial-profits';

-- Update any existing stop-loss statuses to 'stopped'
update public.signals
set status = 'stopped'
where status like 'stop-loss-%';