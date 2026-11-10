// =============================================================
// locations.ts — Approved Figma Reference Locations (Manchester & UK)
// Exactly matches:
// - Screen 2 — Pickup Location Search.png
// - Screen 3 — Destination Search.png
// - Screen 4 — Set Location on Map.png
// =============================================================

export interface MockLocation {
  id: string;
  name: string;
  address: string;
  postcode: string;
  category: "station" | "airport" | "hotel" | "district" | "stadium" | "landmark";
  note?: string;
  isRecent?: boolean;
}

export const PICKUP_SUGGESTIONS: MockLocation[] = [
  {
    id: "man-piccadilly",
    name: "Manchester Piccadilly Station",
    address: "Station Car Park Pick-up Zone, M1 2PB",
    postcode: "M1 2PB",
    category: "station",
    note: "Driver will meet passenger at Station Car Park Pick-up Zone",
    isRecent: true,
  },
  {
    id: "man-t2-dep",
    name: "Manchester Airport Terminal 2",
    address: "Departures Upper Forecourt, M90 4FF",
    postcode: "M90 4FF",
    category: "airport",
    note: "Curbside collection directly outside departures forecourt",
  },
  {
    id: "lowry-hotel",
    name: "The Lowry Hotel",
    address: "50 Dearmans Place, Salford, Manchester M3 5LH",
    postcode: "M3 5LH",
    category: "hotel",
    note: "Hotel concierge pick-up entrance",
  },
  {
    id: "spinningfields",
    name: "Spinningfields Financial District",
    address: "Hardman Blvd, Manchester M3 3AQ",
    postcode: "M3 3AQ",
    category: "district",
    note: "Designated taxi and private hire bay on Hardman Square",
  },
  {
    id: "mediacity",
    name: "MediaCityUK",
    address: "Salford Quays, Manchester M50 2EQ",
    postcode: "M50 2EQ",
    category: "landmark",
    note: "Piazza drop-off point near BBC studios",
  },
];

export const DESTINATION_SUGGESTIONS: MockLocation[] = [
  {
    id: "man-t2-arr",
    name: "Manchester Airport Terminal 2",
    address: "Ringway, Manchester, M90 4FF",
    postcode: "M90 4FF",
    category: "airport",
    note: "Drop-off located directly outside Departures Upper Forecourt",
    isRecent: true,
  },
  {
    id: "man-t1",
    name: "Manchester Airport Terminal 1",
    address: "Manchester Airport, M90 3PY",
    postcode: "M90 3PY",
    category: "airport",
    note: "Terminal 1 Departures drop-off rank",
  },
  {
    id: "lowry-hotel-dest",
    name: "The Lowry Hotel",
    address: "50 Dearmans Place, Salford, Manchester M3 5LH",
    postcode: "M3 5LH",
    category: "hotel",
    note: "Main entrance forecourt drop-off",
  },
  {
    id: "etihad-stadium",
    name: "Etihad Stadium",
    address: "Ashton New Road, Manchester M11 3FF",
    postcode: "M11 3FF",
    category: "stadium",
    note: "Blue Car Park designated passenger set-down",
  },
  {
    id: "man-piccadilly-dest",
    name: "Manchester Piccadilly Station",
    address: "Station Car Park Pick-up Zone, Manchester M1 2PB",
    postcode: "M1 2PB",
    category: "station",
    note: "Station forecourt drop-off",
  },
];

export function searchLocations(query: string, mode: "pickup" | "destination" = "pickup"): MockLocation[] {
  const baseList = mode === "pickup" ? PICKUP_SUGGESTIONS : DESTINATION_SUGGESTIONS;
  const q = (query || "").trim().toLowerCase();
  if (!q) return baseList;
  return baseList.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.postcode.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q)
  );
}
