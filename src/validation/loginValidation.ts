import { validateEmail, validateLoginPassword } from "./rules";

// Kiểm tra cả form Đăng nhập. Trả về object chỉ chứa các ô bị lỗi.
// Ví dụ: { email: "Please enter a valid email address." }
export interface LoginForm {
  email: string;
  password: string;
}
export type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export function validateLogin({ email, password }: LoginForm): LoginErrors {
  const errors: LoginErrors = {};
  const emailError = validateEmail(email);
  const passwordError = validateLoginPassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

// Các câu thông báo ở banner đỏ (lỗi từ phía "server")
export const LOGIN_MESSAGES = {
  invalidCredentials: "Incorrect email or password. Please try again.",
  locked: (minutes: number) =>
    `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
};
