create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null check (char_length(name) between 1 and 40),
  character text not null check (char_length(character) between 1 and 16),
  character_name text not null check (char_length(character_name) between 1 and 80),
  country_code text not null check (char_length(country_code) between 1 and 8),
  country_name text not null check (char_length(country_name) between 1 and 80),
  flag text not null check (char_length(flag) between 1 and 16),
  content text not null check (char_length(content) between 1 and 260),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_entries_created_at_idx
  on public.guestbook_entries (created_at desc);

alter table public.guestbook_entries enable row level security;

drop policy if exists "Guestbook is publicly readable" on public.guestbook_entries;
create policy "Guestbook is publicly readable"
  on public.guestbook_entries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Visitors can add valid guestbook entries" on public.guestbook_entries;
create policy "Visitors can add valid guestbook entries"
  on public.guestbook_entries
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 40
    and char_length(character) between 1 and 16
    and char_length(character_name) between 1 and 80
    and char_length(country_code) between 1 and 8
    and char_length(country_name) between 1 and 80
    and char_length(flag) between 1 and 16
    and char_length(content) between 1 and 260
    and created_at >= timestamptz '2020-01-01 00:00:00+00'
    and created_at <= now() + interval '1 minute'
    and (legacy_id is null or legacy_id ~ '^(entry|credits-quick|author)-[0-9]{13}$')
  );

grant select, insert on public.guestbook_entries to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guestbook_entries'
  ) then
    alter publication supabase_realtime add table public.guestbook_entries;
  end if;
end $$;

insert into public.guestbook_entries
  (legacy_id, name, character, character_name, country_code, country_name, flag, content, created_at)
values
  ('seed-1', 'Minh Trang', '👩‍🌾', 'Thiếu nữ Áo tứ thân', 'VN', 'Việt Nam', '🇻🇳', 'Âm nhạc ngũ cung và đồ họa pixel quá đỗi cảm xúc! Mong em tiếp tục phát triển thêm các chặng miền Tây và Tây Nguyên nhé ❤️🚂', now() - interval '5 minutes'),
  ('seed-2', 'Hoàng Nam', '🪕', 'Cây Đàn Nguyệt', 'VN', 'Việt Nam', '🇻🇳', 'Một tác phẩm nghệ thuật số tôn vinh di sản quá đỗi tự hào và tinh tế. Từng nốt đàn tranh, nhịp gõ phách ca trù chạm đến trái tim! 🏮✨', now() - interval '1 hour'),
  ('seed-3', 'Alexandre', '🎒', 'Du khách Lữ hành', 'FR', 'Pháp', '🇫🇷', 'Superbe projet interactif sur le patrimoine vietnamien ! Les détails sonores de Ca Trù et Nha Nhac sont magnifiques ✨', now() - interval '1 day'),
  ('seed-4', 'Bác Ba Đờn', '🧓', 'Bác Nghệ nhân Đờn ca', 'VN', 'Việt Nam', '🇻🇳', 'Rất vui khi thấy người trẻ vẫn gìn giữ và truyền tải nét đẹp Đờn ca tài tử Nam Bộ hay như vầy. Chúc tác giả nhiều lửa nghề!', now() - interval '2 days'),
  ('seed-5', 'Kenji Sato', '🧑‍🎓', 'Lữ khách Quốc tế', 'JP', 'Nhật Bản', '🇯🇵', 'ベトナムの伝統文化を美しく体験できる素晴らしいゲームです！陶芸体験がとても楽しかった 🏮✨', now() - interval '3 days'),
  ('seed-6', 'Thu Thảo', '🏺', 'Bình gốm Cổ truyền', 'VN', 'Việt Nam', '🇻🇳', 'Cảm ơn chuyến tàu di sản đã đưa mình qua từng miền đất nước. Tiếng gốm nung Bàu Trúc và điệu hò Quan họ Bắc Ninh thật tuyệt vời! 🌸', now() - interval '4 days'),
  ('seed-7', 'David Miller', '🌏', 'Bạn bè Quốc tế', 'US', 'Hoa Kỳ', '🇺🇸', 'Proud of Vietnamese cultural roots! The pixel craftsmanship, interactive stamps and zither soundtrack are truly extraordinary. 👏', now() - interval '5 days'),
  ('seed-8', 'Thầy giáo Nguyễn Văn An', '👴', 'Cụ đồ Thư pháp', 'VN', 'Việt Nam', '🇻🇳', 'Mỗi con tem được đóng dấu như khắc ghi thêm một mảnh ghép hồn quê hương vào tâm trí. Trân quý từng tư liệu và thanh âm! 📜❤️', now() - interval '7 days')
on conflict (legacy_id) do nothing;
