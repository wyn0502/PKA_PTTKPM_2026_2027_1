<p align="center"><img src="frontend/public/logo.svg" width="72" alt="Logo Quản lý Thư viện"></p>

# Quản lý Thư viện

Hệ thống quản lý thư viện của Nhóm 9 – học phần Phân tích và thiết kế hệ thống thông tin. Mã nguồn hiện thực đúng phạm vi trong báo cáo: 12 use case, ERD 11 bảng, kiến trúc ba lớp và bảng chuyển trạng thái bản sao.

```
.
├── backend/    API Node.js + Express, PostgreSQL (kiến trúc 3 lớp)
├── frontend/   Giao diện React 18 + React Router + Vite (JavaScript thuần)
└── package.json  Lệnh tiện ích chạy cho cả hai thư mục
```

## Chạy dự án

Yêu cầu: Node.js ≥ 18 và một CSDL PostgreSQL (cài cục bộ hoặc dùng project Supabase).

```bash
npm run install:all

cp backend/.env.example backend/.env
# Điền DATABASE_URL và JWT_SECRET trong backend/.env
# Tạo JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:setup     # tạo bảng + nạp tham số và dữ liệu mẫu
npm run dev:api      # API tại http://localhost:4000/api
npm run dev:web      # giao diện tại http://localhost:5173
```

`npm --prefix backend run db:reset` xoá toàn bộ bảng rồi tạo lại dữ liệu mẫu (chỉ dùng khi phát triển).

### Dùng Supabase

1. **Project Settings → Database → Connection string**, chọn *Session pooler*, dán vào `DATABASE_URL` và đặt `DATABASE_SSL=true`.
2. `npm run db:setup`. Lược đồ bật Row Level Security trên cả 13 bảng và thu hồi quyền của `anon`/`authenticated`, nên REST API công khai của Supabase không đọc được dữ liệu (kể cả mật khẩu băm). Chỉ backend (kết nối bằng role `postgres`) truy cập được.
3. Tuỳ chọn: kết nối Supabase MCP cho Claude Code (connector Supabase trên claude.ai, hoặc `claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<mã-project>"` rồi `claude /mcp` → *Authenticate*) để xem bảng và chạy kiểm tra bảo mật của Supabase.

Trên macOS, cổng 5000 bị AirPlay Receiver chiếm nên API mặc định chạy cổng 4000.

### Tài khoản mẫu

`npm run db:setup` tạo các tài khoản `admin` (quản trị viên), `thuthu` (thủ thư), `docgia` cùng 4 độc giả khác, mỗi tài khoản một mật khẩu ngẫu nhiên. Danh sách mật khẩu chỉ in ra terminal một lần sau khi chạy, hãy lưu lại. Quên thì đăng nhập `admin` để đặt lại, hoặc chạy `npm --prefix backend run db:reset` để tạo lại từ đầu.

Dữ liệu mẫu có sẵn một phiếu quá hạn, một độc giả đang nợ phạt và một yêu cầu đặt trước để thử các luồng ngoại lệ. ISBN trong dữ liệu mẫu được sinh tự động (đúng chữ số kiểm tra), không phải ISBN thật.

## Kiến trúc ba lớp (mục 4.1)

| Lớp | Thư mục | Trách nhiệm |
| --- | --- | --- |
| Trình bày | `frontend/src` | Màn hình, kiểm tra cú pháp (trường bắt buộc, khuôn dạng ISBN, mật khẩu) |
| Nghiệp vụ (BLL) | `backend/src/services` | Quy tắc mượn, hạn mức, tính phạt, gia hạn, hàng đợi đặt trước, **ranh giới transaction** |
| Truy cập dữ liệu (DAL) | `backend/src/repositories` | Chỉ câu lệnh SQL đọc/ghi, không chứa quy tắc nghiệp vụ |
| Trung chuyển (DTO) | `backend/src/dtos` | `BookDTO`, `ReaderCardDTO`, `LoanDTO`, `FineDTO`, `LoanHistoryDTO` như Hình 4.1 |

`routes` → `controllers` (nhận request, gọi service) → `services` → `repositories`. Quy tắc nghiệp vụ thuần (bảng chuyển trạng thái, cách tính phí) nằm riêng ở `services/policies.js`; tham số (hạn mượn, mức phạt…) đọc từ bảng `system_setting`, đổi được trên giao diện mà không cần sửa mã (NFR-08).

## Use case → chức năng

| Use case | Màn hình | Ghi chú |
| --- | --- | --- |
| UC-01 Đăng nhập/đăng xuất | `/login` | Khoá tài khoản sau 5 lần sai (tham số hoá), điều hướng theo vai trò |
| UC-02 Quản lý độc giả | `/readers` | Tạo hồ sơ + thẻ có hạn + tài khoản (mật khẩu tạm hiện một lần), khoá/gia hạn thẻ, in thẻ, nhập Excel |
| UC-03 Quản lý đầu sách | `/titles` | Kiểm tra ISBN-10/13, xoá mềm, nhập Excel |
| UC-04 Quản lý bản sao | `/titles/:isbn` | Sinh mã cá biệt hàng loạt, chuyển trạng thái theo bảng 4.5, in tem mã vạch |
| UC-05 Tra cứu | `/search`, `/titles` | Tìm có dấu hoặc không dấu, số bản khả dụng, vị trí kệ |
| UC-06 Đặt trước | `/books/:isbn`, `/reservations` | Chỉ đặt khi hết bản khả dụng; trả sách tự giữ chỗ cho người đầu hàng đợi; tự hết hạn |
| UC-07 Lập phiếu mượn | `/borrow` | Quét thẻ → quét bản sao → hoàn tất, một màn hình (NFR-09), báo âm thanh khi quét lỗi |
| UC-08 Ghi nhận trả | `/return` | Trả từng bản sao, phát hiện trễ hạn/hư hỏng, báo mất |
| UC-09 Gia hạn | `/my/loans`, `/loans` | Chặn khi quá hạn, hết lượt hoặc có người đặt trước |
| UC-10 Tính và thu phạt | `/return`, `/fines` | Gợi ý số tiền theo tham số, thu ngay hoặc ghi nợ, in biên lai |
| UC-11 Thống kê – báo cáo | `/`, `/reports` | Lượt mượn – trả, theo thể loại, sách mượn nhiều, quá hạn, tồn kho, phí phạt; xuất `.xlsx` |
| UC-12 Tài khoản & phân quyền | `/accounts`, `/settings`, `/audit` | Cấp tài khoản thủ thư, khoá/mở, đổi vai trò, tham số hệ thống, nhật ký |

## Cơ sở dữ liệu

`backend/src/db/schema.sql` gồm 11 bảng theo ERD (`account`, `reader`, `librarian`, `category`, `publisher`, `book_title`, `book_copy`, `loan_record`, `loan_detail`, `reservation`, `fine_receipt`) cộng 2 bảng `system_setting` (FR-28) và `audit_log` (NFR-06) – tổng 13 bảng.

Các cột bổ sung so với ERD trong báo cáo, cần cập nhật lại mục 4.2:

| Bảng | Cột thêm | Lý do |
| --- | --- | --- |
| `account` | `failed_login_count`, `created_at` | Khoá sau N lần đăng nhập sai (UC-01) |
| `reader` | `student_code`, `identity_number`, `reader_type`, `card_issued_date`, `card_expiry_date` | Mã SV/CCCD chống trùng (UC-02 E1), thẻ có thời hạn (FR-07), hạn mượn theo loại thẻ |
| `category` | `parent_id` | Thể loại phân cấp (FR-03) |
| `book_title` | `description`, `is_deleted`, `created_at` | Xoá mềm (FR-01) |
| `book_copy` | `shelf_location`, `created_at` | Vị trí kệ (UC-04, UC-05) |
| `loan_detail` | `returned_at`, `return_condition` | Trả từng phần của phiếu (FR-16) |
| `reservation` | `barcode` | Bản sao đang được giữ cho yêu cầu |
| `fine_receipt` | `fine_type`, `barcode`, `paid_at`, `collected_by` | Phân loại vi phạm, gắn bản sao, ai thu tiền |

**Tính toàn vẹn khi lập phiếu mượn (NFR-03, NFR-04).** Backend kết nối PostgreSQL trực tiếp bằng thư viện `pg`, nên lớp nghiệp vụ mở được transaction trải trên nhiều câu lệnh (`withTransaction` trong `db/pool.js`): khoá dòng độc giả và từng bản sao (`SELECT … FOR UPDATE`), ghi `loan_record`, `loan_detail`, cập nhật `book_copy` – lỗi ở bất kỳ bước nào thì rollback toàn bộ. Thêm chỉ mục duy nhất có điều kiện `ux_loan_detail_active_copy` để CSDL tự chặn một bản sao nằm trong hai chi tiết phiếu chưa trả. Cách này thay cho phương án hàm PL/pgSQL qua RPC ở mục 2.2.3 (cần thiết khi gọi Supabase bằng `supabase-js` từ trình duyệt); nhóm nên cập nhật mục 2.2.3 và Bảng 6 cho khớp.

## API chính

Tất cả dưới `/api`, xác thực bằng `Authorization: Bearer <JWT>`.

| Nhóm | Endpoint |
| --- | --- |
| Xác thực | `POST /auth/login`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/logout` |
| Danh mục | `GET/POST /titles`, `GET/PUT/DELETE /titles/:isbn`, `POST /titles/:isbn/copies`, `POST /titles/import`, `PUT /copies/:barcode`, `PATCH /copies/:barcode/status`, `/categories`, `/publishers` |
| Độc giả | `GET/POST /readers`, `GET/PUT /readers/:id`, `PATCH /readers/:id/lock`, `POST /readers/:id/renew-card`, `POST /readers/:id/reset-password`, `POST /readers/import` |
| Lưu thông | `GET /circulation/readers/:code`, `GET /circulation/copies/:barcode`, `POST /loans`, `GET /loans`, `GET /loans/:id`, `POST /loans/:id/renew`, `POST /circulation/return`, `POST /circulation/lost` |
| Đặt trước | `GET/POST /reservations`, `POST /reservations/:id/cancel` |
| Phí phạt | `GET/POST /fines`, `GET /fines/suggest`, `POST /fines/:id/pay` |
| Báo cáo | `GET /reports/summary`, `GET /reports/:type`, `GET /reports/:type/export` |
| Quản trị | `/accounts…`, `GET/PUT /settings`, `GET /audit-logs`, `GET /templates/:type` |
| Cổng độc giả | `GET /me/profile`, `/me/loans`, `/me/reservations`, `/me/fines` |

## Chưa làm

- Gửi email khi sách đặt trước về (UC-08 bước 3): hiện thông báo trong cổng độc giả.
- Đo hiệu năng NFR-01/NFR-02 trên tập 10.000 đầu sách – kịch bản ở mục 5.3 của báo cáo.
