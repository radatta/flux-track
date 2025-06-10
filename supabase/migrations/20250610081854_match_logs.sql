CREATE OR REPLACE FUNCTION match_logs(
  query_embedding vector(1536),
  match_count int,
  min_similarity float
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  mood integer,
  energy integer,
  notes text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    id,
    created_at,
    mood,
    energy,
    notes,
    1 - (embedding <=> query_embedding) AS similarity
  FROM logs
  WHERE user_id = auth.uid()
    AND (1 - (embedding <=> query_embedding)) > min_similarity
  ORDER BY similarity DESC
  LIMIT match_count;
$$;