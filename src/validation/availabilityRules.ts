// =============================================================
// availabilityRules.ts — Simulated Fleet Inventory & Availability Logic
// Part of SCRUM-18: Deterministic Simulated Fleet Inventory
//
// Replaces hardcoded time-based rules with interval overlap calculations
// against simulated fleet inventory and booking schedules.
//
// PROTOTYPE SIMULATION ASSUMPTIONS:
// 1. Inventory counts:
//    - 10 Standard Cars (STD-001 to STD-010), max capacity 4 passengers.
//    - 5 Seven-Seaters (MPV-001 to MPV-005), max capacity 6 passengers.
// 2. Fixed service duration: 60 minutes for MVP simulation.
// 3. Overlap rule: Vehicle is busy if [reqStart, reqEnd) overlaps any [bStart, bEnd).
//    reqStart < bEnd && reqEnd > bStart.
// 4. Scenarios:
//    - Scenario A: 2026-11-25 14:30 Seven-Seater -> AVAILABLE
//    - Scenario B: 2026-11-25 18:00 Seven-Seater -> UNAVAILABLE (All 5 MPVs booked)
//    - Scenario C: 2026-11-25 18:00 Standard Car  -> AVAILABLE (4 of 10 STDs booked, 6 free)
// =============================================================
import {
  FLEET_INVENTORY,
  SIMULATED_BOOKINGS,
  type SimulatedBooking,
  type SimulatedVehicle,
  type VehicleCategory,
} from "../data/fleetInventory.ts";

export const SERVICE_DURATION_MINUTES = 60;

export interface AvailabilityRuleParams {
  journeyDate: string;
  journeyTime: string;
  vehicleSize: string;
  passengerCount: number;
}

export type AvailabilityReasonCode =
  | "FLEET_AVAILABLE"
  | "FLEET_FULLY_BOOKED"
  | "EXCEEDS_CAPACITY"
  | "INVALID_INPUT";

export interface AvailabilityCalculationResult {
  status: "available" | "unavailable";
  vehicleCategory: VehicleCategory;
  eligibleVehicleCount: number;
  availableVehicleCount: number;
  conflictingBookingsCount: number;
  reasonCode: AvailabilityReasonCode;
  serviceDurationMinutes: number;
  requestedStart: string;
  requestedEnd: string;
}

/**
 * Standard open-upper-bound interval overlap check:
 * Returns true if [startA, endA) overlaps [startB, endB).
 */
export function isIntervalOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Parses journeyDate (YYYY-MM-DD) and journeyTime (HH:mm) into a local Date object.
 */
export function parseJourneyDateTime(journeyDate: string, journeyTime: string): Date | null {
  if (!journeyDate || !journeyTime) return null;

  const [yearStr, monthStr, dayStr] = journeyDate.split("-");
  const [hourStr, minStr] = journeyTime.split(":");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(min)
  ) {
    return null;
  }

  return new Date(year, month, day, hour, min, 0, 0);
}

/**
 * Calculates availability against the simulated fleet inventory and booking schedule.
 */
export function calculateFleetAvailability(
  journeyDate: string,
  journeyTime: string,
  vehicleSize: string = "seven-seater",
  passengerCount?: number
): AvailabilityCalculationResult {
  const category: VehicleCategory =
    vehicleSize === "standard" ? "standard" : "seven-seater";

  const reqStart = parseJourneyDateTime(journeyDate, journeyTime);
  if (!reqStart) {
    return {
      status: "unavailable",
      vehicleCategory: category,
      eligibleVehicleCount: 0,
      availableVehicleCount: 0,
      conflictingBookingsCount: 0,
      reasonCode: "INVALID_INPUT",
      serviceDurationMinutes: SERVICE_DURATION_MINUTES,
      requestedStart: "",
      requestedEnd: "",
    };
  }

  const reqEnd = new Date(reqStart.getTime() + SERVICE_DURATION_MINUTES * 60 * 1000);

  // Eligible vehicles in requested category
  const eligibleVehicles = FLEET_INVENTORY.filter((v) => v.category === category);
  const eligibleCount = eligibleVehicles.length;

  let availableCount = 0;
  let conflictingCount = 0;

  for (const vehicle of eligibleVehicles) {
    // Find bookings assigned to this vehicle
    const vehicleBookings = SIMULATED_BOOKINGS.filter((b) => b.vehicleId === vehicle.id);

    const hasConflict = vehicleBookings.some((booking) => {
      const bStart = new Date(booking.start);
      const bEnd = new Date(booking.end);
      return isIntervalOverlapping(reqStart, reqEnd, bStart, bEnd);
    });

    if (hasConflict) {
      conflictingCount++;
    } else {
      availableCount++;
    }
  }

  const isAvailable = availableCount > 0;

  return {
    status: isAvailable ? "available" : "unavailable",
    vehicleCategory: category,
    eligibleVehicleCount: eligibleCount,
    availableVehicleCount: availableCount,
    conflictingBookingsCount: conflictingCount,
    reasonCode: isAvailable ? "FLEET_AVAILABLE" : "FLEET_FULLY_BOOKED",
    serviceDurationMinutes: SERVICE_DURATION_MINUTES,
    requestedStart: reqStart.toISOString(),
    requestedEnd: reqEnd.toISOString(),
  };
}

/**
 * Backward-compatible helper returning "available" | "unavailable".
 */
export function determineAvailability(
  journeyDate: string,
  journeyTime: string,
  vehicleSize: string = "seven-seater",
  passengerCount: number = 1
): "available" | "unavailable" {
  return calculateFleetAvailability(journeyDate, journeyTime, vehicleSize, passengerCount).status;
}

/**
 * Passenger capacity limits:
 * - Standard Car: max 4 passengers
 * - Seven-Seater: max 6 passengers
 */
export function validateCapacityForFleet(vehicleSize: string, passengerCount: number): boolean {
  if (vehicleSize === "standard") {
    return passengerCount <= 4 && passengerCount >= 1;
  }
  if (vehicleSize === "seven-seater") {
    return passengerCount <= 6 && passengerCount >= 1;
  }
  return false;
}
