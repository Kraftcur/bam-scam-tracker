ALTER TABLE submissions ADD COLUMN community_event_id TEXT;
ALTER TABLE submissions ADD COLUMN ai_score INTEGER;
ALTER TABLE submissions ADD COLUMN ai_score_reasons TEXT;
ALTER TABLE submissions ADD COLUMN cluster_key TEXT;
ALTER TABLE submissions ADD COLUMN duplicate_key TEXT;
ALTER TABLE submissions ADD COLUMN suggested_action TEXT;
ALTER TABLE submissions ADD COLUMN ai_summary TEXT;
ALTER TABLE submissions ADD COLUMN processed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_cluster_key ON submissions(cluster_key);
CREATE INDEX IF NOT EXISTS idx_submissions_duplicate_key ON submissions(duplicate_key);
CREATE INDEX IF NOT EXISTS idx_submissions_suggested_action ON submissions(suggested_action);
