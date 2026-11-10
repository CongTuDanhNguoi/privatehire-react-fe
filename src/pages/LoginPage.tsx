// =============================================================
// LoginPage — màn Đăng nhập CHẠY THẬT.
// Giao diện lấy NGUYÊN từ code Figma xuất ra (src/screens/login/*):
//   Screen 1  — Normal Login             (6:820)  -> trạng thái ban đầu
//   Screen 2  — Invalid Login            (6:957)  -> banner đỏ khi sai tài khoản
//   Screen 2A — Empty Fields Validation  (6:883)  -> viền đỏ + câu lỗi dưới ô
// Chỉ thay: chữ tĩnh -> <input>, div nút -> <button>, thêm state + kiểm tra lỗi.
// =============================================================
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { validateEmail } from "../validation/rules";
import { validateLogin, LOGIN_MESSAGES, type LoginErrors } from "../validation/loginValidation";
import { loginUser } from "../services/auth";

// Ảnh/icon của Screen 1 (6:820)
const assetPathPrefix = "/figma-assets/30cbb8c3-9c14-41b3-8054-34d441a5bd1d";
const imgPrivateHireCars = `${assetPathPrefix}/b1d31.png`;
const imgSvg = `${assetPathPrefix}/d7922.svg`;
const imgSvgMailIcon = `${assetPathPrefix}/68595.svg`;
const imgSvgLockIcon = `${assetPathPrefix}/5eaed.svg`;
const imgSvg1 = `${assetPathPrefix}/b971a.svg`;
// Icon (!) trong ô email lỗi — lấy từ Screen 2A (6:883)
const assetPathPrefix2A = "/figma-assets/0e8f856d-25aa-4397-94a8-551c028f4450";
const imgErrorIcon = `${assetPathPrefix2A}/1f471.svg`;
// Icon trong banner đỏ — lấy từ Screen 2 (6:957)
const assetPathPrefix2 = "/figma-assets/2f6eeb28-b586-4cd5-8d93-ea1ca0e3edfc";
const imgAlertIcon = `${assetPathPrefix2}/97beb.svg`;

const FONT = "font-['Plus_Jakarta_Sans',sans-serif]";

// Khung ô nhập: bình thường (Screen 1) / lỗi (Screen 2A)
const boxClass = (hasError: boolean) =>
  `bg-white border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full ${
    hasError ? "border-2 border-[#ef4444] p-[2px]" : "border border-[#cbd5e1] p-px"
  }`;

const inputClass = `${FONT} font-medium w-full bg-transparent outline-none text-[#0f172a] text-[14px] leading-[normal] placeholder:text-[#94a3b8]`;

// Câu lỗi dưới ô (Screen 2A, node 6:923 / 6:941)
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative">
        <div className={`[word-break:break-word] flex flex-col ${FONT} font-medium justify-center leading-[0] relative shrink-0 text-[#dc2626] text-[12px] w-full`}>
          <p id={id} className="leading-[16px]">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email || "";
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [banner, setBanner] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
    if (banner) setBanner("");
  }
  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
    if (banner) setBanner("");
  }
  // Rời ô email: chỉ kiểm tra định dạng nếu đã gõ (lỗi "bỏ trống" chỉ báo khi bấm Log In)
  function onEmailBlur() {
    if (email.trim()) setErrors((p) => ({ ...p, email: validateEmail(email) || undefined }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const formErrors = validateLogin({ email, password });
    setErrors(formErrors);
    setBanner("");
    if (formErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (formErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    const result = await loginUser(email, password);
    setSubmitting(false);
    if (result.ok) navigate("/home", { replace: true });
    else if (result.reason === "locked") setBanner(LOGIN_MESSAGES.locked(result.minutesLeft));
    else setBanner(LOGIN_MESSAGES.invalidCredentials);
  }

  const goBack = () => navigate("/");

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-0 sm:py-10">
      <div className="mx-auto w-full max-w-[390px] min-h-[884px] flex">
        <div className="border border-[rgba(226,232,240,0.8)] border-solid content-stretch flex flex-col items-start p-px relative shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] w-full" data-node-id="6:820" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(241, 245, 249) 0%, rgb(241, 245, 249) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Screen 1 — Normal Login">
          <div className="bg-white border-[rgba(241,245,249,0.8)] border-b border-solid relative shrink-0 w-full" data-node-id="6:821" data-name="Header - TopBarNavigation">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[13px] pt-[28px] px-[20px] relative size-full">
              <button type="button" onClick={goBack} className="relative shrink-0 cursor-pointer" data-node-id="6:822" data-name="Back Link">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center relative size-full">
                  <div className="relative shrink-0 size-[16px]" data-node-id="6:823" data-name="SVG">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg} />
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:825" data-name="Container">
                    <div className={`[word-break:break-word] flex flex-col ${FONT} font-semibold justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] whitespace-nowrap`} data-node-id="6:826">
                      <p className="leading-[20px]">Back</p>
                    </div>
                  </div>
                </div>
              </button>
              <div className="relative shrink-0" data-node-id="6:827" data-name="Page Title Indicator">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                  <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[1.2px] uppercase whitespace-nowrap`} data-node-id="6:828">
                    <p className="leading-[16px]">LOG IN</p>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => navigate("/register")} className="relative shrink-0 cursor-pointer" data-node-id="6:829" data-name="Register Link">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                  <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#0284c7] text-[14px] whitespace-nowrap`} data-node-id="6:830">
                    <p className="leading-[20px]">Register</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-node-id="6:831" data-name="MainContentArea">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[40px] pt-[20px] px-[24px] relative size-full">
              <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-node-id="6:832" data-name="Upper Section: Branding & Form">
                <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-node-id="6:833" data-name="Section - LogoAndHeading">
                  <div className="content-stretch flex flex-col items-start pb-[20px] relative shrink-0 w-[195px]" data-node-id="6:834" data-name="Official Logo with clean background:margin">
                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[195px]" data-node-id="6:835" data-name="Official Logo with clean background">
                      <div className="aspect-[195/100.94000244140625] flex-[1_0_0] min-w-px relative" data-node-id="6:836" data-name="PrivateHire Cars">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img alt="PrivateHire Cars" className="absolute left-0 max-w-none size-full top-0" src={imgPrivateHireCars} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#0b2341] text-[24px] text-center tracking-[-0.6px] whitespace-nowrap`} data-node-id="6:837">
                    <h1 className="leading-[32px]">Log In</h1>
                  </div>
                  <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-node-id="6:838" data-name="Margin">
                    <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:839" data-name="Container">
                      <div className={`[word-break:break-word] flex flex-col ${FONT} font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[14px] text-center whitespace-nowrap`} data-node-id="6:840">
                        <p className="leading-[20px]">Customer Account Login</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form noValidate onSubmit={onSubmit} className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-node-id="6:841" data-name="LoginForm">
                  {/* Banner lỗi — Screen 2 (6:979) */}
                  {banner && (
                    <div role="alert" className="bg-[#fef2f2] border border-[#fecaca] border-solid content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[10px] items-center p-[13px] relative rounded-[8px] shrink-0 w-full" data-node-id="6:979">
                      <div className="relative shrink-0 size-[16px]" data-node-id="6:980" data-name="SVG">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAlertIcon} />
                      </div>
                      <div className="relative shrink-0">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className={`[word-break:break-word] flex flex-col ${FONT} font-medium justify-center leading-[0] relative shrink-0 text-[#b91c1c] text-[12px]`} data-node-id="6:985">
                            <p className="leading-[16px]">{banner}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ô Email */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-node-id="6:842" data-name="Email Address Input Field">
                    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:843" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:844" data-name="Label">
                        <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#1e293b] text-[12px] whitespace-nowrap`} data-node-id="6:845">
                          <label htmlFor="email">
                            <span className="leading-[16px]">{`Email Address `}</span>
                            <span className={`[word-break:break-word] ${FONT} font-bold leading-[16px] text-[#ef4444]`}>*</span>
                          </label>
                        </div>
                      </div>
                      <div className="h-[16.5px] relative shrink-0 w-[47.88px]" data-node-id="6:846" data-name="Container">
                        <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col ${FONT} font-medium justify-center leading-[0] left-0 text-[#94a3b8] text-[11px] top-[7.5px] whitespace-nowrap`} data-node-id="6:847">
                          <p className="leading-[16.5px]">Required</p>
                        </div>
                      </div>
                    </div>
                    <div className={boxClass(!!errors.email)} data-node-id="6:848" data-name="Background+Border+Shadow">
                      <div className="relative shrink-0 w-full" data-node-id="6:849" data-name="Input">
                        <div className={`bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center overflow-clip pl-[44px] ${errors.email ? "pr-[40px]" : "pr-[16px]"} py-[15px] relative rounded-[inherit] size-full`}>
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="6:850" data-name="Container">
                            <input
                              id="email"
                              ref={emailRef}
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              placeholder="customer@example.com"
                              value={email}
                              onChange={onEmailChange}
                              onBlur={onEmailBlur}
                              aria-invalid={!!errors.email}
                              aria-describedby={errors.email ? "email-error" : undefined}
                              className={inputClass}
                              data-node-id="6:851"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 top-0 pointer-events-none" data-node-id="6:852" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[14px] relative size-full">
                          <div className="relative shrink-0 size-[20px]" data-node-id="6:853" data-name="SVG - Mail Icon">
                            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvgMailIcon} />
                          </div>
                        </div>
                      </div>
                      {errors.email && (
                        <div className="absolute bottom-0 right-0 top-0 pointer-events-none" data-node-id="6:918" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pr-[14px] relative size-full">
                            <div className="relative shrink-0 size-[20px]" data-node-id="6:919" data-name="SVG">
                              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgErrorIcon} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <FieldError id="email-error" message={errors.email} />
                  </div>

                  {/* Ô Password */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start pb-[8px] relative shrink-0 w-full" data-node-id="6:855" data-name="Password Input Field">
                    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:856" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="6:857" data-name="Label">
                        <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#1e293b] text-[12px] whitespace-nowrap`} data-node-id="6:858">
                          <label htmlFor="password">
                            <span className="leading-[16px]">{`Password `}</span>
                            <span className={`[word-break:break-word] ${FONT} font-bold leading-[16px] text-[#ef4444]`}>*</span>
                          </label>
                        </div>
                      </div>
                      <div className="h-[16.5px] relative shrink-0 w-[47.88px]" data-node-id="6:859" data-name="Container">
                        <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col ${FONT} font-medium justify-center leading-[0] left-0 text-[#94a3b8] text-[11px] top-[7.5px] whitespace-nowrap`} data-node-id="6:860">
                          <p className="leading-[16.5px]">Required</p>
                        </div>
                      </div>
                    </div>
                    <div className={boxClass(!!errors.password)} data-node-id="6:861" data-name="Background+Border+Shadow">
                      <div className="relative shrink-0 w-full" data-node-id="6:862" data-name="Input">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center overflow-clip pl-[44px] pr-[64px] py-[15px] relative rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="6:863" data-name="Container">
                            <input
                              id="password"
                              ref={passwordRef}
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              // Screen 1 dùng "••••" làm chữ mờ, Screen 2A dùng "Enter your password"
                              placeholder={errors.password ? "Enter your password" : "••••••••••••"}
                              value={password}
                              onChange={onPasswordChange}
                              aria-invalid={!!errors.password}
                              aria-describedby={errors.password ? "password-error" : undefined}
                              className={inputClass}
                              data-node-id="6:864"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 top-0 pointer-events-none" data-node-id="6:865" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[14px] relative size-full">
                          <div className="relative shrink-0 size-[20px]" data-node-id="6:866" data-name="SVG - Lock Icon">
                            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvgLockIcon} />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute bottom-0 right-0 top-0 cursor-pointer"
                        data-node-id="6:868"
                        data-name="Button - Toggle password visibility"
                      >
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-[16.5px] pr-[14px] pt-[15.5px] relative size-full">
                          <div className={`[word-break:break-word] flex flex-col ${FONT} font-bold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] text-center tracking-[0.6px] whitespace-nowrap`} data-node-id="6:869">
                            <p className="leading-[16px]">{showPassword ? "HIDE" : "SHOW"}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                    <FieldError id="password-error" message={errors.password} />
                    <div className="content-stretch flex items-start justify-end pt-[4px] relative shrink-0 w-full" data-node-id="6:870" data-name="Forgot Password Link">
                      {/* Figma chưa có màn Forgot Password -> link chưa dẫn đi đâu */}
                      <button type="button" className="content-stretch flex flex-col items-start relative self-stretch shrink-0 cursor-pointer" data-node-id="6:871" data-name="Link">
                        <div className={`[word-break:break-word] flex flex-col ${FONT} font-semibold justify-center leading-[0] relative shrink-0 text-[#0284c7] text-[12px] whitespace-nowrap`} data-node-id="6:872">
                          <p className="leading-[16px]">Forgot Password?</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="bg-[#0b2341] content-stretch flex gap-[8.01px] items-center justify-center px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-full cursor-pointer disabled:cursor-wait" data-node-id="6:873" data-name="Primary Submit Button → Button">
                    <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-node-id="6:874" data-name="Button:shadow" />
                    <div className="content-stretch flex flex-col items-center relative shrink-0" data-node-id="6:875" data-name="Container">
                      <div className={`[word-break:break-word] flex flex-col ${FONT} font-semibold justify-center leading-[0] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap`} data-node-id="6:876">
                        <p className="leading-[24px]">Log In</p>
                      </div>
                    </div>
                    <div className="relative shrink-0 size-[16px]" data-node-id="6:877" data-name="SVG">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg1} />
                    </div>
                  </button>
                </form>
              </div>
              <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0 w-full" data-node-id="6:879" data-name="BottomNavigationFooter:margin">
                <div className="[word-break:break-word] content-stretch flex gap-[4px] items-start justify-center leading-[0] relative shrink-0 text-[14px] text-center w-full whitespace-nowrap" data-node-id="6:880" data-name="BottomNavigationFooter → Register redirect">
                  <div className={`flex flex-col ${FONT} font-normal justify-center relative shrink-0 text-[#475569]`} data-node-id="6:881">
                    <p className="leading-[20px]">{`Don't have an account? `}</p>
                  </div>
                  <button type="button" onClick={() => navigate("/register")} className={`flex flex-col ${FONT} font-bold justify-center relative shrink-0 text-[#0284c7] cursor-pointer`} data-node-id="6:882">
                    <p className="leading-[20px]">Register / Sign Up</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
