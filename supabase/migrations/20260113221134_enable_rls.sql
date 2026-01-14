-- Enable Row Level Security on rehab tables and create policies

-- Enable RLS on exercises table
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Enable RLS on exercise_sessions table
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on exercise_reps table
ALTER TABLE exercise_reps ENABLE ROW LEVEL SECURITY;

-- Policies for exercises table
-- Allow public read access (since API routes don't require auth for reading exercises)
CREATE POLICY "Exercises are viewable by everyone"
ON exercises FOR SELECT
USING (true);

-- Policies for exercise_sessions table
-- Users can view their own sessions
CREATE POLICY "Users can view their own exercise sessions"
ON exercise_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own exercise sessions"
ON exercise_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own exercise sessions"
ON exercise_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for exercise_reps table
-- Users can view reps for sessions they own
CREATE POLICY "Users can view reps for their own sessions"
ON exercise_reps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exercise_sessions
    WHERE exercise_sessions.id = exercise_reps.session_id
    AND exercise_sessions.user_id = auth.uid()
  )
);

-- Users can create reps for sessions they own
CREATE POLICY "Users can create reps for their own sessions"
ON exercise_reps FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exercise_sessions
    WHERE exercise_sessions.id = exercise_reps.session_id
    AND exercise_sessions.user_id = auth.uid()
  )
);