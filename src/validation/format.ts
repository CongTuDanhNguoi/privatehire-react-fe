// =============================================================
// format.ts — Tự định dạng ô nhập trong lúc gõ (không báo lỗi, chỉ sửa cách hiển thị)
// Để regex ở đây thay vì trong UI.
// =============================================================

// Số thẻ: chỉ giữ số, tối đa 19 số, cách nhóm 4 số: "4242424242424242" -> "4242 4242 4242 4242"
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Ngày hết hạn MM/YY: tự thêm "/" và chặn tháng sai ngay khi gõ
//   "5"   -> "05/"   (tháng 2–9 thì thêm số 0 phía trước)
//   "13"  -> "01/3"  (không có tháng 13 -> hiểu là tháng 01, năm bắt đầu bằng 3)
//   "1228"-> "12/28"
//   "12/2028" -> "12/28" (gõ năm đủ 4 số thì tự rút về 2 số cuối)
// `previous` để biết người dùng đang xoá: xoá "12/" thì không tự thêm "/" lại.
export function formatExpiry(value: string, previous = ""): string {
  let digits = value.replace(/\D/g, "");
  if (/^[2-9]/.test(digits)) digits = "0" + digits;
  if (/^1[3-9]/.test(digits)) digits = "01" + digits.slice(1);
  if (digits.length > 4) {
    // Năm bắt đầu bằng "20" -> đang gõ năm 4 số (2028): chờ đủ rồi lấy 2 số cuối
    if (digits.slice(2, 4) === "20") {
      const mm = digits.slice(0, 2);
      return digits.length >= 6 ? `${mm}/${digits.slice(4, 6)}` : `${mm}/${digits.slice(2)}`;
    }
    digits = digits.slice(0, 4);
  }

  const deleting = value.length < previous.length;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length === 2 && !deleting) return `${digits}/`;
  return digits;
}
