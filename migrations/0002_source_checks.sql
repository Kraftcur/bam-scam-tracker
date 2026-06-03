create table if not exists source_checks (
  source_id text primary key,
  url text not null,
  title text not null,
  checked_at text not null,
  last_changed_at text,
  http_status integer,
  ok integer not null default 0,
  content_hash text,
  content_length integer not null default 0,
  changed integer not null default 0,
  error text,
  foreign key (source_id) references sources(id)
);

create index if not exists idx_source_checks_checked_at on source_checks(checked_at);
create index if not exists idx_source_checks_changed on source_checks(changed);
