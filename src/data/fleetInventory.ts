// =============================================================
// fleetInventory.ts — Simulated Fleet Inventory & Mock Bookings
// Part of SCRUM-18: Deterministic Simulated Fleet Inventory
//
// PROTOTYPE SIMULATION ASSUMPTIONS:
// 1. Fictional fleet inventory:
//    - 10 Standard Cars (STD-001 to STD-010), capacity 4 passengers.
//    - 5 Seven-Seaters (MPV-001 to MPV-005), capacity 6 passengers.
// 2. Default journey service duration: 60 minutes for MVP simulation.
// 3. Fictional bookings model schedule commitments across local timestamps.
// 4. This dataset is strictly for prototype demonstration and testing.
//    It does not represent real fleet or telematics data.
// =============================================================

export type VehicleCategory = "standard" | "seven-seater";

export interface SimulatedVehicle {
  id: string;
  category: VehicleCategory;
  name: string;
  maxPassengers: number;
}

export interface SimulatedBooking {
  bookingId: string;
  vehicleId: string;
  start: string; // ISO 8601 local datetime "YYYY-MM-DDTHH:mm:ss"
  end: string;   // ISO 8601 local datetime "YYYY-MM-DDTHH:mm:ss"
  note: string;
}

export const FLEET_INVENTORY: SimulatedVehicle[] = [
  // 10 Standard Cars (Capacity: 4)
  { id: "STD-001", category: "standard", name: "Executive Saloon 1", maxPassengers: 4 },
  { id: "STD-002", category: "standard", name: "Executive Saloon 2", maxPassengers: 4 },
  { id: "STD-003", category: "standard", name: "Executive Saloon 3", maxPassengers: 4 },
  { id: "STD-004", category: "standard", name: "Executive Saloon 4", maxPassengers: 4 },
  { id: "STD-005", category: "standard", name: "Executive Saloon 5", maxPassengers: 4 },
  { id: "STD-006", category: "standard", name: "Executive Saloon 6", maxPassengers: 4 },
  { id: "STD-007", category: "standard", name: "Executive Saloon 7", maxPassengers: 4 },
  { id: "STD-008", category: "standard", name: "Executive Saloon 8", maxPassengers: 4 },
  { id: "STD-009", category: "standard", name: "Executive Saloon 9", maxPassengers: 4 },
  { id: "STD-010", category: "standard", name: "Executive Saloon 10", maxPassengers: 4 },

  // 5 Seven-Seaters (Capacity: 6)
  { id: "MPV-001", category: "seven-seater", name: "Executive MPV 1", maxPassengers: 6 },
  { id: "MPV-002", category: "seven-seater", name: "Executive MPV 2", maxPassengers: 6 },
  { id: "MPV-003", category: "seven-seater", name: "Executive MPV 3", maxPassengers: 6 },
  { id: "MPV-004", category: "seven-seater", name: "Executive MPV 4", maxPassengers: 6 },
  { id: "MPV-005", category: "seven-seater", name: "Executive MPV 5", maxPassengers: 6 },
];

/**
 * Deterministic Mock Bookings:
 * - Scenario A: 2026-11-25 14:30 (Seven-Seater) -> 0 MPVs booked during 14:30-15:30 -> AVAILABLE
 * - Scenario B: 2026-11-25 18:00 (Seven-Seater) -> All 5 MPVs (MPV-001..005) booked -> UNAVAILABLE
 * - Scenario C: 2026-11-25 18:00 (Standard Car)  -> 4 of 10 STDs booked, 6 free -> AVAILABLE
 */
export const SIMULATED_BOOKINGS: SimulatedBooking[] = [
  // --- 2026-11-25 Peak Hour (18:00 - 19:00): All 5 Seven-Seaters committed (Scenario B) ---
  {
    bookingId: "BK-20261125-01",
    vehicleId: "MPV-001",
    start: "2026-11-25T17:30:00",
    end: "2026-11-25T18:30:00",
    note: "Airport Transfer to Manchester Airport Terminal 1",
  },
  {
    bookingId: "BK-20261125-02",
    vehicleId: "MPV-002",
    start: "2026-11-25T17:45:00",
    end: "2026-11-25T18:45:00",
    note: "Corporate Event Transport - Manchester Central",
  },
  {
    bookingId: "BK-20261125-03",
    vehicleId: "MPV-003",
    start: "2026-11-25T18:00:00",
    end: "2026-11-25T19:00:00",
    note: "Hotel Chauffeur - The Lowry Hotel to Etihad Stadium",
  },
  {
    bookingId: "BK-20261125-04",
    vehicleId: "MPV-004",
    start: "2026-11-25T18:15:00",
    end: "2026-11-25T19:15:00",
    note: "VIP Delegation - Piccadilly to MediaCityUK",
  },
  {
    bookingId: "BK-20261125-05",
    vehicleId: "MPV-005",
    start: "2026-11-25T17:00:00",
    end: "2026-11-25T18:15:00",
    note: "Inter-city Return - Liverpool Lime St to Manchester",
  },

  // --- 2026-11-25 Peak Hour (18:00 - 19:00): Only 4 of 10 Standard Cars booked (Scenario C) ---
  {
    bookingId: "BK-20261125-06",
    vehicleId: "STD-001",
    start: "2026-11-25T17:30:00",
    end: "2026-11-25T18:30:00",
    note: "Local Urban Ride - Spinningfields",
  },
  {
    bookingId: "BK-20261125-07",
    vehicleId: "STD-002",
    start: "2026-11-25T17:45:00",
    end: "2026-11-25T18:45:00",
    note: "Hotel Transfer - King Street Townhouse",
  },
  {
    bookingId: "BK-20261125-08",
    vehicleId: "STD-003",
    start: "2026-11-25T18:00:00",
    end: "2026-11-25T19:00:00",
    note: "Curbside Airport Transfer",
  },
  {
    bookingId: "BK-20261125-09",
    vehicleId: "STD-004",
    start: "2026-11-25T18:15:00",
    end: "2026-11-25T19:15:00",
    note: "Corporate Meeting Transfer",
  },
  // STD-005 through STD-010 remain 100% free at 18:00!

  // --- 2026-11-25 Non-overlapping bookings around 14:30 (Scenario A) ---
  {
    bookingId: "BK-20261125-10",
    vehicleId: "MPV-001",
    start: "2026-11-25T12:00:00",
    end: "2026-11-25T13:30:00",
    note: "Early afternoon transfer (completes before 14:30)",
  },
  {
    bookingId: "BK-20261125-11",
    vehicleId: "MPV-002",
    start: "2026-11-25T16:00:00",
    end: "2026-11-25T17:00:00",
    note: "Late afternoon transfer (starts after 15:30)",
  },

  // --- Midnight boundary test booking ---
  {
    bookingId: "BK-20261125-12",
    vehicleId: "STD-001",
    start: "2026-11-25T23:30:00",
    end: "2026-11-26T00:30:00",
    note: "Late night boundary transfer crossing midnight",
  },
];
