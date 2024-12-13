-- Drop existing tables if they exist
drop table if exists public.signals cascade;
drop table if exists public.profiles cascade;

-- Drop existing functions and triggers
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table to store user profile information
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create signals table
create table public.signals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  pair text not null,
  type text not null check (type in ('Limit', 'Market')),
  position text not null check (position in ('Long', 'Short', 'Spot')),
  leverage numeric,
  entries jsonb not null default '[]'::jsonb,
  stop_losses jsonb not null default '[]'::jsonb,
  take_profits jsonb not null default '[]'::jsonb,
  comments text,
  trading_view_url text,
  risk_reward text,
  created_at timestamptz default now(),
  status text not null check (
    status in ('active', 'pending', 'completed', 'partial-profits', 'stopped') or
    status ~ '^take-profit-\d+$' or
    status ~ '^stop-loss-\d+$' or
    status ~ '^entry-\d+$'
  ),
  telegram_message_id integer,
  last_modification_id integer
);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
security definer
language plpgsql
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to automatically update updated_at
create or replace function public.set_updated_at()
returns trigger
security definer
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.signals enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create policies for signals
create policy "Users can view their own signals"
  on public.signals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own signals"
  on public.signals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own signals"
  on public.signals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own signals"
  on public.signals for delete
  using (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Insert profiles for existing users
insert into public.profiles (id, username)
select 
  id,
  split_part(email, '@', 1) as username
from auth.users
on conflict (id) do update
set username = excluded.username;