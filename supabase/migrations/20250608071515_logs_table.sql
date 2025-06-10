-- Enable pgvector extension
create extension if not exists vector with schema public;
create table logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz not null default now(),
  mood integer not null,
  energy integer not null,
  notes text,
  tags text[],
  sentiment jsonb,
  ai_summary text,
  ai_recommendations text,
  embedding vector(1536),
  constraint fk_user foreign key(user_id) references auth.users(id) on delete cascade
);
-- Indexes
create index idx_logs_user_id on logs(user_id);
create index idx_logs_created_at on logs(created_at);
create index idx_logs_embedding on logs using ivfflat (embedding vector_cosine_ops) with (lists = 100);
