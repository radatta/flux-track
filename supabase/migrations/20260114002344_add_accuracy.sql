-- Add accuracy column to exercise_reps table
-- Stores the accuracy percentage (0-100) for each completed rep
ALTER TABLE exercise_reps 
ADD COLUMN accuracy INTEGER DEFAULT 0;
