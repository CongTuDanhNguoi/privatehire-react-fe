# PrivateHire Cars — Frontend (Coded Interactive Prototype)

Ứng dụng web dạng điện thoại (rộng **390 px**) mô phỏng app gọi xe riêng tại Vương quốc Anh, chuyển từ bản thiết kế
Figma high-fidelity sang React chạy thật trên trình duyệt.

- Đồ án môn **UI Design** — phương án **Option B: Coded Interactive Prototype**.
- Thiết kế Figma: <https://www.figma.com/design/vcCuk3p2GNdtuF0u3dHFPo/PrivateHire-Cars> (page *Interactive Prototype*).
- **Chưa có backend thật**: dữ liệu là mock data, đăng nhập/đăng ký là *simulated authentication* lưu trong
  `localStorage` của trình duyệt. Backend thật (Node + Express + SQLite) đang được thiết kế ở repo riêng.
- Tự kiểm thử tự động: **15/15 tiêu chí nghiệm thu PASS** (`npm run selftest`).

---

## Mục lục

1. [Công nghệ](#1-công-nghệ)
2. [Cài đặt và chạy](#2-cài-đặt-và-chạy)
3. [Các lệnh npm](#3-các-lệnh-npm)
4. [Tài khoản demo và dữ liệu mẫu](#4-tài-khoản-demo-và-dữ-liệu-mẫu)
5. [Luồng màn hình và route](#5-luồng-màn-hình-và-route)
6. [Cấu trúc thư mục](#6-cấu-trúc-thư-mục)
7. [Quy tắc kiểm tra dữ liệu nhập](#7-quy-tắc-kiểm-tra-dữ-liệu-nhập)
8. [Đăng nhập giả lập (simulated auth)](#8-đăng-nhập-giả-lập-simulated-auth)
9. [Figma → code: cách làm việc](#9-figma--code-cách-làm-việc)
10. [Self-test và tiêu chí nghiệm thu](#10-self-test-và-tiêu-chí-nghiệm-thu)
11. [Quy trình Git (nhánh main / dev)](#11-quy-trình-git-nhánh-main--dev)
12. [Giới hạn hiện tại và hướng phát triển](#12-giới-hạn-hiện-tại-và-hướng-phát-triển)
13. [Xử lý sự cố thường gặp](#13-xử-lý-sự-cố-thường-gặp)

---

## 1. Công nghệ

| Hạng mục | Lựa chọn |
|---|---|
| Framework | React 19 + TypeScript (bật `strict`) |
| Build tool | Vite 7 |
| Giao diện | Tailwind CSS v4 qua `@tailwindcss/vite` (không có `tailwind.config.js`, theme đặt trong `src/index.css`) |
| Điều hướng | react-router-dom 7 (`BrowserRouter`) |
| Form | `useState` thuần (không dùng thư viện form) |
| "Backend" | Giả lập trong `src/services/auth.ts`, lưu `localStorage` |
| Kiểm thử | Playwright (script `scripts/selftest.mjs`) |
| Font | Plus Jakarta Sans (Login), Inter (các màn còn lại), Liberation Sans → Arial (thanh điều hướng Home) |

## 2. Cài đặt và chạy

**Yêu cầu:** Node.js **≥ 20.19** (Vite 7 yêu cầu; khuyên dùng bản LTS mới nhất). Kiểm tra bằng `node -v` và `npm -v`.

```bash
git clone https://github.com/CongTuDanhNguoi/privatehire-react-fe.git
cd privatehire-react-fe
npm install
npm run dev
```

Mở <http://localhost:5173>.

**Xem như trên điện thoại:** F12 → *Toggle device toolbar* (Ctrl + Shift + M) → chọn **iPhone 12 Pro**.

> Ảnh và icon Figma đã được tải sẵn vào `public/figma-assets/`, không cần chạy `npm run figma-assets` nữa
> (chỉ chạy lại khi thêm màn Figma mới).

## 3. Các lệnh npm

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy server phát triển tại <http://localhost:5173> (tự tải lại khi sửa code) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) — phải ra 0 lỗi |
| `npm run build` | Typecheck + build bản production vào `dist/` |
| `npm run preview` | Chạy thử bản đã build |
| `npm run selftest` | Chạy self-test Playwright (cần `npm run dev` đang chạy, xem [mục 10](#10-self-test-và-tiêu-chí-nghiệm-thu)) |
| `npm run figma-assets` | Tải ảnh/icon mà code Figma trỏ tới về `public/figma-assets/` và đổi đường dẫn sang file trên máy |

## 4. Tài khoản demo và dữ liệu mẫu

Tài khoản được tạo sẵn mỗi lần mở app (`seedDemoAccount()` trong `src/main.tsx`):

| Email | Mật khẩu |
|---|---|
| `alex.morgan@example.com` | `Password123` |

**Dữ liệu hợp lệ để điền nhanh form Đăng ký** (chỉ là dữ liệu test, không phải thẻ thật):

| Ô | Giá trị |
|---|---|
| Full Name / Cardholder Name | `Alex Morgan` |
| Email Address | email chưa đăng ký, ví dụ `bao.demo@example.com` |
| Home Address | `221B Baker St, London NW1 6XE` (nhập gì cũng được) |
| Phone Number | `+44 7911 123456` hoặc `0912 345 678` |
| Card Number | `4242 4242 4242 4242` |
| Expiry Date | `08/28` (gõ `0828` hoặc `08/2028` đều được) |
| CVV / CVC | `123` |
| Password / Confirm Password | `Password123` |

**Xoá dữ liệu demo:** F12 → *Application* → *Local Storage* và *Session Storage* → xoá các key `phc_*` → F5.

## 5. Luồng màn hình và route

```
Welcome ──Log In──► Login ──đúng──────────────────────────────────► Home
   └────Sign Up───► Registration ──hợp lệ──► Registration Complete ──Go to Home──► Home

Home ──Book a Ride / View All Services──► Service Selection ──Continue──► Journey Details
                                              ▲                               │
                                              └──────────── Change ───────────┘
Home ──tab Profile──► My Profile ──Log Out──► Login
```

| Đường dẫn | Màn | Quyền truy cập |
|---|---|---|
| `/` | Welcome | Chỉ khi **chưa** đăng nhập (đã đăng nhập → tự sang `/home`) |
| `/login` | Login | Chỉ khi chưa đăng nhập |
| `/register` | Registration | Chỉ khi chưa đăng nhập |
| `/register/complete` | Registration Complete | Ngay sau khi đăng ký (đã tự đăng nhập) |
| `/home` | Home | **Bắt buộc đăng nhập** |
| `/services` | Service Selection | **Bắt buộc đăng nhập** |
| `/journey` | Journey Details | **Bắt buộc đăng nhập** + đã chọn dịch vụ (chưa chọn → `/services`) |
| `/profile` | My Profile | **Bắt buộc đăng nhập** |
| `/gallery`, `/gallery/:slug` | Xem các màn Figma tĩnh chưa nối luồng | Ai cũng xem được |
| `*` | → `/` | |

- Chưa đăng nhập mà vào `/home`, `/services`, `/journey`, `/profile` → bị chuyển về `/login` (`RequireAuth`).
- **Không có** màn Booking Confirmation / Payment — đúng phạm vi đồ án.
- Dịch vụ đang chọn được giữ trong `sessionStorage`, nên F5 không bị mất. Log Out sẽ xoá lựa chọn này.

**6 dịch vụ** (`src/data/services.ts`): Local Travel · Long-Distance · Airport Transfer · Hotel Transfer ·
Airport Meet & Greet · Driver & Car Daily Hire. Mỗi lần chỉ chọn được **một**; nút **Continue** bị tắt cho tới khi chọn.

## 6. Cấu trúc thư mục

```
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── figma-assets/            ảnh + icon tải từ Figma (sinh bởi npm run figma-assets)
├── scripts/
│   ├── download-figma-assets.mjs tải ảnh Figma về máy và đổi đường dẫn trong code
│   └── selftest.mjs             self-test Playwright theo 15 tiêu chí nghiệm thu
└── src/
    ├── main.tsx                 khởi động: BrowserRouter + BookingProvider + seedDemoAccount()
    ├── App.tsx                  khai báo route + chặn quyền truy cập
    ├── index.css                Tailwind + theme
    ├── assets/logo.png
    ├── components/
    │   ├── RouteGuards.tsx      RequireAuth (bắt đăng nhập), GuestOnly (chỉ khách)
    │   ├── FigmaClickable.tsx   gắn hành động bấm vào code Figma theo data-node-id
    │   ├── BottomNav.tsx        thanh tab Home / Activity / Alerts / Profile
    │   ├── Icon.tsx             bộ icon nét (kiểu lucide) vẽ inline
    │   └── MobileFrame.tsx      khung điện thoại 390 px ở giữa màn hình
    ├── context/
    │   └── BookingContext.tsx   dịch vụ đang chọn (useBooking), lưu sessionStorage
    ├── data/
    │   └── services.ts          mock data 6 dịch vụ
    ├── services/
    │   └── auth.ts              đăng nhập giả lập (localStorage)
    ├── validation/
    │   ├── rules.ts             mỗi ô nhập một hàm kiểm tra → "" hoặc câu báo lỗi
    │   ├── loginValidation.ts   kiểm tra form Login
    │   ├── registerValidation.ts kiểm tra form Registration
    │   └── format.ts            tự định dạng khi gõ (số thẻ, ngày hết hạn)
    ├── pages/                   các màn chạy thật
    │   ├── WelcomePage.tsx      code Figma gốc + FigmaClickable
    │   ├── HomePage.tsx         code Figma gốc + FigmaClickable
    │   ├── LoginPage.tsx        chép code Figma + ô nhập, state, báo lỗi
    │   ├── JourneyDetailsPage.tsx chép code Figma + dịch vụ hiển thị động
    │   ├── RegisterPage.tsx     dựng theo ảnh thiết kế
    │   ├── RegistrationCompletePage.tsx
    │   ├── ServiceSelectionPage.tsx
    │   ├── ProfilePage.tsx
    │   └── GalleryPage.tsx      xem các màn Figma tĩnh
    ├── screens/                 ⚠️ code Figma xuất ra — KHÔNG sửa tay
    └── manifest/                danh sách màn Figma đã xuất (dùng cho /gallery)
```

## 7. Quy tắc kiểm tra dữ liệu nhập

Nguồn chuẩn: `src/validation/rules.ts`. Câu báo lỗi là **yêu cầu của đề** — không sửa chữ, không thêm dấu câu.

**Khi nào báo lỗi**
- Lỗi định dạng: khi rời ô (nếu ô không trống) và khi bấm nút gửi.
- Lỗi bỏ trống: chỉ khi bấm nút gửi.
- Lỗi từ "server" (sai mật khẩu, email trùng, bị khoá): chỉ sau khi gửi.
- Gõ lại vào ô sẽ xoá lỗi của ô đó. Khoảng trắng đầu/cuối được bỏ qua.

### Login

| Ô | Trường hợp | Câu báo lỗi |
|---|---|---|
| Email | bỏ trống | `Email address is required.` |
| Email | có dấu cách | `Email cannot contain spaces.` |
| Email | sai định dạng | `Please enter a valid email address.` |
| Password | bỏ trống | `Password is required.` |
| — | sai email **hoặc** mật khẩu (không nói rõ cái nào) | `Incorrect email or password. Please try again.` |
| — | sai 5 lần liên tiếp cùng email | `Too many attempts. Please try again in 15 minutes.` (khoá 15 phút) |

### Registration

| Ô | Quy tắc → câu báo lỗi |
|---|---|
| Full Name | trống → `Full name is required.` · < 2 ký tự → `Name must be at least 2 characters.` · > 50 → `Name must be 50 characters or fewer.` · có số/ký hiệu → `Name can only contain letters, spaces, hyphens and apostrophes.` |
| Email | như Login + đã đăng ký → `This email address is already registered. Please use a different email or log in.` |
| Home Address | trống → `Home address is required.` (nhập gì cũng được) |
| Phone Number | trống → `Phone number is required.` · không phải số → `Phone number can only contain digits.` (mọi quốc gia; bỏ qua dấu cách, `-`, `()`, dấu `+` ở đầu) |
| Cardholder Name | như Full Name, trống → `Cardholder name is required.` |
| Card Number | trống → `Card number is required.` · không phải số → `Card number can only contain digits.` · < 13 số → `Card number is incomplete.` · > 19 số → `Card number is invalid.` (không kiểm tra Luhn) |
| Expiry Date | trống → `Expiry date is required.` · sai dạng → `Use the format MM/YY.` · tháng sai → `Invalid month.` · đã qua → `Card has expired` |
| CVV / CVC | trống → `CVV is required.` · không phải số → `CVV can only contain digits.` · sai độ dài → `CVV must be 3 digits.` (thẻ Amex bắt đầu 34/37 cần 4 số) |
| Password | trống → `Password is required.` · < 8 → `Password must be at least 8 characters.` · thiếu chữ hoa → `Password must include an uppercase letter.` · thiếu số → `Password must include a number.` · trùng email → `Password cannot be the same as your email.` |
| Confirm Password | trống → `Please confirm your password.` · không khớp → `Passwords do not match.` |

**Tự định dạng khi gõ** (`src/validation/format.ts`)
- Số thẻ: chỉ nhận chữ số, tối đa 19 số, tự cách nhóm 4 số → `4242 4242 4242 4242`.
- Ngày hết hạn: tự thêm `/`; `5` → `05/`; `13` → `01/3` (tháng không vượt quá 12); gõ năm 4 số `12/2028` → `12/28`.

## 8. Đăng nhập giả lập (simulated auth)

File `src/services/auth.ts` đóng vai trò "server". Các màn hình chỉ gọi những hàm dưới đây, nên khi có backend thật
chỉ cần thay **thân hàm** bằng `fetch("/api/...")` và giữ nguyên kiểu trả về — các page không phải sửa.

| Hàm | Trả về |
|---|---|
| `seedDemoAccount()` | `Promise<void>` — tạo tài khoản demo nếu chưa có |
| `isEmailRegistered(email)` | `boolean` (không phân biệt hoa/thường) |
| `registerUser(form)` | `{ ok: true, user }` (tự đăng nhập luôn) · `{ ok: false, errors }` |
| `loginUser(email, password)` | `{ ok: true, user }` · `{ ok: false, reason: "invalid" }` · `{ ok: false, reason: "locked", minutesLeft }` |
| `getCurrentUser()` | `{ email, fullName, loggedInAt }` hoặc `null` |
| `logout()` | `void` |

| Key lưu trữ | Nơi lưu | Nội dung |
|---|---|---|
| `phc_users` | localStorage | danh sách tài khoản |
| `phc_login_attempts` | localStorage | số lần sai + thời điểm hết khoá theo email |
| `phc_session` | localStorage | người đang đăng nhập |
| `phc_selected_service` | sessionStorage | dịch vụ đang chọn |

**Bảo mật (mức demo):** mật khẩu được băm SHA-256 trước khi lưu (nếu mở bằng `http://<IP máy>` thì dùng hàm băm
dự phòng vì `crypto.subtle` chỉ có trên localhost/https). **Không** lưu số thẻ đầy đủ và CVV — chỉ lưu 4 số cuối.
Đây chỉ là mô phỏng, không dùng cho dữ liệu thật.

## 9. Figma → code: cách làm việc

| Màn | Làm từ | Muốn sửa thì |
|---|---|---|
| Welcome, Home | code Figma trong `src/screens/**` bọc bởi `FigmaClickable` | chỉ thêm/sửa hành động trong `actions` của page |
| Login, Journey Details | bản chép code Figma trong `src/pages/` + state | chỉ sửa phần động, giữ class và `data-node-id` |
| Registration, Registration Complete, Service Selection, Profile | dựng tay theo ảnh thiết kế | giữ màu/khoảng cách đang dùng |

**Gắn hành động bấm vào code Figma mà không sửa code Figma:**

```tsx
<FigmaClickable actions={{ "6:1101": () => navigate("/services") }}>
  <HomeScreen />
</FigmaClickable>
```

`"6:1101"` là `data-node-id` của nút trong code Figma (tìm theo `data-name` hoặc chữ hiển thị trong file screen).

**Màu dùng chung:** navy `#0b2341` · link `#0284c7` · tab đang chọn `#2563eb` · lỗi `#ef4444` / chữ lỗi `#dc2626` ·
chữ `#0f172a` / `#1e293b` · chữ phụ `#64748b` · chữ mờ `#94a3b8` · viền `#cbd5e1` / `#e2e8f0` · nền trang `#f1f5f9`.

**Thêm một màn Figma mới:**
1. Đặt file `.tsx` vào `src/screens/<nhóm>/` (không sửa markup sau đó).
2. Thêm vào `src/manifest/<nhóm>.json`.
3. Chuẩn hoá font: `font-['Family:Weight']` → `font-['Family',sans-serif]`.
4. Chạy `npm run figma-assets`, rồi nối hành động từ một page trong `src/pages/`.

**Không được xoá hoặc đổi tên:** thuộc tính `data-node-id` (FigmaClickable dùng), `data-testid` (self-test dùng),
và các `id` ô nhập (`#email`, `#password`, `#fullName`, `#cardNumber`, `#expiry`, …).

## 10. Self-test và tiêu chí nghiệm thu

```bash
# Terminal 1
npm run dev

# Terminal 2 (lần đầu: tải trình duyệt test, ~200 MB)
npx playwright install chromium
npm run selftest
```

Kết quả ở thư mục `selftest/`: ảnh chụp từng bước, `report.html` và `report.pdf`.

| ID | Tiêu chí |
|---|---|
| AC-01 | Chưa đăng nhập → `/home`, `/services`, `/journey`, `/profile` chuyển về `/login` |
| AC-02 | Welcome → Log In mở Login; Sign Up mở Registration |
| AC-03 | Login báo lỗi đúng câu (để trống, sai định dạng, sai mật khẩu) |
| AC-04 | Đăng nhập thành công → `/home` |
| AC-05 | Home → Book a Ride → `/services` |
| AC-06 | Continue bị tắt khi chưa chọn dịch vụ |
| AC-07 | Cả 6 dịch vụ chọn được, mỗi lần đúng 1, Continue bật sau khi chọn |
| AC-08 | Continue → Journey Details hiện đúng dịch vụ (tên, icon, mô tả) |
| AC-09 | Change → chọn dịch vụ khác → Journey cập nhật |
| AC-10 | Home ↔ My Profile qua thanh tab; Profile hiện tên + email đang đăng nhập |
| AC-11 | Log Out → `/login`; Home bị chặn lại |
| AC-12 | Registration báo lỗi đúng (10 ô trống + dữ liệu sai như Figma 2A) |
| AC-13 | Email đã tồn tại → báo trùng |
| AC-14 | Đăng ký thành công → Registration Complete → Go to Home → `/home` |
| AC-15 | Không có route Booking Confirmation / Payment |

> Mọi thay đổi code phải giữ **typecheck 0 lỗi** và **selftest 15/15 PASS**. Nếu test fail, sửa app — không sửa test.

## 11. Quy trình Git (nhánh main / dev)

| Nhánh | Dùng cho |
|---|---|
| `main` | Bản ổn định, dùng để demo / nộp bài |
| `dev` | Nhánh làm việc hằng ngày |

```bash
git switch dev
git pull
# ... sửa code ...
npm run typecheck
npm run selftest          # cần npm run dev đang chạy
git add -A
git commit -m "mô tả ngắn thay đổi"
git push
```

Khi `dev` đã ổn (15/15 PASS) thì tạo Pull Request `dev → main` trên GitHub để gộp vào bản ổn định.

## 12. Giới hạn hiện tại và hướng phát triển

**Ngoài phạm vi / chưa làm**
- Không có Booking Confirmation, Payment (đúng yêu cầu đề).
- Tab **Activity**, **Alerts** và các mục Profile (Personal Information, Saved Addresses, Payment Details) chưa có màn đích.
- **Forgot Password?** và **Continue to Vehicle Selection** chưa có hành động.
- 17 màn Figma chưa xuất được code (giới hạn lượt Figma); Registration, Registration Complete, Service Selection,
  Profile được dựng tay theo ảnh thiết kế.
- Header "‹ Book a Ride" của Service Selection là giả định (ảnh thiết kế chỉ có phần nội dung).
- Nút chính của Registration Complete là "Go to Home" (Figma ghi "Go to Login") để đáp ứng yêu cầu
  "đăng ký thành công → Home" (người dùng được đăng nhập luôn).

**Hướng phát triển: nối backend thật**
1. Backend Node + Express + TypeScript + SQLite (repo riêng), API dự kiến:
   `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`,
   `GET /api/auth/email-exists`, `GET /api/services`.
2. Thêm proxy `/api` → `http://localhost:4000` trong `vite.config.ts`.
3. Đổi thân hàm trong `src/services/auth.ts` sang `fetch("/api/...")`, giữ nguyên tên hàm và kiểu trả về.
4. Chạy lại selftest 15/15 PASS rồi mới bỏ phần lưu `localStorage`.

## 13. Xử lý sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Ảnh/icon không hiện | Kiểm tra `public/figma-assets/` có file; nếu thêm màn mới thì chạy `npm run figma-assets` |
| Đăng nhập báo "Too many attempts…" | Chờ 15 phút hoặc xoá key `phc_login_attempts` trong Local Storage |
| Đã đăng nhập mà muốn xem màn Welcome / Login | Vào Profile → Log Out, hoặc xoá key `phc_session` |
| Muốn làm lại từ đầu | Xoá toàn bộ key `phc_*` trong Local Storage + Session Storage → F5 |
| `npm run selftest` lỗi kết nối | Phải chạy `npm run dev` ở terminal khác trước (mặc định `http://localhost:5173`, đổi bằng biến `BASE_URL`) |
| Selftest báo thiếu trình duyệt | Chạy `npx playwright install chromium` |
| Giao diện nền tối khác thiết kế | Trình duyệt (Edge/Chrome) đang ép chế độ tối cho trang web — tắt *Force dark mode* hoặc tiện ích dark mode |
