-- Drop existing constraint
alter table public.signals drop constraint if exists signals_status_check;

-- Update all status values to be consistent
update public.signals
set status = 'partial profits'
where status in ('partial-profits', 'Partial Profits', 'Partial profits', 'partial-profits');

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

-- Create or replace function to handle signal deletion
create or replace function handle_signal_deletion()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  -- For active signals with take profit hits
  if (old.status = 'active' and exists (
    select 1 from public.signals 
    where id = old.id and status like 'take-profit-%'
  )) or old.status like 'take-profit-%' then
    update public.signals
    set status = 'partial profits'
    where id = old.id;
    return null;
  -- For active signals without take profit hits
  elsif old.status = 'active' then
    update public.signals
    set status = 'stopped'
    where id = old.id;
    return null;
  -- For pending signals or signals already in history
  elsif old.status in ('pending', 'completed', 'partial profits', 'stopped') then
    return old;
  end if;
  return null;
end;
$$;

-- Create trigger for signal deletion
drop trigger if exists before_signal_delete on public.signals;
create trigger before_signal_delete
  before delete on public.signals
  for each row execute function handle_signal_deletion();

-- Verify the changes
select distinct status, count(*) 
from public.signals 
group by status 
order by status;