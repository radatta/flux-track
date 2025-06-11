-- Table: exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,             -- e.g. "head-tilt-right"
  name TEXT NOT NULL,                    -- e.g. "Head Tilt Right"
  instructions TEXT NOT NULL,
  media_url TEXT,                        -- link to demo video/image
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: exercise_sessions
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Table: exercise_reps
CREATE TABLE IF NOT EXISTS exercise_reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  rep_number INTEGER NOT NULL,         -- e.g. 1, 2, 3...
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER             -- for holds
);

-- Index for fast lookup of reps by session
CREATE INDEX IF NOT EXISTS idx_exercise_reps_session_id ON exercise_reps(session_id);

-- Index for fast lookup of sessions by user
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_id ON exercise_sessions(user_id);