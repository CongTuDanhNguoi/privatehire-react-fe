// =============================================================
// ServiceSelectionPage — "2.1 SERVICE SELECTION"
// - 6 dịch vụ, mỗi lần chỉ chọn 1 (bấm thẻ khác = đổi lựa chọn)
// - Continue bị tắt khi chưa chọn, bật khi đã chọn
// - Continue -> Journey Details; quay lại từ "Change" thì giữ lựa chọn cũ
// =============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";
import { SERVICES, type ServiceId } from "../data/services";

const FONT = "font-['Inter',sans-serif]";

export default function ServiceSelectionPage() {
  const navigate = useNavigate();
  const { selectedService, selectService } = useBooking();
  const [pending, setPending] = useState<ServiceId | null>(selectedService?.id ?? null);

  function onContinue() {
    if (!pending) return;
    selectService(pending);
    navigate("/journey");
  }

  return (
    <MobileFrame>
      <div className="relative flex min-h-[844px] flex-col bg-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        {/* Thanh điều hướng (cùng kiểu "Screen Navigation" của Journey Details) */}
        <header className="flex items-center justify-between border-b border-[#f1f5f9] bg-white px-5 pt-[10px] pb-[9px]">
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Back to Home"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0b2341] hover:bg-[#f1f5f9]"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <p className={`${FONT} text-[16px] font-bold tracking-[-0.4px] text-[#0b2341]`}>Book a Ride</p>
          <span className="size-9" />
        </header>

        <main className="flex-1 px-5 pt-5 pb-28">
          <h1 className={`${FONT} text-[22px] leading-7 font-bold tracking-[-0.4px] text-[#0f172a]`}>Choose your travel mode</h1>
          <p className={`${FONT} pt-2 text-[14px] leading-[22px] text-[#64748b]`}>
            Select a tailored transport tier for your schedule and route preferences.
          </p>

          <div role="radiogroup" aria-label="Travel mode" className="grid grid-cols-2 gap-3 pt-5">
            {SERVICES.map((service) => {
              const selected = pending === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-testid={`service-${service.id}`}
                  onClick={() => setPending(service.id)}
                  className={`relative flex min-h-[152px] cursor-pointer flex-col items-start rounded-[14px] p-[14px] text-left transition-colors ${
                    selected
                      ? "border-2 border-[#0b2341] bg-[#eff6ff] p-[13px]"
                      : "border border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <span
                    className={`flex size-10 items-center justify-center rounded-[10px] ${
                      selected ? "bg-[#0b2341] text-white" : "bg-[#eff6ff] text-[#0b2341]"
                    }`}
                  >
                    <Icon name={service.icon} size={20} strokeWidth={1.8} />
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute top-[14px] right-[14px] flex size-5 items-center justify-center rounded-full ${
                      selected ? "bg-[#0b2341] text-white" : "border-2 border-[#cbd5e1] bg-white"
                    }`}
                  >
                    {selected && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  <span className={`${FONT} pt-6 text-[14px] leading-5 font-bold text-[#0f172a]`}>{service.title}</span>
                  <span className={`${FONT} pt-1 text-[11px] leading-4 text-[#64748b]`}>{service.description}</span>
                </button>
              );
            })}
          </div>
        </main>

        {/* Nút Continue: tắt khi chưa chọn, bật khi đã chọn */}
        <div className="absolute right-0 bottom-0 left-0 bg-white px-5 pt-3 pb-6">
          <button
            type="button"
            data-testid="continue"
            disabled={!pending}
            onClick={onContinue}
            className={`${FONT} flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-colors ${
              pending ? "cursor-pointer bg-[#0b2341] text-white" : "cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]"
            }`}
          >
            Continue <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
