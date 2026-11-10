// =============================================================
// BookingContext.tsx — Booking State Management
// Backward-compatible extension supporting:
// - selectedService (SCRUM-15)
// - pickupLocation, destination, journeyDate, journeyTime (SCRUM-16)
// - passengerCount, vehicleSize (designed for SCRUM-17 / 18)
// Persists in sessionStorage across reloads and forward/back navigation.
// =============================================================
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { findService, type Service, type ServiceId } from "../data/services";

const SERVICE_STORAGE_KEY = "phc_selected_service";
const DETAILS_STORAGE_KEY = "phc_booking_details";

export interface JourneyDetailsState {
  pickupLocation: string;
  destination: string;
  journeyDate: string; // YYYY-MM-DD
  journeyTime: string; // HH:mm
  passengerCount?: number;
  vehicleSize?: string | null;
  availabilityResult?: "available" | "unavailable" | null;
}

export interface BookingContextValue {
  selectedService: Service | undefined;
  selectService: (id: ServiceId) => void;
  clearBooking: () => void;

  // SCRUM-16 Journey Details fields
  pickupLocation: string;
  destination: string;
  journeyDate: string;
  journeyTime: string;
  passengerCount: number;
  vehicleSize: string | null;
  availabilityResult: "available" | "unavailable" | null;

  setPickupLocation: (loc: string) => void;
  setDestination: (dest: string) => void;
  setJourneyDate: (date: string) => void;
  setJourneyTime: (time: string) => void;
  setJourneyDetails: (details: Partial<JourneyDetailsState>) => void;
  setVehicleSelection: (vehicleSize: string | null, passengerCount?: number) => void;
  setAvailabilityResult: (res: "available" | "unavailable" | null) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function readStoredService(): ServiceId | null {
  try {
    const id = sessionStorage.getItem(SERVICE_STORAGE_KEY);
    return findService(id) ? (id as ServiceId) : null;
  } catch {
    return null;
  }
}

function readStoredDetails(): JourneyDetailsState {
  try {
    const raw = sessionStorage.getItem(DETAILS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pickupLocation: parsed.pickupLocation || "",
        destination: parsed.destination || "",
        journeyDate: parsed.journeyDate || "",
        journeyTime: parsed.journeyTime || "",
        passengerCount: typeof parsed.passengerCount === "number" ? parsed.passengerCount : 3,
        vehicleSize: parsed.vehicleSize !== undefined ? parsed.vehicleSize : "seven-seater",
        availabilityResult: parsed.availabilityResult ?? null,
      };
    }
  } catch {
    /* ignore error */
  }
  return {
    pickupLocation: "",
    destination: "",
    journeyDate: "",
    journeyTime: "",
    passengerCount: 3,
    vehicleSize: "seven-seater",
    availabilityResult: null,
  };
}

function persistDetails(details: JourneyDetailsState) {
  try {
    sessionStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
  } catch {
    /* ignore error */
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [serviceId, setServiceId] = useState<ServiceId | null>(readStoredService);
  const [details, setDetails] = useState<JourneyDetailsState>(readStoredDetails);

  const selectService = useCallback((id: ServiceId) => {
    setServiceId(id);
    try {
      sessionStorage.setItem(SERVICE_STORAGE_KEY, id);
    } catch {
      /* ignore error */
    }
  }, []);

  const setJourneyDetails = useCallback((updated: Partial<JourneyDetailsState>) => {
    setDetails((prev) => {
      // Invalidate stale availability result if inputs are changing without explicit availabilityResult
      const shouldInvalidateAvailability =
        updated.availabilityResult === undefined &&
        (updated.pickupLocation !== undefined ||
          updated.destination !== undefined ||
          updated.journeyDate !== undefined ||
          updated.journeyTime !== undefined ||
          updated.passengerCount !== undefined ||
          updated.vehicleSize !== undefined);

      const next: JourneyDetailsState = {
        ...prev,
        ...updated,
        availabilityResult: shouldInvalidateAvailability ? null : (updated.availabilityResult ?? prev.availabilityResult),
      };
      persistDetails(next);
      return next;
    });
  }, []);

  const setAvailabilityResult = useCallback((res: "available" | "unavailable" | null) => {
    setJourneyDetails({ availabilityResult: res });
  }, [setJourneyDetails]);

  const setPickupLocation = useCallback((pickupLocation: string) => {
    setJourneyDetails({ pickupLocation });
  }, [setJourneyDetails]);

  const setDestination = useCallback((destination: string) => {
    setJourneyDetails({ destination });
  }, [setJourneyDetails]);

  const setJourneyDate = useCallback((journeyDate: string) => {
    setJourneyDetails({ journeyDate });
  }, [setJourneyDetails]);

  const setJourneyTime = useCallback((journeyTime: string) => {
    setJourneyDetails({ journeyTime });
  }, [setJourneyDetails]);

  const setVehicleSelection = useCallback((vehicleSize: string | null, passengerCount?: number) => {
    setJourneyDetails({
      vehicleSize,
      ...(typeof passengerCount === "number" ? { passengerCount } : {}),
    });
  }, [setJourneyDetails]);

  const clearBooking = useCallback(() => {
    setServiceId(null);
    setDetails({
      pickupLocation: "",
      destination: "",
      journeyDate: "",
      journeyTime: "",
      passengerCount: 3,
      vehicleSize: "seven-seater",
      availabilityResult: null,
    });
    try {
      sessionStorage.removeItem(SERVICE_STORAGE_KEY);
      sessionStorage.removeItem(DETAILS_STORAGE_KEY);
    } catch {
      /* ignore error */
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        selectedService: findService(serviceId),
        selectService,
        clearBooking,
        pickupLocation: details.pickupLocation,
        destination: details.destination,
        journeyDate: details.journeyDate,
        journeyTime: details.journeyTime,
        passengerCount: details.passengerCount ?? 3,
        vehicleSize: details.vehicleSize ?? "seven-seater",
        availabilityResult: details.availabilityResult ?? null,
        setPickupLocation,
        setDestination,
        setJourneyDate,
        setJourneyTime,
        setJourneyDetails,
        setVehicleSelection,
        setAvailabilityResult,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
