-- Check triggers
select 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgtype,
  tgenabled,
  pg_get_triggerdef(oid) as trigger_definition
from pg_trigger
where not tgisinternal
  and tgrelid::regclass::text in ('public.signals', 'public.profiles');

-- Check policies
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('signals', 'profiles');

-- Check constraints
select 
  conname as constraint_name,
  conrelid::regclass as table_name,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid::regclass::text in ('public.signals', 'public.profiles')
  and contype = 'c';

-- Check current signal statuses
select distinct status, count(*) 
from public.signals 
group by status;