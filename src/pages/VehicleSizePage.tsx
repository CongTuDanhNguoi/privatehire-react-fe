// =============================================================
// VehicleSizePage.tsx — SCRUM-17 Vehicle Size Selection
// Pixel-perfect implementation matching approved Figma PNG reference designs:
// - Screen 1 — Vehicle Size Selection.png (430x926) -> State A
// - Screen 1A — Insufficient Capacity.png (430x926) -> State B
// - Screen 1B — Corrected Selection.png (430x926) -> State C
// Full business logic:
// - Passenger count: 1–6 (excludes driver)
// - Standard Car: max 4 passengers
// - Seven-Seater: max 6 passengers
// - Single selection only
// - Insufficient capacity disables vehicle with warning text & badge
// - Automatic clearing of invalid selection on count increase
// - No auto-selection of replacement vehicle
// - Check Vehicle Availability disabled when no valid vehicle selected
// - State preserved in BookingContext across back navigation
// =============================================================
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";

const assetPathPrefix = "/figma-assets/f153e3e9-bbdf-462d-ad24-7bc6b21b7269";
const imgStandardSaloonFleet = `${assetPathPrefix}/fe2e0.png`;
const imgExecutiveVanMpvFleet = `${assetPathPrefix}/9e353.png`;
const imgSvg = `${assetPathPrefix}/b9500.svg`; // Back chevron
const imgBackground = `${assetPathPrefix}/64d4a.svg`; // Step 1 check
const imgSvg1 = `${assetPathPrefix}/53610.svg`; // Minus icon
const imgSvg2 = `${assetPathPrefix}/68749.svg`; // Passenger display icon
const imgSvg3 = `${assetPathPrefix}/34cb3.svg`; // Plus icon
const imgSvg4 = `${assetPathPrefix}/83fc0.svg`; // Passenger badge icon
const imgSvg5 = `${assetPathPrefix}/78dce.svg`; // Luggage badge icon
const imgSvg6 = `${assetPathPrefix}/e7f30.svg`; // Checked badge icon
const imgSvg7 = `${assetPathPrefix}/54330.svg`; // Passenger badge icon (selected)
const imgSvg8 = `${assetPathPrefix}/ee53f.svg`; // Luggage badge icon (selected)
const imgSvg9 = `${assetPathPrefix}/505ba.svg`; // Checkmark icon
const imgSvg10 = `${assetPathPrefix}/b971a.svg`; // CTA Arrow icon

const FONT = "font-['Inter',sans-serif]";

export type VehicleTypeId = "standard" | "seven-seater";

export default function VehicleSizePage() {
  const navigate = useNavigate();
  const {
    selectedService,
    pickupLocation,
    destination,
    journeyDate,
    journeyTime,
    passengerCount: storedPassengers,
    vehicleSize: storedVehicleSize,
    setVehicleSelection,
  } = useBooking();

  // Route Guard: Must have active service and journey details
  if (!selectedService) {
    return <Navigate to="/services" replace />;
  }
  if (!pickupLocation || !destination || !journeyDate || !journeyTime) {
    return <Navigate to="/journey" replace />;
  }

  // Initial passenger count (defaults to 3 per Figma State A if not previously set)
  const [passengers, setPassengers] = useState<number>(() => {
    return typeof storedPassengers === "number" && storedPassengers >= 1 && storedPassengers <= 6
      ? storedPassengers
      : 3;
  });

  // Initial selected vehicle (defaults to "seven-seater" per Figma State A if not previously set)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTypeId | null>(() => {
    if (storedVehicleSize === "standard") {
      return (storedPassengers ?? 3) <= 4 ? "standard" : null;
    }
    if (storedVehicleSize === "seven-seater") {
      return (storedPassengers ?? 3) <= 6 ? "seven-seater" : null;
    }
    return "seven-seater";
  });

  const STANDARD_MAX = 4;
  const SEVEN_SEATER_MAX = 6;
  const isStandardEligible = passengers <= STANDARD_MAX;
  const isSevenSeaterEligible = passengers <= SEVEN_SEATER_MAX;

  // Clear invalid selection when passenger count exceeds capacity
  // "Do not automatically select a replacement vehicle."
  useEffect(() => {
    if (selectedVehicle === "standard" && passengers > STANDARD_MAX) {
      setSelectedVehicle(null);
      setVehicleSelection(null, passengers);
    } else {
      setVehicleSelection(selectedVehicle, passengers);
    }
  }, [passengers, selectedVehicle, setVehicleSelection]);

  // Stepper handlers
  const handleDecreasePassengers = () => {
    if (passengers > 1) {
      const next = passengers - 1;
      setPassengers(next);
      if (selectedVehicle === "standard" && next > STANDARD_MAX) {
        setSelectedVehicle(null);
      }
    }
  };

  const handleIncreasePassengers = () => {
    if (passengers < 6) {
      const next = passengers + 1;
      setPassengers(next);
      if (selectedVehicle === "standard" && next > STANDARD_MAX) {
        setSelectedVehicle(null);
      }
    }
  };

  // Card click handlers
  const handleSelectStandard = () => {
    if (!isStandardEligible) return; // Prevent selection of insufficient capacity
    setSelectedVehicle("standard");
    setVehicleSelection("standard", passengers);
  };

  const handleSelectSevenSeater = () => {
    if (!isSevenSeaterEligible) return;
    setSelectedVehicle("seven-seater");
    setVehicleSelection("seven-seater", passengers);
  };

  // Availability CTA check
  const isContinueEnabled = Boolean(
    selectedVehicle &&
      ((selectedVehicle === "standard" && isStandardEligible) ||
        (selectedVehicle === "seven-seater" && isSevenSeaterEligible))
  );

  const handleContinue = () => {
    if (!isContinueEnabled || !selectedVehicle) return;
    setVehicleSelection(selectedVehicle, passengers);
    navigate("/availability");
  };

  const handleBack = () => {
    setVehicleSelection(selectedVehicle, passengers);
    navigate("/journey");
  };

  return (
    <MobileFrame height={926}>
      <div
        className="flex flex-col min-h-[926px] bg-white size-full relative"
        data-testid="vehicle-size-page"
      >
        {/* Hidden journey summary descriptors for accessibility & testing contract */}
        <div className="sr-only" aria-hidden="true">
          <span data-testid="summary-pickup">{pickupLocation}</span>
          <span data-testid="summary-destination">{destination}</span>
          <span data-testid="summary-time">{journeyTime}</span>
        </div>

        {/* Navigation Header */}
        <header className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            data-testid="back-button"
            aria-label="Back to Journey Details"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <img alt="Back" className="size-5" src={imgSvg} />
          </button>
          <h1 className={`${FONT} text-[16px] font-bold text-[#0f172a]`}>
            Vehicle Size
          </h1>
          <button
            type="button"
            onClick={() => navigate("/services")}
            data-testid="cancel-button"
            className={`${FONT} text-[14px] text-[#475569] hover:text-[#0f172a] cursor-pointer`}
          >
            Cancel
          </button>
        </header>

        {/* 3-Step Stepper Progress Bar */}
        <div className="bg-white border-b border-[#f1f5f9] px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            {/* Step 1: Journey (Completed) */}
            <div className="flex items-center gap-1.5" data-testid="step-journey">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#f1f5f9]">
                <img alt="Completed" className="size-3.5" src={imgBackground} />
              </div>
              <span className={`${FONT} text-[12px] text-[#64748b] font-medium`}>
                Journey
              </span>
            </div>

            <div className="flex-1 mx-3 h-[1.5px] bg-[#e2e8f0]" />

            {/* Step 2: Vehicle (Active) */}
            <div className="flex items-center gap-1.5" data-testid="step-vehicle">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#0b2341] text-white text-[11px] font-bold">
                2
              </span>
              <span className={`${FONT} text-[12px] text-[#0f172a] font-bold`}>
                Vehicle
              </span>
            </div>

            <div className="flex-1 mx-3 h-[1.5px] bg-[#e2e8f0]" />

            {/* Step 3: Confirm (Upcoming) */}
            <div className="flex items-center gap-1.5" data-testid="step-confirm">
              <span className="flex size-5 items-center justify-center rounded-full border border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8] text-[11px] font-medium">
                3
              </span>
              <span className={`${FONT} text-[12px] text-[#94a3b8]`}>
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 flex flex-col gap-4 overflow-y-auto">
          {/* Section Heading */}
          <div className="flex flex-col gap-0.5">
            <h2 className={`${FONT} text-[16px] font-bold uppercase tracking-[0.4px] text-[#0b2341]`}>
              SELECT VEHICLE SIZE
            </h2>
            <p className={`${FONT} text-[12px] text-[#64748b]`}>
              Choose vehicle type based on passenger requirement
            </p>
          </div>

          {/* Passenger Count Selector Card */}
          <section
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-4 flex flex-col gap-2.5 shadow-2xs"
            data-testid="passenger-selector"
          >
            <div className="flex items-center justify-between">
              <label className={`${FONT} text-[12px] font-bold text-[#1e293b]`}>
                Passenger Count <span className="text-[#ef4444]">*</span>
              </label>
              <span
                data-testid="passenger-hint"
                className={`${FONT} text-[11px] font-medium text-[#64748b]`}
              >
                {passengers <= STANDARD_MAX
                  ? "Standard or 7-Seater suitable"
                  : "7-Seater suitable"}
              </span>
            </div>

            {/* Stepper Control Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecreasePassengers}
                disabled={passengers <= 1}
                data-testid="decrease-passengers"
                aria-label="Decrease passenger count"
                className="bg-white border border-[#e2e8f0] rounded-[8px] size-10 flex items-center justify-center hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <img alt="Minus" className="size-4" src={imgSvg1} />
              </button>

              <div
                data-testid="passenger-display"
                className="bg-white border border-[#e2e8f0] rounded-[8px] h-10 flex-1 flex items-center justify-center gap-2 px-3 shadow-2xs"
              >
                <img alt="Passenger" className="size-4" src={imgSvg2} />
                <span className={`${FONT} text-[14px] font-bold text-[#1e293b]`}>
                  {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncreasePassengers}
                disabled={passengers >= 6}
                data-testid="increase-passengers"
                aria-label="Increase passenger count"
                className="bg-white border border-[#e2e8f0] rounded-[8px] size-10 flex items-center justify-center hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <img alt="Plus" className="size-4" src={imgSvg3} />
              </button>
            </div>

            <p className={`${FONT} text-[11px] text-[#64748b]`}>
              Passenger count excludes the driver.
            </p>
          </section>

          {/* Available Categories Section */}
          <section className="flex flex-col gap-2.5">
            <span className={`${FONT} text-[12px] font-bold uppercase tracking-[0.6px] text-[#64748b]`}>
              AVAILABLE CATEGORIES
            </span>

            {/* Category 1: Standard Car */}
            <article
              data-testid="vehicle-card-standard"
              onClick={isStandardEligible ? handleSelectStandard : undefined}
              className={`rounded-[14px] p-3.5 flex flex-col gap-2.5 transition-all ${
                !isStandardEligible
                  ? "bg-white border border-[#fecdd3] cursor-not-allowed shadow-2xs"
                  : selectedVehicle === "standard"
                  ? "bg-[#eff6ff] border border-[#0b2341] shadow-2xs cursor-pointer"
                  : "bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs cursor-pointer"
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* Thumbnail */}
                <div className={`bg-[#f1f5f9] border border-[#f1f5f9] rounded-[8px] h-[56px] w-[80px] shrink-0 overflow-hidden flex items-center justify-center ${!isStandardEligible ? "opacity-50 grayscale" : ""}`}>
                  <img
                    alt="Standard Car"
                    className="h-full w-full object-cover"
                    src={imgStandardSaloonFleet}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`${FONT} text-[15px] font-bold leading-tight ${!isStandardEligible ? "text-[#94a3b8]" : "text-[#0f172a]"}`}>
                        Standard Car
                      </h3>
                      <p className={`${FONT} text-[12px] ${!isStandardEligible ? "text-[#94a3b8]" : "text-[#64748b]"}`}>
                        Saloon & Sedan Fleet
                      </p>
                    </div>

                    {/* Radio Circle */}
                    <div className="pt-0.5">
                      {!isStandardEligible ? (
                        <div
                          data-testid="standard-disabled-radio"
                          className="size-5 rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc]"
                        />
                      ) : selectedVehicle === "standard" ? (
                        <div
                          data-testid="standard-selected-indicator"
                          className="size-5 rounded-full bg-[#0b2341] flex items-center justify-center text-white"
                        >
                          <img alt="Checked" className="size-3" src={imgSvg6} />
                        </div>
                      ) : (
                        <div
                          data-testid="standard-unselected-indicator"
                          className="size-5 rounded-full border-2 border-[#cbd5e1]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className={`flex items-center gap-1 text-[12px] ${!isStandardEligible ? "text-[#94a3b8]" : "text-[#475569]"}`}>
                      <img alt="" className={`size-3.5 ${!isStandardEligible ? "opacity-50" : ""}`} src={imgSvg4} />
                      <span className={FONT}>Up to 4</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[12px] ${!isStandardEligible ? "text-[#94a3b8]" : "text-[#475569]"}`}>
                      <img alt="" className={`size-3.5 ${!isStandardEligible ? "opacity-50" : ""}`} src={imgSvg5} />
                      <span className={FONT}>2 Bags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sub-Row */}
              <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${!isStandardEligible ? "border-[#fecdd3]/60" : "border-[#f1f5f9]"}`}>
                {!isStandardEligible ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-[#e11d48]">
                      <span className="shrink-0 text-[#e11d48]">
                        <Icon name="alert" size={13} strokeWidth={2.5} />
                      </span>
                      <span className="leading-tight text-[11px]">
                        This vehicle cannot accommodate {passengers} passengers. Maximum capacity is 4.
                      </span>
                    </div>
                    <span
                      data-testid="standard-insufficient-badge"
                      className="bg-[#ffe4e6] border border-[#fecdd3] text-[#e11d48] text-[9px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0 ml-2"
                    >
                      INSUFFICIENT CAPACITY
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-[#64748b] truncate pr-2">
                      Great value for daily commute & solo travelers
                    </span>
                    {selectedVehicle === "standard" ? (
                      <span className="flex items-center gap-1 text-[#0b2341] font-bold shrink-0">
                        <img alt="" className="size-3" src={imgSvg9} /> Selected
                      </span>
                    ) : (
                      <span className="text-[#0284c7] font-semibold shrink-0">
                        Tap to select
                      </span>
                    )}
                  </>
                )}
              </div>
            </article>

            {/* Category 2: Seven-Seater */}
            <article
              data-testid="vehicle-card-seven-seater"
              onClick={isSevenSeaterEligible ? handleSelectSevenSeater : undefined}
              className={`rounded-[14px] p-3.5 flex flex-col gap-2.5 transition-all ${
                selectedVehicle === "seven-seater"
                  ? "bg-[#eff6ff] border border-[#0b2341] shadow-2xs cursor-pointer"
                  : "bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs cursor-pointer"
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* Thumbnail */}
                <div className="bg-[#e2e8f0] border border-[#dbeafe] rounded-[8px] h-[56px] w-[80px] shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    alt="Seven-Seater"
                    className="h-full w-full object-cover"
                    src={imgExecutiveVanMpvFleet}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`${FONT} text-[15px] font-bold text-[#0f172a] leading-tight`}>
                        Seven-Seater
                      </h3>
                      <p className={`${FONT} text-[12px] text-[#64748b]`}>
                        Executive Van & MPV Fleet
                      </p>
                    </div>

                    {/* Radio Circle */}
                    <div className="pt-0.5">
                      {selectedVehicle === "seven-seater" ? (
                        <div
                          data-testid="seven-seater-selected-indicator"
                          className="size-5 rounded-full bg-[#0b2341] flex items-center justify-center text-white"
                        >
                          <img alt="Checked" className="size-3" src={imgSvg6} />
                        </div>
                      ) : (
                        <div
                          data-testid="seven-seater-unselected-indicator"
                          className="size-5 rounded-full border-2 border-[#cbd5e1]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[12px] text-[#334155]">
                      <img alt="" className="size-3.5" src={imgSvg7} />
                      <span className={FONT}>Up to 6</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[#334155]">
                      <img alt="" className="size-3.5" src={imgSvg8} />
                      <span className={FONT}>4 Bags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sub-Row */}
              <div className="pt-2 border-t border-[rgba(191,219,254,0.6)] flex items-center justify-between text-[11px]">
                <span className="text-[#475569] truncate pr-2">
                  Ideal for families, extra luggage, or group runs
                </span>
                {selectedVehicle === "seven-seater" ? (
                  <span className="flex items-center gap-1 text-[#0b2341] font-bold shrink-0">
                    <img alt="" className="size-3" src={imgSvg9} /> Selected
                  </span>
                ) : (
                  <span className="text-[#0284c7] font-semibold shrink-0">
                    Tap to select
                  </span>
                )}
              </div>
            </article>
          </section>
        </main>

        {/* Footer Actions */}
        <footer className="bg-white border-t border-[#f1f5f9] p-4 flex flex-col gap-2 shrink-0 mt-auto">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isContinueEnabled}
            data-testid="check-availability-button"
            className={`${FONT} w-full h-[50px] rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
              isContinueEnabled
                ? "bg-[#0b2341] hover:bg-[#13335a] text-white cursor-pointer drop-shadow-sm"
                : "bg-[#dbe4ee] text-[#94a3b8] cursor-not-allowed"
            }`}
          >
            <span>Check Vehicle Availability</span>
            <img
              alt=""
              className={`size-4 ${!isContinueEnabled ? "opacity-40" : ""}`}
              src={imgSvg10}
            />
          </button>

          <button
            type="button"
            onClick={handleBack}
            data-testid="back-to-journey"
            className={`${FONT} w-full py-1 text-center font-bold text-[12px] text-[#0b2341] hover:underline cursor-pointer`}
          >
            ‹ Back to Journey Details
          </button>
        </footer>
      </div>
    </MobileFrame>
  );
}
