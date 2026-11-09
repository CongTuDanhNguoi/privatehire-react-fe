// =============================================================
// registerValidation.js — Kiểm tra form Đăng ký (Registration)
// Giao diện Registration do bạn khác trong nhóm dựng; họ chỉ cần gọi:
//
//   import { validateRegistration } from "../validation/registerValidation";
//   const errors = validateRegistration(form, { isEmailTaken });
//   if (Object.keys(errors).length === 0) { ...đăng ký... }
//
// rồi hiển thị errors.<tênÔ> dưới từng ô.
// =============================================================
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePhone,
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateNewPassword,
  validateConfirmPassword,
} from "./rules";

export const DUPLICATE_EMAIL_MESSAGE =
  "This email address is already registered. Please use a different email or log in.";

// Tên các ô trong form (đặt đúng tên này để dùng chung với hàm bên dưới)
export interface RegistrationForm {
  fullName: string;
  email: string;
  homeAddress: string;
  phone: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  password: string;
  confirmPassword: string;
}
export type RegistrationField = keyof RegistrationForm;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;
export interface RegistrationOptions {
  now?: Date;
  isEmailTaken?: (email: string) => boolean;
}

export const EMPTY_REGISTRATION: RegistrationForm = {
  fullName: "",
  email: "",
  homeAddress: "",
  phone: "",
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  password: "",
  confirmPassword: "",
};

export const REGISTRATION_FIELDS: RegistrationField[] = [
  "fullName",
  "email",
  "homeAddress",
  "phone",
  "cardholderName",
  "cardNumber",
  "expiry",
  "cvv",
  "password",
  "confirmPassword",
];

// Kiểm tra MỘT ô (dùng khi người dùng rời khỏi ô — onBlur)
export function validateRegistrationField(
  name: RegistrationField,
  form: RegistrationForm,
  { now, isEmailTaken }: RegistrationOptions = {}
): string {
  switch (name) {
    case "fullName":
      return validateName(form.fullName, "Full name");
    case "email": {
      const formatError = validateEmail(form.email);
      if (formatError) return formatError;
      if (isEmailTaken && isEmailTaken(form.email)) return DUPLICATE_EMAIL_MESSAGE;
      return "";
    }
    case "homeAddress":
      return validateAddress(form.homeAddress);
    case "phone":
      return validatePhone(form.phone);
    case "cardholderName":
      return validateName(form.cardholderName, "Cardholder name");
    case "cardNumber":
      return validateCardNumber(form.cardNumber);
    case "expiry":
      return validateExpiry(form.expiry, now);
    case "cvv":
      return validateCvv(form.cvv, form.cardNumber);
    case "password":
      return validateNewPassword(form.password, form.email);
    case "confirmPassword":
      return validateConfirmPassword(form.confirmPassword, form.password);
    default:
      return "";
  }
}

// Kiểm tra CẢ form (dùng khi bấm "Create Account")
export function validateRegistration(form: RegistrationForm, options: RegistrationOptions = {}): RegistrationErrors {
  const errors: RegistrationErrors = {};
  for (const name of REGISTRATION_FIELDS) {
    const message = validateRegistrationField(name, form, options);
    if (message) errors[name] = message;
  }
  return errors;
}
