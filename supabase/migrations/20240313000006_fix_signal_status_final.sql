-- Drop existing constraint
alter table public.signals drop constraint if exists signals_status_check;

-- Update any incorrect status values
update public.signals
set status = 'partial profits'
where status = 'partial-profits';

update public.signals
set status = 'stopped'
where status like 'stop-loss-%';

-- Add new constraint with correct values
alter table public.signals add constraint signals_status_check
  check (
    status in ('active', 'pending', 'completed', 'partial profits', 'stopped') or
    status ~ '^take-profit-\d+$' or
    status ~ '^stop-loss-\d+$' or
    status ~ '^entry-\d+$'
  );

-- Verify the changes
select distinct status from public.signals;