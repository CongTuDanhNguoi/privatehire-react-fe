// =============================================================
// ProfilePage — "3. Profile" (dựng theo ảnh thiết kế)
// Tên / email lấy từ phiên đăng nhập. Log Out -> về màn Login.
// =============================================================
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Icon, { type IconName } from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";
import { getCurrentUser, logout } from "../services/auth";

const FONT = "font-['Inter',sans-serif]";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

interface MenuItem {
  title: string;
  subtitle: string;
  icon: IconName;
  iconClass: string;
  danger?: boolean;
  onClick?: () => void;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearBooking } = useBooking();
  const user = getCurrentUser();
  if (!user) return null; // RequireAuth đã chặn trước

  const items: MenuItem[] = [
    { title: "Personal Information", subtitle: "Registered personal details & contact info", icon: "user", iconClass: "bg-[#eff6ff] text-[#2563eb]" },
    { title: "Saved Addresses", subtitle: "Saved pickup and destination addresses", icon: "mapPin", iconClass: "bg-[#eef2ff] text-[#4f46e5]" },
    { title: "Payment Details", subtitle: "Saved payment methods", icon: "creditCard", iconClass: "bg-[#f0f9ff] text-[#0284c7]" },
    {
      title: "Log Out",
      subtitle: "Sign out of your account",
      icon: "logOut",
      iconClass: "bg-[#fff1f2] text-[#e11d48]",
      danger: true,
      onClick: () => {
        logout();
        clearBooking();
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <MobileFrame>
      <div className="relative min-h-[844px] bg-[#f8fafc] pb-24 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <main className="px-4 pt-5">
          <h1 className={`${FONT} px-1 text-[20px] leading-7 font-bold tracking-[-0.4px] text-[#0b2341]`}>My Profile</h1>
          <p className={`${FONT} px-1 text-[13px] leading-5 text-[#64748b]`}>Manage personal mobility preferences</p>

          <section className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0px_1px_3px_0px_rgba(15,23,42,0.06)]">
            <div className={`${FONT} flex size-14 shrink-0 items-center justify-center rounded-full bg-[#0b2341] text-[17px] font-bold tracking-[1px] text-white`}>
              {initials(user.fullName)}
            </div>
            <div className="min-w-0">
              <p data-testid="profile-name" className={`${FONT} truncate text-[17px] leading-6 font-semibold text-[#0f172a]`}>{user.fullName}</p>
              <p data-testid="profile-email" className={`${FONT} truncate text-[13px] leading-5 text-[#64748b]`}>{user.email}</p>
            </div>
          </section>

          <ul className="mt-5 rounded-2xl bg-white px-4 shadow-[0px_1px_3px_0px_rgba(15,23,42,0.06)]">
            {items.map((item, i) => (
              <li key={item.title} className={i > 0 ? "border-t border-[#f1f5f9]" : ""}>
                <button
                  type="button"
                  onClick={item.onClick}
                  data-testid={item.danger ? "logout" : undefined}
                  className={`flex w-full items-center gap-4 py-[14px] text-left ${item.onClick ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}>
                    <Icon name={item.icon} size={20} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`${FONT} block text-[15px] leading-5 font-semibold ${item.danger ? "text-[#e11d48]" : "text-[#0f172a]"}`}>
                      {item.title}
                    </span>
                    <span className={`${FONT} block pt-0.5 text-[12px] leading-4 text-[#64748b]`}>{item.subtitle}</span>
                  </span>
                  <span className="text-[#cbd5e1]">
                    <Icon name="chevronRight" size={18} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
        <BottomNav active="profile" />
      </div>
    </MobileFrame>
  );
}
