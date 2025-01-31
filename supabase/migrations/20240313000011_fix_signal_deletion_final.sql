-- Drop existing trigger and function
drop trigger if exists before_signal_delete on public.signals;
drop function if exists handle_signal_deletion();

-- Create function to handle signal deletion with proper status transitions
create or replace function handle_signal_deletion()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  take_profit_hits integer;
begin
  -- For active signals or signals with take profit hits
  if old.status = 'active' or old.status like 'take-profit-%' then
    -- Count take profit hits
    select count(*)
    into take_profit_hits
    from jsonb_array_elements(old.take_profits) as tp
    where tp->>'hit' = 'true';

    -- Move to history with appropriate status
    if take_profit_hits > 0 or old.status like 'take-profit-%' then
      update public.signals
      set status = 'partial profits'
      where id = old.id;
      return null;
    else
      update public.signals
      set status = 'stopped'
      where id = old.id;
      return null;
    end if;
  end if;

  -- For pending signals or signals already in history, allow deletion
  if old.status in ('pending', 'completed', 'partial profits', 'stopped') then
    return old;
  end if;

  return null;
end;
$$;

-- Create trigger for signal deletion
create trigger before_signal_delete
  before delete on public.signals
  for each row execute function handle_signal_deletion();