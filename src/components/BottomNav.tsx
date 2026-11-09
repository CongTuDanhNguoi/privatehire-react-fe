// Thanh điều hướng dưới (Home / Activity / Alerts / Profile)
// Kiểu dáng lấy từ BottomNavigation (Figma node 6:1029) của màn Home.
import { useNavigate } from "react-router-dom";
import Icon, { type IconName } from "./Icon";

type Tab = "home" | "activity" | "alerts" | "profile";

const TABS: { id: Tab; label: string; icon: IconName; to?: string }[] = [
  { id: "home", label: "Home", icon: "house", to: "/home" },
  { id: "activity", label: "Activity", icon: "clipboard" },
  { id: "alerts", label: "Alerts", icon: "bell" },
  { id: "profile", label: "Profile", icon: "user", to: "/profile" },
];

export default function BottomNav({ active }: { active: Tab }) {
  const navigate = useNavigate();
  return (
    <nav className="absolute right-0 bottom-0 left-0 z-10 border-t border-[rgba(226,232,240,0.9)] bg-[rgba(255,255,255,0.95)] px-6 pt-[11px] pb-[10px] backdrop-blur-[12px]">
      <ul className="flex items-center justify-between">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id}>
              <button
                type="button"
                data-testid={`tab-${tab.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => tab.to && navigate(tab.to)}
                className={`flex w-14 cursor-pointer flex-col items-center font-['Liberation_Sans',Arial,sans-serif] text-[10px] leading-[15px] tracking-[-0.25px] ${
                  isActive ? "font-bold text-[#2563eb]" : "text-[#94a3b8]"
                } ${tab.to ? "" : "cursor-default"}`}
              >
                <span className="pb-1">
                  <Icon name={tab.icon} size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
