// =============================================================
// RegistrationCompletePage — "Screen 3 — Registration Success" (Figma 6:773)
// Tài khoản đã được tạo và tự đăng nhập -> nút chính đưa vào Home.
// =============================================================
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { getCurrentUser, logout } from "../services/auth";

const FONT = "font-['Inter',sans-serif]";

export default function RegistrationCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const email = (location.state as { email?: string } | null)?.email ?? user?.email;

  // Chỉ vào được ngay sau khi đăng ký thành công
  if (!user || !email) return <Navigate to="/register" replace />;

  return (
    <MobileFrame>
      <div className="flex min-h-[844px] flex-col bg-[#f8fafc] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <header className="flex h-[57px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4">
          <span className="w-[51px]" />
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="PrivateHire Cars" className="h-7 w-[54px] rounded object-cover" />
            <h1 className={`${FONT} text-[16px] leading-6 font-bold text-[#0f172a]`}>Registration Complete</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-between px-4 pt-8 pb-4">
          <div className="flex flex-col items-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#059669] text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
              <Icon name="check" size={32} strokeWidth={2.5} />
            </div>
            <h2 className={`${FONT} pt-4 text-center text-[22px] leading-8 font-bold text-[#0f172a]`}>Account Created Successfully</h2>
            <p className={`${FONT} px-3 pt-2 text-center text-[15px] leading-[26px] text-[#475569]`}>
              Your PrivateHire Cars account has been created successfully. You are now signed in and can continue to Home.
            </p>

            <div className="mt-6 w-full rounded-xl border border-[#e2e8f0] bg-white p-[17px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <p className={`${FONT} flex items-center gap-2 text-[12px] font-bold tracking-[0.6px] text-[#334155] uppercase`}>
                <span className="text-[#2563eb]"><Icon name="mail" size={16} /></span>
                Confirmation email sent
              </p>
              <p data-testid="registered-email" className={`${FONT} pt-2 text-[14px] leading-5 font-semibold text-[#0f172a]`}>{email}</p>
              <p className={`${FONT} pt-2 text-[11px] leading-[18px] text-[#64748b]`}>
                A confirmation email has been simulated for this prototype. Email activation is not required.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-10">
            <button
              type="button"
              onClick={() => navigate("/home", { replace: true })}
              className={`${FONT} flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b2341] text-[16px] font-semibold text-white`}
            >
              Go to Home <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className={`${FONT} h-[54px] w-full cursor-pointer rounded-xl border border-[#cbd5e1] bg-white text-[16px] font-semibold text-[#0f172a]`}
            >
              Back to Welcome
            </button>
          </div>
        </main>
      </div>
    </MobileFrame>
  );
}
