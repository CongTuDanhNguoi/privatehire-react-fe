// =============================================================
// rules.js — Quy tắc kiểm tra từng ô nhập (dùng chung cho Login và Registration)
// Mỗi hàm nhận giá trị người dùng nhập và trả về:
//   ""            -> hợp lệ
//   "Thông báo"   -> câu báo lỗi hiển thị dưới ô nhập
// =============================================================

// ---------- Email ----------
// Phần trước @ (không có dấu cách / @) + "@" + tên miền + "." + đuôi >= 2 chữ cái
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function validateEmail(value?: string): string {
  const email = (value ?? "").trim();
  if (!email) return "Email address is required.";
  if (/\s/.test(email)) return "Email cannot contain spaces.";
  if (email.length > 254 || email.includes("..") || !EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
}

// ---------- Mật khẩu khi ĐĂNG NHẬP ----------
// Lúc đăng nhập chỉ kiểm tra có nhập hay không.
// (Không áp quy tắc độ mạnh ở đây — sai mật khẩu sẽ do bước so sánh tài khoản báo.)
export function validateLoginPassword(value?: string): string {
  if (!value) return "Password is required.";
  return "";
}

// ---------- Mật khẩu khi ĐĂNG KÝ ----------
export function validateNewPassword(value?: string, email = ""): string {
  const pw = value ?? "";
  if (!pw) return "Password is required.";
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
  if (!/\d/.test(pw)) return "Password must include a number.";
  if (email && pw.trim().toLowerCase() === email.trim().toLowerCase()) {
    return "Password cannot be the same as your email.";
  }
  return "";
}

export function validateConfirmPassword(confirm?: string, password?: string): string {
  if (!confirm) return "Please confirm your password.";
  if (confirm !== password) return "Passwords do not match.";
  return "";
}

// ---------- Họ tên / Tên chủ thẻ ----------
// Cho phép chữ cái (kể cả có dấu), dấu cách, gạch nối, nháy đơn: "Mary-Jane", "O'Brien"
const NAME_REGEX = /^[\p{L}][\p{L}\s'’-]*$/u;

export function validateName(value?: string, label = "Full name"): string {
  const name = (value ?? "").trim();
  if (!name) return `${label} is required.`;
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > 50) return "Name must be 50 characters or fewer.";
  if (!NAME_REGEX.test(name)) {
    return "Name can only contain letters, spaces, hyphens and apostrophes.";
  }
  return "";
}

// ---------- Địa chỉ nhà ----------
// Nhập gì cũng được, chỉ cần không bỏ trống
export function validateAddress(value?: string): string {
  const address = (value ?? "").trim();
  if (!address) return "Home address is required.";
  return "";
}

// ---------- Số điện thoại ----------
// Định dạng nào cũng được (không bắt buộc số UK), nhưng chỉ được là số.
// Bỏ qua dấu cách, gạch nối, ngoặc và dấu + ở đầu: 0912 345 678 | +84 912 345 678
export function validatePhone(value?: string): string {
  const raw = (value ?? "").trim();
  if (!raw) return "Phone number is required.";
  const phone = raw.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(phone)) return "Phone number can only contain digits.";
  return "";
}

// ---------- Số thẻ ----------
// Thuật toán Luhn: cách ngân hàng kiểm tra số thẻ có "đúng dạng" hay không
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

// Số thẻ: toàn là số, dài 13–19 số như thẻ thật — không kiểm tra Luhn
export function validateCardNumber(value?: string): string {
  const card = (value ?? "").replace(/\s/g, "");
  if (!card) return "Card number is required.";
  if (/\D/.test(card)) return "Card number can only contain digits.";
  if (card.length < 13) return "Card number is incomplete.";
  if (card.length > 19) return "Card number is invalid.";
  return "";
}

// ---------- Ngày hết hạn (MM/YY) ----------
// `now` để truyền ngày giả khi test; mặc định là hôm nay.
export function validateExpiry(value?: string, now: Date = new Date()): string {
  const exp = (value ?? "").trim();
  if (!exp) return "Expiry date is required.";
  const match = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return "Use the format MM/YY.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Invalid month.";
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  // Thẻ còn dùng được đến hết tháng ghi trên thẻ
  if (year < nowYear || (year === nowYear && month < nowMonth)) return "Card has expired";
  return "";
}

// ---------- CVV / CVC ----------
// Thẻ American Express (bắt đầu 34 hoặc 37) dùng 4 số, còn lại 3 số
export function validateCvv(value?: string, cardNumber = ""): string {
  const cvv = (value ?? "").trim();
  if (!cvv) return "CVV is required.";
  if (/\D/.test(cvv)) return "CVV can only contain digits.";
  const isAmex = /^3[47]/.test((cardNumber ?? "").replace(/\s/g, ""));
  const needed = isAmex ? 4 : 3;
  if (cvv.length !== needed) return `CVV must be ${needed} digits.`;
  return "";
}
