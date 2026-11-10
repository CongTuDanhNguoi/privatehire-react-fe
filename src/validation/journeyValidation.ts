// =============================================================
// journeyValidation.ts — Validation rules for SCRUM-16 Journey Details
// Validates pickup, destination, future date, and future time against
// actual runtime local date/time.
// =============================================================

export interface JourneyFormData {
  pickupLocation: string;
  destination: string;
  journeyDate: string; // YYYY-MM-DD or DD/MM/YYYY
  journeyTime: string; // HH:mm
}

export type JourneyField = keyof JourneyFormData;

export type JourneyErrors = Partial<Record<JourneyField, string>>;

/**
 * Normalizes input date string into YYYY-MM-DD format.
 * Handles both "YYYY-MM-DD" and "DD/MM/YYYY".
 */
export function normalizeDateToIso(dateStr?: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    // If entered as DD/MM/YYYY
    const [d, m, y] = parts;
    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return trimmed;
}

/**
 * Returns formatted Day of the Week (e.g. "Wednesday") for a given date string.
 */
export function getDayOfWeek(dateStr?: string): string {
  if (!dateStr) return "";
  const iso = normalizeDateToIso(dateStr);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

/**
 * Formats YYYY-MM-DD into DD/MM/YYYY for UI display if needed.
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "";
  const iso = normalizeDateToIso(dateStr);
  const parts = iso.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Returns local YYYY-MM-DD string for today.
 */
export function getTodayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns local HH:mm string.
 */
export function getCurrentTimeHHmm(now: Date = new Date()): string {
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function validatePickupLocation(value?: string): string {
  const val = (value ?? "").trim();
  if (!val) return "Pickup location is required.";
  if (val.length < 3) return "Please enter a valid pickup address.";
  return "";
}

export function validateDestination(value?: string, pickupValue?: string): string {
  const val = (value ?? "").trim();
  if (!val) return "Destination is required.";
  if (val.length < 3) return "Please enter a valid destination address.";
  if (pickupValue && val.toLowerCase() === pickupValue.trim().toLowerCase()) {
    return "Destination must be different from pickup location.";
  }
  return "";
}

export function validateJourneyDate(dateStr?: string, now: Date = new Date()): string {
  const val = (dateStr ?? "").trim();
  if (!val) return "Journey date is required.";

  const iso = normalizeDateToIso(val);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "Please enter a valid date.";

  const inputDate = new Date(y, m - 1, d);
  if (Number.isNaN(inputDate.getTime())) return "Please enter a valid date.";

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (inputDate < todayMidnight) {
    return "Journey date cannot be in the past.";
  }

  return "";
}

export function validateJourneyTime(timeStr?: string, dateStr?: string, now: Date = new Date()): string {
  const val = (timeStr ?? "").trim();
  if (!val) return "Journey time is required.";

  const match = val.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "Please enter a valid time (HH:mm).";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "Please enter a valid time (HH:mm).";
  }

  // If date is today, time must be in the future
  if (dateStr) {
    const iso = normalizeDateToIso(dateStr);
    const todayIso = getTodayIso(now);
    if (iso === todayIso) {
      const inputMinutes = hours * 60 + minutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (inputMinutes <= currentMinutes) {
        return "Selected time has already passed for today.";
      }
    }
  }

  return "";
}

export function validateJourneyForm(form: JourneyFormData, now: Date = new Date()): JourneyErrors {
  const errors: JourneyErrors = {};

  const pickupErr = validatePickupLocation(form.pickupLocation);
  if (pickupErr) errors.pickupLocation = pickupErr;

  const destErr = validateDestination(form.destination, form.pickupLocation);
  if (destErr) errors.destination = destErr;

  const dateErr = validateJourneyDate(form.journeyDate, now);
  if (dateErr) errors.journeyDate = dateErr;

  const timeErr = validateJourneyTime(form.journeyTime, form.journeyDate, now);
  if (timeErr) errors.journeyTime = timeErr;

  return errors;
}
