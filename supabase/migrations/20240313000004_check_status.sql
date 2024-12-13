-- Check current status values
select distinct status from public.signals;

-- Check current constraint
select pg_get_constraintdef(oid) 
from pg_constraint 
where conname = 'signals_status_check';

-- Check if there are any signals that would violate the new constraint
select id, status 
from public.signals 
where status not in (
  'active', 'pending', 'completed', 'partial profits', 'stopped'
) and status !~ '^take-profit-\d+$' 
  and status !~ '^stop-loss-\d+$'
  and status !~ '^entry-\d+$';