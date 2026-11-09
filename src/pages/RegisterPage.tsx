// =============================================================
// RegisterPage — màn Đăng ký chạy thật.
// Giao diện dựng theo Figma "Screen 2A / 2B — Registration" (6:499, 6:638):
// header Cancel | logo + Registration | Login, 3 nhóm ô nhập, nút Create Account.
// Lỗi hiển thị giống Figma: viền đỏ 2px, icon (!) ở ô email, câu lỗi đỏ bên dưới.
// =============================================================
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Icon, { type IconName } from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import {
  EMPTY_REGISTRATION,
  REGISTRATION_FIELDS,
  validateRegistration,
  validateRegistrationField,
  type RegistrationErrors,
  type RegistrationField,
  type RegistrationForm,
} from "../validation/registerValidation";
import { formatCardNumber, formatExpiry } from "../validation/format";
import { isEmailRegistered, registerUser } from "../services/auth";

const FONT = "font-['Inter',sans-serif]";

// ---------- ô nhập ----------
interface FieldProps {
  name: RegistrationField;
  label: string;
  value: string;
  error?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  showErrorIcon?: boolean;
  trailing?: ReactNode;
  inputRef?: (el: HTMLInputElement | null) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

function Field({ name, label, value, error, type = "text", inputMode, autoComplete, placeholder, maxLength, showErrorIcon, trailing, inputRef, onChange, onBlur }: FieldProps) {
  const errorId = `${name}-error`;
  const hasError = Boolean(error);
  const padRight = trailing || (hasError && showErrorIcon) ? "pr-10" : "pr-[15px]";
  return (
    <div className="flex w-full flex-col">
      <label htmlFor={name} className={`${FONT} pb-1 text-[12px] leading-4 font-semibold text-[#1e293b]`}>
        {label} <span className="text-[#ef4444]">*</span>
      </label>
      <div className="relative w-full">
        <input
          id={name}
          name={name}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`${FONT} block h-11 w-full rounded-lg bg-white pl-[15px] ${padRight} text-[14px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] ${
            hasError ? "border-2 border-[#ef4444]" : "border border-[#cbd5e1] focus:border-[#0b2341]"
          }`}
        />
        {hasError && showErrorIcon && !trailing && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#ef4444]">
            <Icon name="alert" size={20} />
          </span>
        )}
        {trailing && <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className={`${FONT} pt-1 text-[11px] leading-[15px] text-[#dc2626]`}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ title, icon, requiredNote }: { title: string; icon?: IconName; requiredNote?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between border-b border-[#e2e8f0] pb-[5px]">
      <h2 className={`${FONT} text-[11px] leading-4 font-semibold tracking-[0.6px] text-[#64748b] uppercase`}>
        {title}
        {!requiredNote && <span className="text-[#ef4444]"> *</span>}
      </h2>
      {requiredNote && <span className={`${FONT} text-[10px] text-[#ef4444]`}>• Required fields</span>}
      {icon && (
        <span className="text-[#94a3b8]">
          <Icon name={icon} size={16} strokeWidth={1.8} />
        </span>
      )}
    </div>
  );
}

// ---------- trang ----------
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegistrationForm>(EMPTY_REGISTRATION);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<Partial<Record<RegistrationField, HTMLInputElement | null>>>({});

  const opts = { isEmailTaken: isEmailRegistered };

  function change(name: RegistrationField) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Số thẻ tự cách nhóm 4 số, ngày hết hạn tự thêm "/"
      const value =
        name === "cardNumber" ? formatCardNumber(raw) : name === "expiry" ? formatExpiry(raw, form.expiry) : raw;
      setForm((f) => ({ ...f, [name]: value }));
      if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };
  }

  // Rời ô: chỉ báo lỗi định dạng khi đã gõ (ô trống chỉ báo khi bấm Create Account)
  function blur(name: RegistrationField) {
    return () => {
      if (!form[name].trim()) return;
      setErrors((er) => ({ ...er, [name]: validateRegistrationField(name, form, opts) || undefined }));
      // Gõ lại mật khẩu thì kiểm tra lại ô xác nhận
      if (name === "password" && form.confirmPassword) {
        setErrors((er) => ({ ...er, confirmPassword: validateRegistrationField("confirmPassword", form, opts) || undefined }));
      }
    };
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const found = validateRegistration(form, opts);
    setErrors(found);
    const first = REGISTRATION_FIELDS.find((f) => found[f]);
    if (first) {
      inputs.current[first]?.focus();
      return;
    }
    setSubmitting(true);
    const result = await registerUser(form);
    setSubmitting(false);
    if (result.ok) navigate("/register/complete", { replace: true, state: { email: result.user.email } });
    else setErrors(result.errors);
  }

  const field = (name: RegistrationField) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: change(name),
    onBlur: blur(name),
    inputRef: (el: HTMLInputElement | null) => {
      inputs.current[name] = el;
    },
  });

  const eyeButton = (shown: boolean, toggle: () => void, label: string) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      className="flex size-7 cursor-pointer items-center justify-center text-[#94a3b8]"
    >
      <Icon name={shown ? "eyeOff" : "eye"} size={16} />
    </button>
  );

  return (
    <MobileFrame>
      <div className="flex min-h-[844px] flex-col bg-[#f8fafc] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        {/* Header (Figma 6:500) */}
        <header className="flex h-[57px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4">
          <button type="button" onClick={() => navigate("/")} className={`${FONT} flex cursor-pointer items-center gap-1 text-[14px] text-[#475569]`}>
            <Icon name="chevronLeft" size={16} />
            Cancel
          </button>
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="PrivateHire Cars" className="h-7 w-[54px] rounded object-cover" />
            <h1 className={`${FONT} text-[16px] leading-6 font-bold text-[#0f172a]`}>Registration</h1>
          </div>
          <button type="button" onClick={() => navigate("/login")} className={`${FONT} cursor-pointer text-[14px] font-semibold text-[#0284c7]`}>
            Login
          </button>
        </header>

        <form noValidate onSubmit={submit} className="flex flex-col gap-6 px-4 pt-4 pb-8">
          <fieldset className="flex flex-col gap-[14px]">
            <SectionTitle title="Personal details" requiredNote />
            <Field {...field("fullName")} label="Full Name" autoComplete="name" placeholder="Alex Morgan" />
            <Field {...field("email")} label="Email Address" type="email" inputMode="email" autoComplete="email" placeholder="alex.morgan@example.com" showErrorIcon />
            <Field {...field("homeAddress")} label="Home Address" autoComplete="street-address" placeholder="221B Baker St, London NW1 6XE" />
            <Field {...field("phone")} label="Phone Number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+44 7911 123456" />
          </fieldset>

          <fieldset className="flex flex-col gap-[14px]">
            <SectionTitle title="Payment information (test data only)" icon="creditCard" />
            <Field {...field("cardholderName")} label="Cardholder Name" autoComplete="cc-name" placeholder="Alex Morgan" />
            <Field {...field("cardNumber")} label="Card Number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" maxLength={23} />
            <div className="grid grid-cols-2 gap-3">
              <Field {...field("expiry")} label="Expiry Date" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength={7} />
              <Field {...field("cvv")} label="CVV / CVC" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4} />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-[14px]">
            <SectionTitle title="Account security" icon="shield" />
            <Field
              {...field("password")}
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              trailing={eyeButton(showPassword, () => setShowPassword((v) => !v), "password")}
            />
            <Field
              {...field("confirmPassword")}
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              trailing={eyeButton(showConfirm, () => setShowConfirm((v) => !v), "confirm password")}
            />
          </fieldset>

          <div className="flex flex-col items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`${FONT} flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b2341] text-[15px] font-medium text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:cursor-wait`}
            >
              Create Account <span aria-hidden="true">→</span>
            </button>
            <p className={`${FONT} text-[12px] text-[#64748b]`}>
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/login")} className="cursor-pointer font-semibold text-[#0284c7]">
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </MobileFrame>
  );
}
