-- Create notification preferences table
create table if not exists notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email_notifications boolean default true,
  in_app_notifications boolean default true,
  sound_enabled boolean default true,
  notification_types jsonb default '{
    "meeting": true,
    "calendar": true,
    "system": true,
    "reminder": true
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Add RLS policies
alter table notification_preferences enable row level security;

create policy "Users can view their own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert their own notification preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for notification_preferences
create trigger update_notification_preferences_updated_at
  before update on notification_preferences
  for each row
  execute function update_updated_at_column(); 