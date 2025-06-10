create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  conversation jsonb not null,
  title text not null
);

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_created_at on conversations(created_at);;
