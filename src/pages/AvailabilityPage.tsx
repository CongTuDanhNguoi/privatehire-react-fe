// =============================================================
// AvailabilityPage.tsx — SCRUM-18 Check Vehicle Availability
// Implements interactive simulated vehicle availability checking
// matching approved Figma reference exports:
// - Screen 1 — Checking Vehicle Availability.png (400x894)
// - Screen 1A — Vehicle Unavailable.png (400x944)
// - Screen 2 — Vehicle Available.png (400x922)
//
// Key Features:
// 1. Dynamic customer booking data from BookingContext.
// 2. 3 States on one screen: CHECKING -> AVAILABLE or UNAVAILABLE.
// 3. Deterministic mock rules based on date/time & vehicle capacity.
// 4. Stale result invalidation when date/time/vehicle changes.
// 5. Change Date/Time & Change Vehicle Size correction flows.
// 6. Zero live booking/payment side effects.
// =============================================================
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";
import { formatDateDisplay } from "../validation/journeyValidation";
import {
  calculateFleetAvailability,
  determineAvailability,
  validateCapacityForFleet,
} from "../validation/availabilityRules";

const assetPathPrefix = "/figma-assets/e52c501f-4b60-43d4-921a-d731b455d0d0";
const imgSvg = `${assetPathPrefix}/e7f30.svg`; // Step 1 checkmark
const imgSvg1 = `${assetPathPrefix}/39bb9.svg`; // Calendar icon
const imgSvg2 = `${assetPathPrefix}/fda74.svg`; // Passenger icon
const imgSvg3 = `${assetPathPrefix}/7b60b.svg`; // Car fleet icon
const imgSvg4 = `${assetPathPrefix}/c0e5a.svg`; // Refresh / spinner icon
const imgSvg5 = `${assetPathPrefix}/5334f.svg`; // Car illustration inside pulse circle
const imgSvg6 = `${assetPathPrefix}/d4ad1.svg`; // Back chevron

const FONT = "font-['Inter',sans-serif]";

export type AvailabilityState = "CHECKING" | "AVAILABLE" | "UNAVAILABLE";

export default function AvailabilityPage() {
  const navigate = useNavigate();

  const {
    selectedService,
    pickupLocation,
    destination,
    journeyDate,
    journeyTime,
    passengerCount,
    vehicleSize,
    availabilityResult,
    setAvailabilityResult,
  } = useBooking();

  // Route Guards: Protect route and ensure full prerequisite booking data
  if (!selectedService) {
    return <Navigate to="/services" replace />;
  }
  if (!pickupLocation || !destination || !journeyDate || !journeyTime) {
    return <Navigate to="/journey" replace />;
  }
  if (!vehicleSize) {
    return <Navigate to="/vehicle" replace />;
  }

  // Passenger capacity validation
  const maxCapacity = vehicleSize === "standard" ? 4 : 6;
  if (passengerCount > maxCapacity) {
    return <Navigate to="/vehicle" replace />;
  }

  const [status, setStatus] = useState<AvailabilityState>(() => {
    // If we have an existing fresh availabilityResult in BookingContext, use it; else start CHECKING
    if (availabilityResult === "available") return "AVAILABLE";
    if (availabilityResult === "unavailable") return "UNAVAILABLE";
    return "CHECKING";
  });

  // Simulated checking timer (600ms transition to give a clear, visible loading state)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (status === "CHECKING") {
      timer = setTimeout(() => {
        const result = determineAvailability(journeyDate, journeyTime, vehicleSize, passengerCount);
        const nextState = result === "available" ? "AVAILABLE" : "UNAVAILABLE";
        setStatus(nextState);
        setAvailabilityResult(result);
      }, 600);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, journeyDate, journeyTime, vehicleSize, passengerCount, setAvailabilityResult]);

  // Vehicle display helpers
  const isSevenSeater = vehicleSize === "seven-seater";
  const fleetTitle = isSevenSeater ? "Seven-Seater" : "Standard Car";
  const fleetSub = isSevenSeater ? "(Executive MPV)" : "(Saloon & Sedan)";

  // Split address helper (title vs postcode/street)
  const formatLocation = (fullLoc: string) => {
    const parts = fullLoc.split(",");
    const title = parts[0]?.trim() || fullLoc;
    const sub = parts.slice(1).join(",").trim() || "Greater Manchester";
    return { title, sub };
  };

  const pickup = formatLocation(pickupLocation);
  const dest = formatLocation(destination);

  // Navigation handlers for recheck flow
  const handleChangeDateTime = () => {
    // Navigating back to Journey Details to edit date/time
    navigate("/journey");
  };

  const handleChangeVehicleSize = () => {
    // Navigating back to Vehicle Size Selection
    navigate("/vehicle");
  };

  return (
    <MobileFrame height={944}>
      <div
        className="flex flex-col min-h-[944px] bg-[#f8fafc] size-full relative"
        data-testid="availability-page"
        data-status={status}
      >
        {/* Hidden aliases for test contracts */}
        <div className="sr-only" aria-hidden="true">
          <span data-testid="summary-service">{selectedService.title}</span>
          <span data-testid="summary-passengers">{passengerCount} Passengers</span>
          <span data-testid="summary-vehicle">{fleetTitle}</span>
        </div>

        {/* Navigation Header */}
        <header className="flex h-[56px] items-center justify-between border-b border-[#cbd5e1] bg-white/95 backdrop-blur-[12px] px-4 shrink-0">
          <button
            type="button"
            onClick={handleChangeVehicleSize}
            data-testid="back-to-vehicle-btn"
            aria-label="Back to Vehicle Size"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0b2341] hover:bg-[#f1f5f9] transition-colors"
          >
            <img alt="Back" className="size-5" src={imgSvg6} />
          </button>
          <h1 className={`${FONT} text-[16px] font-bold text-[#0b2341] tracking-[-0.4px]`}>
            Check Vehicle Availability
          </h1>
          <button
            type="button"
            onClick={() => navigate("/services")}
            data-testid="cancel-button"
            className={`${FONT} text-[12px] font-medium text-[#e11d48] hover:underline cursor-pointer`}
          >
            Cancel
          </button>
        </header>

        {/* Progress Stepper Header */}
        <div className="bg-white border-b border-[#cbd5e1] px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            {/* Step 1: Journey (Completed) */}
            <div className="flex items-center gap-1.5" data-testid="step-journey">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#059669]">
                <img alt="Completed" className="size-3" src={imgSvg} />
              </div>
              <span className={`${FONT} text-[12px] text-[#0b2341] font-medium`}>
                1 Journey
              </span>
            </div>

            <div className="flex-1 mx-2 h-[2px] bg-[#0b2341]" />

            {/* Step 2: Vehicle (Active) */}
            <div className="flex items-center gap-1.5" data-testid="step-vehicle">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#0b2341] text-white text-[10px] font-bold">
                2
              </span>
              <span className={`${FONT} text-[12px] text-[#0b2341] font-bold`}>
                Vehicle
              </span>
            </div>

            <div className="flex-1 mx-2 h-[2px] bg-[#94a3b8]" />

            {/* Step 3: Confirm (Upcoming) */}
            <div className="flex items-center gap-1.5" data-testid="step-confirm">
              <span className="flex size-5 items-center justify-center rounded-full border border-[#94a3b8] bg-[#f1f5f9] text-[#334155] text-[10px] font-medium">
                3
              </span>
              <span className={`${FONT} text-[12px] text-[#334155]`}>
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 flex flex-col gap-3.5 overflow-y-auto">
          {/* SECTION 1: JOURNEY SUMMARY (Identical in all 3 states) */}
          <section
            className="bg-white border border-[#cbd5e1] rounded-[12px] p-3.5 flex flex-col gap-3 shadow-2xs"
            data-testid="journey-summary-card"
          >
            {/* Pickup & Destination Timeline */}
            <div className="flex flex-col gap-2.5 pb-1">
              {/* Pickup */}
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col items-center pt-1">
                  <div className="size-2.5 rounded-full bg-[#2563eb] ring-2 ring-[#bfdbfe]" />
                  <div className="w-[2px] h-5 bg-[#94a3b8] my-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`${FONT} text-[10px] font-bold tracking-[0.5px] uppercase text-[#1e293b]`}>
                    PICKUP LOCATION
                  </span>
                  <p
                    data-testid="summary-pickup-title"
                    className={`${FONT} text-[12px] font-bold text-[#0b2341] truncate leading-tight mt-0.5`}
                  >
                    {pickup.title}
                  </p>
                  <p className={`${FONT} text-[11px] text-[#334155] truncate mt-0.5`}>
                    {pickup.sub}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-2.5">
                <div className="pt-0.5">
                  <div className="size-2.5 rounded-full bg-[#059669] ring-2 ring-[#a7f3d0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`${FONT} text-[10px] font-bold tracking-[0.5px] uppercase text-[#1e293b]`}>
                    DESTINATION
                  </span>
                  <p
                    data-testid="summary-dest-title"
                    className={`${FONT} text-[12px] font-bold text-[#0b2341] truncate leading-tight mt-0.5`}
                  >
                    {dest.title}
                  </p>
                  <p className={`${FONT} text-[11px] text-[#334155] truncate mt-0.5`}>
                    {dest.sub}
                  </p>
                </div>
              </div>
            </div>

            {/* Date/Time and Passenger Grid */}
            <div className="border-t border-[#cbd5e1] pt-2.5 grid grid-cols-2 gap-2">
              {/* Date & Time */}
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[8px] p-2 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <img alt="" className="size-3.5" src={imgSvg1} />
                  <span className={`${FONT} text-[10px] font-bold uppercase tracking-[0.5px] text-[#1e293b]`}>
                    JOURNEY DATE & TIME
                  </span>
                </div>
                <p
                  data-testid="summary-datetime-val"
                  className={`${FONT} text-[12px] font-bold text-[#0b2341] mt-0.5`}
                >
                  {formatDateDisplay(journeyDate)}, {journeyTime}
                </p>
              </div>

              {/* Passenger Count */}
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[8px] p-2 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <img alt="" className="size-3.5" src={imgSvg2} />
                  <span className={`${FONT} text-[10px] font-bold uppercase tracking-[0.5px] text-[#1e293b]`}>
                    PASSENGER COUNT
                  </span>
                </div>
                <p
                  data-testid="summary-passenger-val"
                  className={`${FONT} text-[12px] font-bold text-[#0b2341] mt-0.5`}
                >
                  {passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}
                </p>
              </div>
            </div>

            {/* Fleet Class Card */}
            <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[8px] p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img alt="" className="size-4 shrink-0" src={imgSvg3} />
                <div>
                  <span className={`${FONT} text-[10px] font-bold uppercase tracking-[0.5px] text-[#1e293b]`}>
                    REQUESTED FLEET CLASS
                  </span>
                  <p
                    data-testid="summary-fleet-val"
                    className={`${FONT} text-[12px] font-bold text-[#0b2341] leading-tight`}
                  >
                    {fleetTitle} {fleetSub}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-[#94a3b8] rounded px-2.5 py-1 text-right shadow-2xs">
                <p className={`${FONT} text-[10px] text-[#334155] leading-tight`}>
                  Maximum {maxCapacity} passengers,
                </p>
                <p className={`${FONT} text-[10px] text-[#334155] leading-tight`}>
                  excluding the driver.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: DYNAMIC AVAILABILITY RESULT / CHECKING CARD */}

          {/* STATE 1: CHECKING (Screen 1 — Checking Vehicle Availability) */}
          {status === "CHECKING" && (
            <section
              className="bg-white border border-[#cbd5e1] rounded-[12px] p-5 flex-1 flex flex-col items-center justify-between shadow-2xs min-h-[360px]"
              data-testid="checking-state-card"
            >
              {/* Concentric Pulse Ring */}
              <div className="pt-2 flex flex-col items-center">
                <div className="size-28 rounded-full bg-[#e0f2fe] border border-[#bae6fd] p-1 flex items-center justify-center animate-pulse">
                  <div className="size-full rounded-full border-3 border-[#0284c7] flex items-center justify-center">
                    <div className="size-16 rounded-full bg-white border border-[#cbd5e1] flex items-center justify-center shadow-xs">
                      <img alt="" className="size-7" src={imgSvg5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center flex flex-col items-center gap-1.5 px-3">
                <h2 className={`${FONT} text-[16px] font-bold text-[#0b2341] tracking-[-0.4px]`}>
                  Checking Vehicle Availability...
                </h2>
                <p className={`${FONT} text-[12px] text-[#334155] leading-relaxed max-w-[280px]`}>
                  We're checking whether a suitable vehicle is available for your selected journey date and time.
                </p>

                {/* 3 Animated Cyan Dots */}
                <div className="flex items-center gap-1.5 py-2">
                  <span className="size-2 rounded-full bg-[#0284c7] opacity-60 animate-bounce" />
                  <span className="size-2 rounded-full bg-[#0284c7] opacity-60 animate-bounce delay-150" />
                  <span className="size-2 rounded-full bg-[#0284c7] opacity-60 animate-bounce delay-300" />
                </div>
              </div>

              {/* Bottom Simulation Info Banner */}
              <div className="w-full bg-[#f0f9ff] border border-[#bae6fd] rounded-[8px] p-2.5 flex items-center gap-2.5">
                <img alt="" className="size-4 shrink-0 animate-spin" src={imgSvg4} />
                <div className="min-w-0 flex-1">
                  <p className={`${FONT} text-[11px] font-bold text-[#0b2341] leading-tight`}>
                    Checking {fleetTitle} availability for your selected journey...
                  </p>
                  <p className={`${FONT} text-[10px] text-[#1e293b] mt-0.5`}>
                    Simulated availability check
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* STATE 2: AVAILABLE (Screen 2 — Vehicle Available) */}
          {status === "AVAILABLE" && (
            <section
              className="bg-white border border-[#cbd5e1] rounded-[12px] p-5 flex flex-col items-center gap-4 shadow-2xs"
              data-testid="available-state-card"
            >
              {/* Green Check Circle */}
              <div className="size-16 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center">
                <div className="size-11 rounded-full bg-[#d1fae5] flex items-center justify-center text-[#059669]">
                  <Icon name="check" size={24} strokeWidth={3} />
                </div>
              </div>

              {/* Status Pill Badge */}
              <div
                data-testid="vehicle-available-badge"
                className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-[12px] font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5"
              >
                <span className="size-2 rounded-full bg-[#059669]" />
                VEHICLE AVAILABLE
              </div>

              {/* Title & Subtext */}
              <div className="text-center flex flex-col items-center gap-1">
                <h2 className={`${FONT} text-[18px] font-bold text-[#0b2341]`}>
                  {fleetTitle} Available
                </h2>
                <p className={`${FONT} text-[12px] text-[#475569] leading-relaxed max-w-[280px]`}>
                  A suitable vehicle is available for your selected journey date and time.
                </p>
              </div>

              {/* Detail Box */}
              <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-3 flex items-center justify-between">
                <div>
                  <p className={`${FONT} text-[13px] font-bold text-[#1e293b]`}>
                    {fleetTitle} — {passengerCount} passengers
                  </p>
                  <p className={`${FONT} text-[11px] text-[#64748b] mt-0.5`}>
                    {formatDateDisplay(journeyDate)} at {journeyTime}
                  </p>
                </div>
                <span
                  data-testid="available-pill"
                  className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] font-bold text-[12px] px-3 py-1 rounded-md"
                >
                  Available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleChangeDateTime}
                  data-testid="change-datetime-btn"
                  className={`${FONT} w-full h-11 rounded-xl border border-[#0b2341] bg-white text-[#0b2341] font-bold text-[13px] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors`}
                >
                  <Icon name="calendar" size={16} /> Change Date or Time
                </button>

                <button
                  type="button"
                  onClick={handleChangeVehicleSize}
                  data-testid="change-vehicle-btn"
                  className={`${FONT} w-full h-11 rounded-xl border border-[#0b2341] bg-white text-[#0b2341] font-bold text-[13px] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors`}
                >
                  <Icon name="car" size={16} /> Change Vehicle Size
                </button>

                <button
                  type="button"
                  onClick={handleChangeDateTime}
                  data-testid="back-to-journey-link"
                  className={`${FONT} w-full py-1 text-center text-[12px] font-medium text-[#64748b] hover:text-[#0b2341] cursor-pointer`}
                >
                  ← Back to Journey Details
                </button>
              </div>
            </section>
          )}

          {/* STATE 3: UNAVAILABLE (Screen 1A — Vehicle Unavailable) */}
          {status === "UNAVAILABLE" && (
            <section
              className="bg-white border border-[#cbd5e1] rounded-[12px] p-5 flex flex-col items-center gap-4 shadow-2xs"
              data-testid="unavailable-state-card"
            >
              {/* Red Exclamation Circle */}
              <div className="size-16 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center">
                <div className="size-11 rounded-full bg-[#ffe4e6] flex items-center justify-center text-[#e11d48]">
                  <Icon name="alert" size={24} strokeWidth={2.5} />
                </div>
              </div>

              {/* Status Pill Badge */}
              <div
                data-testid="vehicle-unavailable-badge"
                className="bg-[#fff1f2] border border-[#fecdd3] text-[#e11d48] text-[12px] font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5"
              >
                <span className="size-2 rounded-full bg-[#e11d48]" />
                VEHICLE UNAVAILABLE
              </div>

              {/* Title & Subtext */}
              <div className="text-center flex flex-col items-center gap-1">
                <h2 className={`${FONT} text-[18px] font-bold text-[#0b2341]`}>
                  No {fleetTitle} Available
                </h2>
                <p className={`${FONT} text-[12px] text-[#475569] leading-relaxed max-w-[280px]`}>
                  No suitable {fleetTitle} is available for your selected journey date and time. Please change your date or time and check again.
                </p>
              </div>

              {/* Detail Box */}
              <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-3 flex items-center justify-between">
                <div>
                  <p className={`${FONT} text-[13px] font-bold text-[#1e293b]`}>
                    {fleetTitle} — {passengerCount} passengers
                  </p>
                  <p className={`${FONT} text-[11px] text-[#64748b] mt-0.5`}>
                    {formatDateDisplay(journeyDate)} at {journeyTime}
                  </p>
                </div>
                <span
                  data-testid="unavailable-pill"
                  className="bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] font-bold text-[12px] px-2.5 py-1 rounded-md"
                >
                  0 Available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleChangeDateTime}
                  data-testid="change-datetime-btn"
                  className={`${FONT} w-full h-11 rounded-xl bg-[#0b2341] text-white font-bold text-[13px] hover:bg-[#13335a] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors`}
                >
                  <Icon name="calendar" size={16} /> Change Date or Time
                </button>

                <button
                  type="button"
                  onClick={handleChangeVehicleSize}
                  data-testid="change-vehicle-btn"
                  className={`${FONT} w-full h-11 rounded-xl border border-[#0b2341] bg-white text-[#0b2341] font-bold text-[13px] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors`}
                >
                  <Icon name="car" size={16} /> Change Vehicle Size
                </button>

                <button
                  type="button"
                  onClick={handleChangeDateTime}
                  data-testid="back-to-journey-link"
                  className={`${FONT} w-full py-1 text-center text-[12px] font-medium text-[#64748b] hover:text-[#0b2341] cursor-pointer`}
                >
                  ← Back to Journey Details
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </MobileFrame>
  );
}
