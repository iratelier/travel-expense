-- 여행 지출 기록 — Supabase 테이블 설정
-- Supabase 대시보드 → SQL Editor 에서 실행하세요.

create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  trip_name   text not null default '여행',
  date        date not null,
  description text not null,
  location    text,
  store       text,
  currency    text not null default 'JPY',  -- JPY / KRW / USD / EUR / VND / ETC
  amount      integer,                      -- 입력 통화 기준 금액
  tag         text,                         -- 식비, 교통, 숙소 등
  memo        text,
  created_at  timestamptz not null default now()
);


-- 날짜 기준 정렬 인덱스
create index if not exists expenses_date_idx on expenses (date asc);

-- Row Level Security (공개 읽기/쓰기 — 필요 시 인증 추가)
alter table expenses enable row level security;

create policy "anon read"   on expenses for select using (true);
create policy "anon insert" on expenses for insert with check (true);
create policy "anon update" on expenses for update using (true) with check (true);
create policy "anon delete" on expenses for delete using (true);

-- Realtime 활성화
alter publication supabase_realtime add table expenses;
