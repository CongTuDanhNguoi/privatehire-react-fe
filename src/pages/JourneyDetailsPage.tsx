// =============================================================
// JourneyDetailsPage.tsx — High-Fidelity SCRUM-16 Journey Details
// Visually corrected to match approved Figma reference designs:
// - Screen 1 — Journey Details (Completed) (Figma 6:1493)
// - Screen 2 — Pickup Location Search.png (430x915)
// - Screen 3 — Destination Search.png (430x931)
// - Screen 4 — Set Location on Map.png (430x925)
// Preserves full validation, state persistence, swap & navigation.
// =============================================================
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import MobileFrame from "../components/MobileFrame";
import { useBooking } from "../context/BookingContext";
import {
  PICKUP_SUGGESTIONS,
  DESTINATION_SUGGESTIONS,
  searchLocations,
  type MockLocation,
} from "../data/locations";
import {
  getDayOfWeek,
  getTodayIso,
  validateJourneyForm,
  type JourneyErrors,
  type JourneyFormData,
} from "../validation/journeyValidation";

const assetPathPrefix = "/figma-assets/543b4a3c-d49f-4b2d-9e56-ba0bed5f1516";
const imgContainer = `${assetPathPrefix}/4c496.svg`; // Back chevron
const imgContainer1 = `${assetPathPrefix}/85fb2.svg`; // Help icon
const imgContainer3 = `${assetPathPrefix}/6d4ac.svg`; // Change arrow
const imgContainer4 = `${assetPathPrefix}/92478.svg`; // Search icon pickup
const imgContainer5 = `${assetPathPrefix}/98aad.svg`; // Pin icon pickup
const imgContainer7 = `${assetPathPrefix}/c9742.svg`; // Swap icon
const imgContainer8 = `${assetPathPrefix}/4e4ae.svg`; // Search icon dest
const imgContainer9 = `${assetPathPrefix}/aae24.svg`; // Flag/pin dest
const imgSymbol = `${assetPathPrefix}/1bbb1.svg`; // Calendar icon
const imgSymbol1 = `${assetPathPrefix}/f4f0e.svg`; // Clock icon
const imgContainer11 = `${assetPathPrefix}/09271.svg`; // Continue arrow
const imgContainer12 = `${assetPathPrefix}/bd9ab.svg`; // Back arrow

const FONT = "font-['Inter',sans-serif]";

type ViewMode = "form" | "pickup-search" | "destination-search" | "map";

export default function JourneyDetailsPage() {
  const navigate = useNavigate();
  const {
    selectedService,
    pickupLocation,
    destination,
    journeyDate,
    journeyTime,
    setJourneyDetails,
  } = useBooking();

  // If no service selected, redirect to Service Selection
  if (!selectedService) {
    return <Navigate to="/services" replace />;
  }

  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [mapTarget, setMapTarget] = useState<"pickup" | "destination">("pickup");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form state initialized from BookingContext
  const [formData, setFormData] = useState<JourneyFormData>({
    pickupLocation: pickupLocation || "",
    destination: destination || "",
    journeyDate: journeyDate || "",
    journeyTime: journeyTime || "",
  });

  const [pickupNote, setPickupNote] = useState(
    "Driver will meet passenger at Station Car Park Pick-up Zone"
  );
  const [destNote, setDestNote] = useState(
    "Drop-off located directly outside Departures Upper Forecourt"
  );

  const [errors, setErrors] = useState<JourneyErrors>({});

  // Pinned location state for Map view
  const [pinnedLocation, setPinnedLocation] = useState({
    title: "Manchester Piccadilly Station",
    address: "Station Car Park Pick-up Zone, Manchester M1 2PB",
    fullValue: "Manchester Piccadilly Station, M1 2PB",
    category: "station",
  });

  // Handle direct field input change
  function handleChange(field: keyof JourneyFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setJourneyDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Swap pickup & destination
  function handleSwapLocations() {
    const newPickup = formData.destination;
    const newDest = formData.pickupLocation;
    const newPickupNote = destNote;
    const newDestNote = pickupNote;

    setFormData((prev) => ({
      ...prev,
      pickupLocation: newPickup,
      destination: newDest,
    }));
    setPickupNote(newPickupNote);
    setDestNote(newDestNote);
    setJourneyDetails({
      pickupLocation: newPickup,
      destination: newDest,
    });
    setErrors((prev) => ({
      ...prev,
      pickupLocation: undefined,
      destination: undefined,
    }));
  }

  // Open search screens
  function openPickupSearch() {
    setSearchQuery("");
    setViewMode("pickup-search");
  }

  function openDestinationSearch() {
    setSearchQuery("");
    setViewMode("destination-search");
  }

  // Open map screen
  function openMap(target: "pickup" | "destination") {
    setMapTarget(target);
    if (target === "pickup") {
      setPinnedLocation({
        title: "Manchester Piccadilly Station",
        address: "Station Car Park Pick-up Zone, Manchester M1 2PB",
        fullValue: "Manchester Piccadilly Station, M1 2PB",
        category: "station",
      });
    } else {
      setPinnedLocation({
        title: "Manchester Airport Terminal 2",
        address: "Ringway, Manchester, M90 4FF",
        fullValue: "Manchester Airport Terminal 2, M90 4FF",
        category: "airport",
      });
    }
    setViewMode("map");
  }

  // Select location from search list
  function handleSelectFromSearch(location: MockLocation, target: "pickup" | "destination") {
    const fullAddress = `${location.name}, ${location.postcode}`;
    if (target === "pickup") {
      handleChange("pickupLocation", fullAddress);
      if (location.note) setPickupNote(location.note);
    } else {
      handleChange("destination", fullAddress);
      if (location.note) setDestNote(location.note);
    }
    setViewMode("form");
  }

  // Confirm location from Map screen
  function handleConfirmFromMap() {
    if (mapTarget === "pickup") {
      handleChange("pickupLocation", pinnedLocation.fullValue);
      setPickupNote(pinnedLocation.address);
    } else {
      handleChange("destination", pinnedLocation.fullValue);
      setDestNote(pinnedLocation.address);
    }
    setViewMode("form");
  }

  // Use current GPS location
  function handleUseCurrentLocation() {
    const currentLoc = "Manchester Piccadilly Station, M1 2PB";
    handleChange("pickupLocation", currentLoc);
    setPickupNote("Current GPS Location (within 10m accuracy)");
    setViewMode("form");
  }

  // Form Submit
  function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault();

    const validationErrors = validateJourneyForm(formData, new Date());
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.pickupLocation) {
        document.getElementById("pickupLocation")?.focus();
      } else if (validationErrors.destination) {
        document.getElementById("destination")?.focus();
      } else if (validationErrors.journeyDate) {
        document.getElementById("journeyDate")?.focus();
      } else if (validationErrors.journeyTime) {
        document.getElementById("journeyTime")?.focus();
      }
      return;
    }

    // Persist and navigate to /vehicle
    setJourneyDetails(formData);
    navigate("/vehicle");
  }

  const dayOfWeekDisplay = getDayOfWeek(formData.journeyDate);
  const minDate = getTodayIso();

  // Filtered lists for search screens
  const pickupResults = searchLocations(searchQuery, "pickup");
  const destResults = searchLocations(searchQuery, "destination");

  // =========================================================================
  // VIEW 2: Screen 2 — Pickup Location Search (Figma Approved)
  // =========================================================================
  if (viewMode === "pickup-search") {
    return (
      <MobileFrame height={915}>
        <div className="flex flex-col min-h-[915px] bg-[#f8fafc] size-full relative">
          {/* Header */}
          <header className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4">
            <button
              type="button"
              onClick={() => setViewMode("form")}
              aria-label="Back to Journey Details"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0f172a] hover:bg-[#f1f5f9]"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <h1 className={`${FONT} text-[16px] font-bold text-[#0f172a]`}>Select Pickup Location</h1>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Help"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#94a3b8] hover:text-[#0f172a]"
            >
              <Icon name="helpCircle" size={20} />
            </button>
          </header>

          <main className="flex-1 p-4 flex flex-col gap-4">
            {/* Input & Label */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pickup-search-input" className={`${FONT} text-[13px] font-bold text-[#0f172a]`}>
                  Pickup Location <span className="text-[#ef4444]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className={`${FONT} flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:underline cursor-pointer`}
                >
                  <Icon name="crosshair" size={14} /> Current Location
                </button>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#94a3b8] pointer-events-none">
                  <Icon name="search" size={17} />
                </span>
                <input
                  id="pickup-search-input"
                  type="text"
                  autoFocus
                  placeholder="Search pickup location, postcode or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${FONT} w-full rounded-xl border-2 border-[#2563eb] bg-white py-3 pl-10 pr-4 text-[13px] text-[#0f172a] outline-none shadow-sm placeholder:text-[#94a3b8]`}
                />
              </div>
            </div>

            {/* Quick Action Buttons (Set on Map & Saved Places) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => openMap("pickup")}
                className="flex h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-[#f8faff] text-[13px] font-bold text-[#1e293b] hover:bg-[#eff6ff] hover:border-[#2563eb] cursor-pointer shadow-sm transition-colors"
              >
                <span className="text-[#2563eb]"><Icon name="map" size={16} /></span> Set on Map
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="flex h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-[#f8faff] text-[13px] font-bold text-[#1e293b] hover:bg-[#eff6ff] cursor-pointer shadow-sm transition-colors"
              >
                <span className="text-[#2563eb]"><Icon name="bookmark" size={16} /></span> Saved Places
              </button>
            </div>

            {/* Section Heading */}
            <div className="flex items-center justify-between pt-1">
              <span className={`${FONT} text-[11px] font-bold tracking-wider text-[#64748b] uppercase`}>
                RECENT & SUGGESTED LOCATIONS
              </span>
              <span className={`${FONT} text-[11px] font-medium text-[#64748b]`}>
                {pickupResults.length} found
              </span>
            </div>

            {/* Suggestions List */}
            <ul className="flex flex-col gap-2.5">
              {pickupResults.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectFromSearch(loc, "pickup")}
                    className={`w-full flex items-center justify-between rounded-2xl border p-3.5 text-left cursor-pointer transition-all ${
                      loc.isRecent
                        ? "border-[#bfdbfe] bg-[#f0f7ff] shadow-sm"
                        : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        loc.category === "station"
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : loc.category === "airport"
                          ? "bg-[#e2e8f0] text-[#475569]"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}>
                        <Icon
                          name={loc.category === "station" ? "train" : loc.category === "airport" ? "planeTakeoff" : loc.category === "hotel" ? "building" : "mapPin"}
                          size={18}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`${FONT} text-[13px] font-bold text-[#0f172a] truncate`}>
                            {loc.name}
                          </p>
                          {loc.isRecent && (
                            <span className="bg-[#dbeafe] text-[#1d4ed8] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                              RECENT
                            </span>
                          )}
                        </div>
                        <p className={`${FONT} text-[11px] text-[#64748b] truncate mt-0.5`}>
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#94a3b8] pl-2">
                      <Icon name="chevronRight" size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Cancel Button */}
            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={() => setViewMode("form")}
                className={`${FONT} w-full h-12 rounded-xl border border-[#cbd5e1] bg-white text-[13px] font-semibold text-[#334155] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center gap-2`}
              >
                ← Cancel and Return to Journey Details
              </button>
            </div>
          </main>
        </div>
      </MobileFrame>
    );
  }

  // =========================================================================
  // VIEW 3: Screen 3 — Destination Search (Figma Approved)
  // =========================================================================
  if (viewMode === "destination-search") {
    return (
      <MobileFrame height={931}>
        <div className="flex flex-col min-h-[931px] bg-[#f8fafc] size-full relative">
          {/* Header */}
          <header className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4">
            <button
              type="button"
              onClick={() => setViewMode("form")}
              aria-label="Back to Journey Details"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0f172a] hover:bg-[#f1f5f9]"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <h1 className={`${FONT} text-[16px] font-bold text-[#0f172a]`}>Select Destination</h1>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Help"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#94a3b8] hover:text-[#0f172a]"
            >
              <Icon name="helpCircle" size={20} />
            </button>
          </header>

          <main className="flex-1 p-4 flex flex-col gap-4">
            {/* Input & Label */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dest-search-input" className={`${FONT} text-[13px] font-bold text-[#0f172a]`}>
                Destination <span className="text-[#ef4444]">*</span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#94a3b8] pointer-events-none">
                  <Icon name="search" size={17} />
                </span>
                <input
                  id="dest-search-input"
                  type="text"
                  autoFocus
                  placeholder="Search destination, postcode or airport"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${FONT} w-full rounded-xl border-2 border-[#2563eb] bg-white py-3 pl-10 pr-4 text-[13px] text-[#0f172a] outline-none shadow-sm placeholder:text-[#94a3b8]`}
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => openMap("destination")}
                className="flex h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-[#f8faff] text-[13px] font-bold text-[#1e293b] hover:bg-[#eff6ff] hover:border-[#2563eb] cursor-pointer shadow-sm transition-colors"
              >
                <span className="text-[#2563eb]"><Icon name="map" size={16} /></span> Set on Map
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="flex h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dbeafe] bg-[#f8faff] text-[13px] font-bold text-[#1e293b] hover:bg-[#eff6ff] cursor-pointer shadow-sm transition-colors"
              >
                <span className="text-[#2563eb]"><Icon name="bookmark" size={16} /></span> Saved Places
              </button>
            </div>

            {/* Section Heading */}
            <div className="flex items-center justify-between pt-1">
              <span className={`${FONT} text-[11px] font-bold tracking-wider text-[#64748b] uppercase`}>
                RECENT & SUGGESTED DESTINATIONS
              </span>
              <span className={`${FONT} text-[11px] font-medium text-[#64748b]`}>
                {destResults.length} suggested
              </span>
            </div>

            {/* Suggestions List */}
            <ul className="flex flex-col gap-2.5">
              {destResults.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectFromSearch(loc, "destination")}
                    className={`w-full flex items-center justify-between rounded-2xl border p-3.5 text-left cursor-pointer transition-all ${
                      loc.isRecent
                        ? "border-[#bfdbfe] bg-[#f0f7ff] shadow-sm"
                        : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        loc.category === "airport"
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : loc.category === "station"
                          ? "bg-[#e2e8f0] text-[#475569]"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}>
                        <Icon
                          name={loc.category === "airport" ? "planeTakeoff" : loc.category === "station" ? "train" : loc.category === "hotel" ? "building" : "mapPin"}
                          size={18}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`${FONT} text-[13px] font-bold text-[#0f172a] truncate`}>
                            {loc.name}
                          </p>
                          {loc.isRecent && (
                            <span className="bg-[#dbeafe] text-[#1d4ed8] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                              RECENT
                            </span>
                          )}
                        </div>
                        <p className={`${FONT} text-[11px] text-[#64748b] truncate mt-0.5`}>
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#94a3b8] pl-2">
                      <Icon name="chevronRight" size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Cancel Button */}
            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={() => setViewMode("form")}
                className={`${FONT} w-full h-12 rounded-xl border border-[#cbd5e1] bg-white text-[13px] font-semibold text-[#334155] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center gap-2`}
              >
                ← Cancel and Return to Journey Details
              </button>
            </div>
          </main>
        </div>
      </MobileFrame>
    );
  }

  // =========================================================================
  // VIEW 4: Screen 4 — Set Location on Map (Figma Approved)
  // =========================================================================
  if (viewMode === "map") {
    return (
      <MobileFrame height={925}>
        <div className="flex flex-col min-h-[925px] bg-white size-full relative">
          {/* Header */}
          <header className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] bg-white px-4">
            <button
              type="button"
              onClick={() => setViewMode(mapTarget === "pickup" ? "pickup-search" : "destination-search")}
              aria-label="Back to Location Search"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#0f172a] hover:bg-[#f1f5f9]"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <h1 className={`${FONT} text-[16px] font-bold text-[#0f172a]`}>Set Location on Map</h1>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              aria-label="Help"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-[#94a3b8] hover:text-[#0f172a]"
            >
              <Icon name="helpCircle" size={20} />
            </button>
          </header>

          <main className="flex-1 p-4 flex flex-col gap-3">
            {/* Sub-header instruction */}
            <div className="flex flex-col gap-1">
              <span className={`${FONT} text-[10px] font-bold uppercase tracking-wider text-[#64748b]`}>
                DRAG OR TAP TO ADJUST
              </span>
              <div className="flex items-center justify-between">
                <p className={`${FONT} flex items-center gap-1.5 text-[12px] font-bold text-[#0f172a]`}>
                  <span className="text-[#2563eb]"><Icon name="mapPin" size={14} /></span>
                  DRAG OR TAP MAP TO ADJUST PIN
                </p>
                <span className="bg-[#f1f5f9] text-[#64748b] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  Interactive
                </span>
              </div>
            </div>

            {/* Realistic Street Map Container (Figma 4) */}
            <div className="relative h-[340px] rounded-2xl overflow-hidden border border-[#cbd5e1] bg-[#eef3f7] flex flex-col items-center justify-center shadow-inner">
              {/* Map Canvas Background: Streets & Green Areas */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Park Areas */}
                <div className="absolute top-[20px] right-[80px] w-[140px] h-[100px] bg-[#dcfce7] rounded-full opacity-70 transform rotate-12" />
                <div className="absolute bottom-[40px] left-[20px] w-[120px] h-[120px] bg-[#dcfce7] rounded-full opacity-70" />

                {/* Major Roads */}
                {/* London Rd A6 */}
                <div className="absolute top-0 bottom-0 left-[165px] w-[24px] bg-white border-l border-r border-[#cbd5e1] transform -rotate-12 shadow-sm" />
                {/* Piccadilly */}
                <div className="absolute top-[80px] left-0 right-0 h-[22px] bg-white border-t border-b border-[#cbd5e1] transform rotate-6 shadow-sm" />
                {/* Fairfield St */}
                <div className="absolute bottom-[70px] left-0 right-0 h-[20px] bg-white border-t border-b border-[#cbd5e1] transform -rotate-6 shadow-sm" />
                {/* Railway / Station Box */}
                <div className="absolute bottom-[40px] right-[20px] w-[110px] h-[75px] bg-[#f1f5f9] border border-dashed border-[#94a3b8] rounded-xl flex items-center justify-center">
                  <span className={`${FONT} text-[9px] font-semibold text-[#94a3b8] text-center`}>Station Forecourt</span>
                </div>

                {/* Street Labels */}
                <span className={`${FONT} absolute top-[65px] left-[50px] text-[10px] font-semibold text-[#64748b] transform rotate-6`}>
                  Piccadilly
                </span>
                <span className={`${FONT} absolute top-[130px] left-[125px] text-[10px] font-semibold text-[#64748b] transform -rotate-12`}>
                  London Rd / A6
                </span>
                <span className={`${FONT} absolute top-[110px] right-[45px] text-[10px] font-semibold text-[#64748b]`}>
                  Piccadilly Station
                </span>
                <span className={`${FONT} absolute bottom-[92px] left-[40px] text-[10px] font-semibold text-[#64748b] transform -rotate-6`}>
                  Fairfield St
                </span>
              </div>

              {/* Map Navigation Controls (Top Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                <div className="flex flex-col rounded-xl bg-white shadow-md border border-[#cbd5e1] overflow-hidden">
                  <button type="button" aria-label="Zoom in" className="size-8 flex items-center justify-center font-bold text-[#1e293b] hover:bg-[#f1f5f9] border-b border-[#e2e8f0]">
                    +
                  </button>
                  <button type="button" aria-label="Zoom out" className="size-8 flex items-center justify-center font-bold text-[#1e293b] hover:bg-[#f1f5f9]">
                    −
                  </button>
                </div>
                <button type="button" aria-label="Center on GPS" className="size-8 rounded-xl bg-white shadow-md border border-[#cbd5e1] flex items-center justify-center text-[#2563eb] hover:bg-[#f1f5f9]">
                  <Icon name="crosshair" size={16} />
                </button>
              </div>

              {/* Central Pin Drop */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#0b2341] text-white shadow-xl ring-4 ring-white">
                    <Icon name="mapPin" size={20} />
                  </span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-[#0b2341]/40" />
                </div>
              </div>
            </div>

            {/* Selected Location Card */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`${FONT} text-[11px] font-bold tracking-wider text-[#64748b] uppercase`}>
                  SELECTED LOCATION
                </span>
                <span className="bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Selected Point
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#dbeafe] text-[#2563eb]">
                  <Icon name={pinnedLocation.category === "station" ? "train" : "planeTakeoff"} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`${FONT} text-[15px] font-bold text-[#0f172a]`}>{pinnedLocation.title}</p>
                  <p className={`${FONT} text-[12px] text-[#64748b] mt-0.5`}>{pinnedLocation.address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] text-[12px]">
                <button
                  type="button"
                  onClick={() => setViewMode(mapTarget === "pickup" ? "pickup-search" : "destination-search")}
                  className={`${FONT} flex items-center gap-1.5 font-semibold text-[#2563eb] hover:underline cursor-pointer`}
                >
                  <Icon name="pencil" size={13} /> Edit Address or Fine-tune Pin
                </button>
                <span className={`${FONT} flex items-center gap-1 font-semibold text-[#059669]`}>
                  <Icon name="check" size={14} strokeWidth={3} /> Verified
                </span>
              </div>
            </div>

            {/* Bottom Confirm Action */}
            <div className="mt-auto pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmFromMap}
                className={`${FONT} w-full h-[50px] rounded-xl bg-[#0b2341] font-bold text-[14px] text-white hover:bg-[#13335a] cursor-pointer flex items-center justify-center gap-2 shadow-md transition-colors`}
              >
                Confirm Location →
              </button>
              <button
                type="button"
                onClick={() => setViewMode(mapTarget === "pickup" ? "pickup-search" : "destination-search")}
                className={`${FONT} w-full py-1 text-center font-semibold text-[13px] text-[#475569] hover:text-[#0b2341] cursor-pointer`}
              >
                ← Back to Location Search
              </button>
            </div>
          </main>
        </div>
      </MobileFrame>
    );
  }

  // =========================================================================
  // VIEW 1: Screen 1 — Journey Details (Completed & Validation States)
  // Matches Figma 6:1493 Screen 1 & UI Kit 04 - Input Fields
  // =========================================================================
  return (
    <MobileFrame height={885.5}>
      <div
        className="border border-[#f1f5f9] border-solid content-stretch flex flex-col items-start pb-[40px] pt-px px-px relative shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] size-full min-h-[885.5px] bg-white"
        data-node-id="6:1493"
        data-name="Screen 1 — Journey Details (Completed)"
      >
        <div className="relative shrink-0 w-full" data-node-id="6:1494" data-name="Top Content Area">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
            {/* Top Navigation */}
            <header
              className="bg-white border-[#f1f5f9] border-b border-solid content-stretch flex items-center justify-between pb-[9px] pt-[10px] px-[20px] relative shrink-0 w-full"
              data-node-id="6:1495"
              data-name="Screen Navigation"
            >
              <button
                type="button"
                onClick={() => navigate("/services")}
                aria-label="Go Back to Service Selection"
                className="relative rounded-[9999px] shrink-0 size-[36px] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
                data-node-id="6:1496"
                data-name="Button - Go Back"
              >
                <div className="h-[14px] relative shrink-0 w-[8px]" data-node-id="6:1497">
                  <img alt="Back" className="absolute block inset-0 max-w-none size-full" src={imgContainer} />
                </div>
              </button>

              <div className="relative shrink-0" data-node-id="6:1499" data-name="Heading 1">
                <h1 className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0b2341] text-[16px] tracking-[-0.4px] whitespace-nowrap">
                  <span className="leading-[24px]">Journey Details</span>
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                aria-label="Journey Help & Assistance"
                className="relative rounded-[9999px] shrink-0 size-[36px] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer text-[#0b2341]"
                data-node-id="6:1501"
                data-name="Button - Journey Help"
              >
                <div className="relative shrink-0 size-[18px]" data-node-id="6:1502">
                  <img alt="Help" className="absolute block inset-0 max-w-none size-full" src={imgContainer1} />
                </div>
              </button>
            </header>

            {/* Stepper Progress Bar */}
            <div
              className="bg-[rgba(248,250,252,0.7)] border-[#f1f5f9] border-b border-solid content-stretch flex flex-col items-start pb-[11px] pt-[10px] px-[24px] relative shrink-0 w-full"
              data-node-id="6:1504"
              data-name="Section - Booking Progress Tracker"
            >
              <div className="h-[24px] max-w-[340px] relative shrink-0 w-full" data-node-id="6:1505">
                <div className="absolute content-stretch flex flex-col h-[2px] items-start left-[82.45px] px-[6px] right-[209.03px] top-[11px]" data-node-id="6:1506">
                  <div className="bg-[#e2e8f0] h-[2px] relative shrink-0 w-full" data-node-id="6:1507" />
                </div>
                <div className="absolute content-stretch flex flex-col h-[2px] items-start left-[211.13px] px-[6px] right-[80.34px] top-[11px]" data-node-id="6:1508">
                  <div className="bg-[#e2e8f0] h-[2px] relative shrink-0 w-full" data-node-id="6:1509" />
                </div>

                {/* Step 1: Active */}
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-0 pr-[4px] top-1/2" data-node-id="6:1510">
                  <div className="bg-[#0b2341] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1511">
                    <span className="font-['Inter',sans-serif] font-bold leading-[16px] text-[12px] text-white">1</span>
                  </div>
                  <span className="font-['Inter',sans-serif] font-bold leading-[16px] text-[#0b2341] text-[12px]">Journey</span>
                </div>

                {/* Step 2: Inactive */}
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-[130.97px] px-[4px] top-1/2" data-node-id="6:1515">
                  <div className="bg-[#e2e8f0] content-stretch flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1516">
                    <span className="font-['Inter',sans-serif] font-semibold leading-[16px] text-[#64748b] text-[12px]">2</span>
                  </div>
                  <span className="font-['Inter',sans-serif] font-medium leading-[16px] text-[#64748b] text-[12px]">Vehicle</span>
                </div>

                {/* Step 3: Inactive */}
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[6px] items-center left-[259.66px] pl-[4px] top-1/2" data-node-id="6:1520">
                  <div className="bg-[#e2e8f0] content-stretch flex items-center justify-center pb-[4.5px] pt-[3.5px] relative rounded-[9999px] shrink-0 size-[24px]" data-node-id="6:1521">
                    <span className="font-['Inter',sans-serif] font-semibold leading-[16px] text-[#64748b] text-[12px]">3</span>
                  </div>
                  <span className="font-['Inter',sans-serif] font-medium leading-[16px] text-[#64748b] text-[12px]">Confirm</span>
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <main className="content-stretch flex flex-col gap-[14px] items-start p-[16px] relative shrink-0 w-full" data-node-id="6:1525">
              {/* Selected Service Card */}
              <div
                className="bg-white border border-[#e2e8f0] border-solid content-stretch flex flex-col gap-[5px] items-start overflow-clip pl-[17px] pr-[15px] py-[15px] relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full"
                data-node-id="6:1526"
                data-name="Section - SelectedServiceCard"
              >
                <div className="relative shrink-0 w-full" data-node-id="6:1527">
                  <div className="content-stretch flex items-start justify-between relative size-full">
                    <div className="content-stretch flex flex-col items-start relative shrink-0">
                      <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-node-id="6:1529">
                        <span className="font-['Inter',sans-serif] font-bold text-[#94a3b8] text-[11px] tracking-[0.55px] uppercase">
                          SELECTED SERVICE
                        </span>
                        <div className="bg-[#10b981] relative rounded-[9999px] shrink-0 size-[6px]" data-node-id="6:1531" />
                      </div>
                      <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-node-id="6:1532">
                        <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-node-id="6:1533">
                          <span className="flex size-5 items-center justify-center text-[#0b2341]">
                            <Icon name={selectedService.icon} size={18} strokeWidth={2} />
                          </span>
                          <h2
                            data-testid="journey-service-title"
                            className="font-['Inter',sans-serif] font-bold leading-[24px] text-[#0b2341] text-[16px]"
                            data-node-id="6:1537"
                          >
                            {selectedService.title}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Change Button */}
                    <button
                      type="button"
                      onClick={() => navigate("/services")}
                      className="bg-[#f8fafc] border border-[#e2e8f0] border-solid content-stretch flex gap-[6px] items-center px-[13px] py-[5px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#edf2f7]"
                      data-node-id="6:1538"
                      data-name="Change Button"
                    >
                      <span className="font-['Inter',sans-serif] font-semibold text-[#334155] text-[12px]">Change</span>
                      <div className="h-[10px] relative shrink-0 w-[8.75px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer3} />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative shrink-0 w-full" data-node-id="6:1543">
                  <p className="font-['Inter',sans-serif] font-normal leading-[16.5px] text-[#64748b] text-[12px] w-full">
                    {selectedService.description}
                  </p>
                </div>
                <div className="absolute bg-[#0b2341] bottom-0 left-0 top-0 w-[4px]" data-node-id="6:1545" />
              </div>

              {/* Form Content */}
              <form noValidate onSubmit={handleSubmit} className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-full" data-node-id="6:1546">
                {/* 1. Pickup Location */}
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="6:1547">
                  <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:1548">
                    <label htmlFor="pickupLocation" className="font-['Inter',sans-serif] font-bold leading-[16px] text-[#1e293b] text-[12px]">
                      Pickup Location <span className="text-[#dc2626]">*</span>
                    </label>

                    <button
                      type="button"
                      data-testid="search-pickup"
                      onClick={openPickupSearch}
                      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer text-[#2563eb] hover:underline"
                      data-node-id="6:1551"
                    >
                      <div className="h-[11px] relative shrink-0 w-[12px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer4} />
                      </div>
                      <span className="font-['Inter',sans-serif] font-semibold text-[12px]">Search / Map</span>
                    </button>
                  </div>

                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1556">
                    <input
                      id="pickupLocation"
                      name="pickupLocation"
                      type="text"
                      placeholder="e.g. Manchester Piccadilly Station, M1 2PB"
                      value={formData.pickupLocation}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("pickupLocation", e.target.value)}
                      aria-invalid={Boolean(errors.pickupLocation)}
                      aria-describedby={errors.pickupLocation ? "pickupLocation-error" : undefined}
                      className={`bg-white border content-stretch flex flex-[1_0_0] font-['Inter',sans-serif] font-semibold text-[#1e293b] text-[12px] min-w-px pl-[37px] pr-[15px] py-[11px] relative rounded-[12px] outline-none placeholder:text-[#94a3b8] ${
                        errors.pickupLocation ? "border-2 border-[#ef4444]" : "border-[#cbd5e1] focus:border-[#0b2341]"
                      }`}
                    />

                    <div className="absolute content-stretch flex items-center justify-center left-[12px] top-[13px] pointer-events-none" data-node-id="6:1560">
                      <div className="relative shrink-0 size-[16px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer5} />
                      </div>
                    </div>
                  </div>

                  {errors.pickupLocation ? (
                    <p id="pickupLocation-error" role="alert" className="font-['Inter',sans-serif] text-[11px] leading-[15px] text-[#dc2626] pl-[4px]">
                      {errors.pickupLocation}
                    </p>
                  ) : (
                    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1565">
                      <p className="font-['Inter',sans-serif] font-normal leading-[16.5px] text-[#64748b] text-[11px]">
                        {pickupNote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Swap / Invert Button */}
                <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-node-id="6:1567">
                  <button
                    type="button"
                    data-testid="swap-locations"
                    onClick={handleSwapLocations}
                    title="Swap Pickup and Destination"
                    aria-label="Swap Pickup and Destination"
                    className="bg-white border border-[#cbd5e1] border-solid content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[28px] cursor-pointer hover:bg-[#f8fafc] hover:border-[#0b2341] transition-transform active:scale-95"
                    data-node-id="6:1568"
                  >
                    <div className="h-[12px] relative shrink-0 w-[13.5px]">
                      <img alt="Swap" className="absolute block inset-0 max-w-none size-full" src={imgContainer7} />
                    </div>
                  </button>
                </div>

                {/* 2. Destination Location */}
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="6:1571">
                  <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="6:1572">
                    <label htmlFor="destination" className="font-['Inter',sans-serif] font-bold leading-[16px] text-[#1e293b] text-[12px]">
                      Destination <span className="text-[#dc2626]">*</span>
                    </label>

                    <button
                      type="button"
                      data-testid="search-destination"
                      onClick={openDestinationSearch}
                      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer text-[#2563eb] hover:underline"
                      data-node-id="6:1575"
                    >
                      <div className="relative shrink-0 size-[11px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer8} />
                      </div>
                      <span className="font-['Inter',sans-serif] font-semibold text-[12px]">Search / Map</span>
                    </button>
                  </div>

                  <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1580">
                    <input
                      id="destination"
                      name="destination"
                      type="text"
                      placeholder="e.g. Manchester Airport Terminal 2, M90 4FF"
                      value={formData.destination}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("destination", e.target.value)}
                      aria-invalid={Boolean(errors.destination)}
                      aria-describedby={errors.destination ? "destination-error" : undefined}
                      className={`bg-white border content-stretch flex flex-[1_0_0] font-['Inter',sans-serif] font-semibold text-[#1e293b] text-[12px] min-w-px pl-[37px] pr-[15px] py-[11px] relative rounded-[12px] outline-none placeholder:text-[#94a3b8] ${
                        errors.destination ? "border-2 border-[#ef4444]" : "border-[#cbd5e1] focus:border-[#0b2341]"
                      }`}
                    />

                    <div className="absolute content-stretch flex items-center justify-center left-[12px] top-[14px] pointer-events-none" data-node-id="6:1584">
                      <div className="h-[14px] relative shrink-0 w-[17.5px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer9} />
                      </div>
                    </div>
                  </div>

                  {errors.destination ? (
                    <p id="destination-error" role="alert" className="font-['Inter',sans-serif] text-[11px] leading-[15px] text-[#dc2626] pl-[4px]">
                      {errors.destination}
                    </p>
                  ) : (
                    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1589">
                      <p className="font-['Inter',sans-serif] font-normal leading-[16.5px] text-[#64748b] text-[11px]">
                        {destNote}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Date & Time Grid */}
                <div className="content-stretch flex gap-[12px] items-start justify-center pt-[4px] relative shrink-0 w-full" data-node-id="6:1591">
                  {/* Journey Date */}
                  <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="6:1592">
                    <label htmlFor="journeyDate" className="font-['Inter',sans-serif] font-bold leading-[16px] text-[#1e293b] text-[12px]">
                      Journey Date <span className="text-[#dc2626]">*</span>
                    </label>

                    <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1595">
                      <input
                        id="journeyDate"
                        name="journeyDate"
                        type="date"
                        min={minDate}
                        value={formData.journeyDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("journeyDate", e.target.value)}
                        aria-invalid={Boolean(errors.journeyDate)}
                        aria-describedby={errors.journeyDate ? "journeyDate-error" : undefined}
                        className={`bg-white border content-stretch flex flex-[1_0_0] font-['Inter',sans-serif] font-semibold text-[#1e293b] text-[12px] min-w-px pl-[33px] pr-[10px] py-[10px] relative rounded-[12px] outline-none ${
                          errors.journeyDate ? "border-2 border-[#ef4444]" : "border-[#cbd5e1] focus:border-[#0b2341]"
                        }`}
                      />
                      <div className="absolute h-[12px] left-[12px] top-[15px] w-[10.5px] pointer-events-none" data-node-id="6:1599">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSymbol} />
                      </div>
                    </div>

                    {errors.journeyDate ? (
                      <p id="journeyDate-error" role="alert" className="font-['Inter',sans-serif] text-[11px] leading-[15px] text-[#dc2626] pl-[4px]">
                        {errors.journeyDate}
                      </p>
                    ) : (
                      <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1600">
                        <p data-testid="date-day-of-week" className="font-['Inter',sans-serif] font-medium leading-[16.5px] text-[#64748b] text-[11px]">
                          {dayOfWeekDisplay || "Day of week"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Journey Time */}
                  <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-node-id="6:1602">
                    <label htmlFor="journeyTime" className="font-['Inter',sans-serif] font-bold leading-[16px] text-[#1e293b] text-[12px]">
                      Journey Time <span className="text-[#dc2626]">*</span>
                    </label>

                    <div className="content-stretch flex items-center relative shrink-0 w-full" data-node-id="6:1605">
                      <input
                        id="journeyTime"
                        name="journeyTime"
                        type="time"
                        value={formData.journeyTime}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("journeyTime", e.target.value)}
                        aria-invalid={Boolean(errors.journeyTime)}
                        aria-describedby={errors.journeyTime ? "journeyTime-error" : undefined}
                        className={`bg-white border content-stretch flex flex-[1_0_0] font-['Inter',sans-serif] font-semibold text-[#1e293b] text-[12px] min-w-px pl-[33px] pr-[10px] py-[10px] relative rounded-[12px] outline-none ${
                          errors.journeyTime ? "border-2 border-[#ef4444]" : "border-[#cbd5e1] focus:border-[#0b2341]"
                        }`}
                      />
                      <div className="absolute left-[12px] size-[12px] top-[15px] pointer-events-none" data-node-id="6:1609">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSymbol1} />
                      </div>
                    </div>

                    {errors.journeyTime ? (
                      <p id="journeyTime-error" role="alert" className="font-['Inter',sans-serif] text-[11px] leading-[15px] text-[#dc2626] pl-[4px]">
                        {errors.journeyTime}
                      </p>
                    ) : (
                      <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0 w-full" data-node-id="6:1610">
                        <p className="font-['Inter',sans-serif] font-medium leading-[16.5px] text-[#64748b] text-[11px]">
                          GMT (Local)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue CTA Section */}
                <div className="content-stretch flex flex-col items-center pt-[28px] relative shrink-0 w-full" data-node-id="6:1612">
                  <button
                    type="submit"
                    data-testid="continue-to-vehicle"
                    className="bg-[#0b2341] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center justify-center px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#13335a] transition-colors"
                    data-node-id="6:1613"
                    data-name="Button"
                  >
                    <span className="font-['Inter',sans-serif] font-bold text-[14px] text-center text-white leading-[20px]">
                      Continue to Vehicle Selection
                    </span>
                    <div className="h-[9px] relative shrink-0 w-[10.5px]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer11} />
                    </div>
                  </button>

                  <div className="content-stretch flex flex-col items-start pt-[12px] relative shrink-0" data-node-id="6:1618">
                    <button
                      type="button"
                      onClick={() => navigate("/services")}
                      className="content-stretch flex gap-[6px] items-center py-[6px] relative shrink-0 cursor-pointer text-[#475569] hover:text-[#0b2341]"
                      data-node-id="6:1619"
                    >
                      <div className="h-[8.25px] relative shrink-0 w-[9.625px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer12} />
                      </div>
                      <span className="font-['Inter',sans-serif] font-semibold text-[12px] text-center leading-[16px]">
                        Back to Service Selection
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: Journey Help Information                           */}
        {/* ========================================================= */}
        {showHelpModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full rounded-2xl bg-white p-5 shadow-2xl border border-[#cbd5e1]">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <h3 className="font-bold text-[#0b2341] text-[16px] flex items-center gap-2">
                  <Icon name="shield" size={18} /> Journey Booking Help
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="size-7 rounded-full text-[#64748b] hover:bg-[#f1f5f9] flex items-center justify-center font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div className="py-3 text-[12px] leading-5 text-[#475569] flex flex-col gap-2">
                <p>
                  <strong>• Complimentary Wait Time:</strong> Airport pickups include 60 minutes free wait time from actual flight landing. All other journeys include 15 minutes.
                </p>
                <p>
                  <strong>• Flight Tracking:</strong> For Airport transfers, provide flight details so drivers automatically adjust pickup schedules for delays.
                </p>
                <p>
                  <strong>• Luggage & Sizing:</strong> Please specify the correct date and vehicle size on the next step to ensure adequate vehicle boot space.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="mt-2 w-full h-10 rounded-xl bg-[#0b2341] text-white font-semibold text-[13px] cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
