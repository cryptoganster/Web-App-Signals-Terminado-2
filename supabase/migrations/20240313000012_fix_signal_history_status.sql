-- Drop existing constraint
alter table public.signals drop constraint if exists signals_status_check;

-- Update status values to be consistent
update public.signals
set status = 'partial profits'
where status in ('partial-profits', 'Partial Profits', 'Partial profits');

update public.signals
set status = 'stopped'
where status in ('Stopped', 'stop-loss-1') or status like 'stop-loss-%';

-- Add new constraint with correct values
alter table public.signals add constraint signals_status_check
  check (
    status in ('active', 'pending', 'completed', 'partial profits', 'stopped') or
    status ~ '^take-profit-\d+$' or
    status ~ '^stop-loss-\d+$' or
    status ~ '^entry-\d+$'
  );

-- Verify the changes
select distinct status, count(*) 
from public.signals 
group by status 
order by status;