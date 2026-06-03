-- Add media and perspective columns to the events table
ALTER TABLE events ADD COLUMN image_url TEXT;
ALTER TABLE events ADD COLUMN video_url TEXT;
ALTER TABLE events ADD COLUMN ben_perspective TEXT;
ALTER TABLE events ADD COLUMN bam_perspective TEXT;

-- Add media and perspective columns to the submissions table
ALTER TABLE submissions ADD COLUMN image_url TEXT;
ALTER TABLE submissions ADD COLUMN video_url TEXT;
ALTER TABLE submissions ADD COLUMN ben_perspective TEXT;
ALTER TABLE submissions ADD COLUMN bam_perspective TEXT;
