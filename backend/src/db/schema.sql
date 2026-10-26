-- Dung Pham Anh: Lược đồ CSDL Quản lý Thư viện: 11 bảng theo ERD + tham số và nhật ký, bật RLS để chặn truy cập qua API công khai của Supabase

create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;

create or replace function f_unaccent(text) returns text
language sql immutable parallel safe strict
set search_path = ''
as $$ select pg_catalog.lower(extensions.unaccent('extensions.unaccent'::regdictionary, $1)) $$;

create sequence if not exists seq_account;
create sequence if not exists seq_reader;
create sequence if not exists seq_librarian;
create sequence if not exists seq_category;
create sequence if not exists seq_publisher;
create sequence if not exists seq_copy;
create sequence if not exists seq_loan;
create sequence if not exists seq_reservation;
create sequence if not exists seq_fine;

create table if not exists account (
  account_id          varchar(50)  primary key default 'TK' || lpad(nextval('seq_account')::text, 6, '0'),
  username            varchar(50)  not null unique,
  password_hash       varchar(255) not null,
  role                varchar(20)  not null check (role in ('admin', 'librarian', 'reader')),
  status              boolean      not null default true,
  failed_login_count  int          not null default 0 check (failed_login_count >= 0),
  created_at          timestamptz  not null default now()
);

create table if not exists reader (
  reader_id         varchar(50)  primary key default 'DG' || lpad(nextval('seq_reader')::text, 6, '0'),
  account_id        varchar(50)  not null unique references account (account_id),
  full_name         varchar(100) not null,
  email             varchar(100) not null unique,
  phone             varchar(20),
  student_code      varchar(30)  unique,
  identity_number   varchar(20)  unique,
  reader_type       varchar(20)  not null default 'student' check (reader_type in ('student', 'lecturer')),
  max_borrow_limit  int          not null default 3 check (max_borrow_limit >= 0),
  card_issued_date  date         not null default current_date,
  card_expiry_date  date         not null,
  check (card_expiry_date >= card_issued_date)
);

create table if not exists librarian (
  staff_id    varchar(50)  primary key default 'TT' || lpad(nextval('seq_librarian')::text, 4, '0'),
  account_id  varchar(50)  not null unique references account (account_id),
  full_name   varchar(100) not null,
  email       varchar(100) not null unique,
  department  varchar(100)
);

create table if not exists category (
  category_id    varchar(50)  primary key default 'TL' || lpad(nextval('seq_category')::text, 3, '0'),
  category_name  varchar(100) not null unique,
  description    varchar(255),
  parent_id      varchar(50)  references category (category_id),
  check (parent_id is null or parent_id <> category_id)
);

create table if not exists publisher (
  publisher_id    varchar(50)  primary key default 'NXB' || lpad(nextval('seq_publisher')::text, 3, '0'),
  publisher_name  varchar(150) not null,
  address         varchar(250),
  contact_email   varchar(100),
  phone           varchar(20)
);

create table if not exists book_title (
  isbn          varchar(20)  primary key,
  category_id   varchar(50)  not null references category (category_id),
  publisher_id  varchar(50)  not null references publisher (publisher_id),
  title         varchar(250) not null,
  author        varchar(100) not null,
  publish_year  int          check (publish_year >= 1450),
  description   text,
  is_deleted    boolean      not null default false,
  created_at    timestamptz  not null default now()
);

create table if not exists book_copy (
  barcode             varchar(50)  primary key default 'BC' || lpad(nextval('seq_copy')::text, 6, '0'),
  isbn                varchar(20)  not null references book_title (isbn),
  physical_condition  varchar(50)  not null default 'Good' check (physical_condition in ('Good', 'Worn', 'Damaged')),
  loan_status         varchar(50)  not null default 'Available'
                      check (loan_status in ('Available', 'Borrowed', 'OnHold', 'Maintenance', 'Lost', 'Storage')),
  shelf_location      varchar(50),
  created_at          timestamptz  not null default now()
);

create table if not exists loan_record (
  loan_id             varchar(50)  primary key default 'PM' || lpad(nextval('seq_loan')::text, 6, '0'),
  reader_id           varchar(50)  not null references reader (reader_id),
  staff_id            varchar(50)  not null references librarian (staff_id),
  created_date        date         not null default current_date,
  due_date            date         not null,
  actual_return_date  date,
  renew_count         int          not null default 0 check (renew_count >= 0),
  status              varchar(50)  not null default 'Borrowing' check (status in ('Borrowing', 'Returned')),
  check (due_date >= created_date),
  check (actual_return_date is null or actual_return_date >= created_date)
);

create table if not exists loan_detail (
  loan_id           varchar(50)  not null references loan_record (loan_id),
  barcode           varchar(50)  not null references book_copy (barcode),
  returned_at       timestamptz,
  return_condition  varchar(20)  check (return_condition in ('Good', 'Damaged', 'Lost')),
  primary key (loan_id, barcode)
);

create table if not exists reservation (
  reserve_id    varchar(50)  primary key default 'DT' || lpad(nextval('seq_reservation')::text, 6, '0'),
  reader_id     varchar(50)  not null references reader (reader_id),
  isbn          varchar(20)  not null references book_title (isbn),
  reserve_date  timestamptz  not null default now(),
  expire_date   date         not null,
  status        varchar(50)  not null default 'Pending'
                check (status in ('Pending', 'Ready', 'Fulfilled', 'Cancelled', 'Expired')),
  barcode       varchar(50)  references book_copy (barcode)
);

create table if not exists fine_receipt (
  fine_id       varchar(50)    primary key default 'PP' || lpad(nextval('seq_fine')::text, 6, '0'),
  loan_id       varchar(50)    not null references loan_record (loan_id),
  barcode       varchar(50)    references book_copy (barcode),
  fine_type     varchar(20)    not null check (fine_type in ('Overdue', 'Damaged', 'Lost')),
  reason        varchar(255)   not null,
  amount        decimal(12, 2) not null check (amount >= 0),
  created_at    timestamptz    not null default now(),
  is_paid       boolean        not null default false,
  paid_at       timestamptz,
  collected_by  varchar(50)    references librarian (staff_id)
);

create table if not exists system_setting (
  setting_key    varchar(50)  primary key,
  setting_value  varchar(100) not null,
  description    varchar(255),
  updated_at     timestamptz  not null default now()
);

create table if not exists audit_log (
  log_id      bigserial    primary key,
  account_id  varchar(50)  references account (account_id),
  action      varchar(50)  not null,
  entity      varchar(50),
  entity_id   varchar(50),
  detail      jsonb,
  created_at  timestamptz  not null default now()
);

create unique index if not exists ux_loan_detail_active_copy on loan_detail (barcode) where returned_at is null;
create unique index if not exists ux_reservation_active on reservation (reader_id, isbn) where status in ('Pending', 'Ready');
create index if not exists ix_book_copy_isbn on book_copy (isbn, loan_status);
create index if not exists ix_book_title_category on book_title (category_id) where not is_deleted;
create index if not exists ix_loan_record_reader on loan_record (reader_id, status);
create index if not exists ix_loan_record_due on loan_record (status, due_date);
create index if not exists ix_loan_record_created on loan_record (created_date);
create index if not exists ix_loan_detail_returned on loan_detail (returned_at) where returned_at is not null;
create index if not exists ix_reservation_queue on reservation (isbn, status, reserve_date);
create index if not exists ix_fine_unpaid on fine_receipt (loan_id) where not is_paid;
create index if not exists ix_audit_created on audit_log (created_at desc);

do $$
declare
  t text;
begin
  foreach t in array array['account', 'reader', 'librarian', 'category', 'publisher', 'book_title', 'book_copy',
                           'loan_record', 'loan_detail', 'reservation', 'fine_receipt', 'system_setting', 'audit_log']
  loop
    execute format('alter table %I enable row level security', t);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on table %I from anon, authenticated', t);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function f_unaccent(text) from anon, authenticated, public;
  end if;
end $$;
