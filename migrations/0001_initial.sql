create table if not exists sources (
  id text primary key,
  url text not null,
  title text not null,
  publisher text not null,
  source_type text not null,
  archive_url text,
  date_found text not null,
  reliability_tier text not null,
  last_checked text not null,
  notes text
);

create table if not exists events (
  id text primary key,
  occurred_at text not null,
  title text not null,
  summary text not null,
  category text not null,
  involved_parties text not null,
  source_ids text not null,
  confidence text not null,
  status text not null,
  publication_risk text not null
);

create table if not exists cases (
  id text primary key,
  case_number text not null,
  title text not null,
  jurisdiction text not null,
  court text not null,
  parties text not null,
  judge text,
  status text not null,
  next_hearing_at text,
  source_ids text not null,
  summary text not null,
  last_checked text not null
);

create table if not exists documents (
  id text primary key,
  title text not null,
  source_id text not null,
  case_id text,
  document_type text not null,
  file_type text not null,
  date_published text,
  r2_key text,
  external_url text not null,
  redaction_status text not null,
  extracted_text text,
  status text not null,
  foreign key (source_id) references sources(id),
  foreign key (case_id) references cases(id)
);

create table if not exists clips (
  id text primary key,
  title text not null,
  platform text not null,
  source_url text not null,
  source_id text not null,
  starts_at text,
  ends_at text,
  transcript_excerpt text not null,
  related_event_ids text not null,
  status text not null,
  publication_risk text not null,
  foreign key (source_id) references sources(id)
);

create table if not exists claims (
  id text primary key,
  claimant text not null,
  claim_text text not null,
  related_evidence_ids text not null,
  related_source_ids text not null,
  status text not null,
  confidence text not null,
  publication_risk text not null,
  editor_note text not null
);

create table if not exists submissions (
  id text primary key,
  submitter_name text,
  submitter_contact text,
  url text,
  title text not null,
  summary text not null,
  suggested_category text not null,
  moderation_status text not null default 'new',
  created_at text not null,
  reviewer_note text
);

create table if not exists ingestion_runs (
  id text primary key,
  source_name text not null,
  started_at text not null,
  finished_at text,
  status text not null,
  candidates_found integer not null default 0,
  auto_published integer not null default 0,
  needs_review integer not null default 0,
  error text
);

create index if not exists idx_events_occurred_at on events(occurred_at);
create index if not exists idx_events_status on events(status);
create index if not exists idx_documents_case_id on documents(case_id);
create index if not exists idx_submissions_status on submissions(moderation_status);
create index if not exists idx_ingestion_runs_started_at on ingestion_runs(started_at);
