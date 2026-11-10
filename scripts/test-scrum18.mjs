// =============================================================
// test-scrum18.mjs — Comprehensive Verification Suite for SCRUM-18
// Deterministic Simulated Fleet Inventory & Availability Calculation
//
// Tests:
// 1. Fleet Inventory Data Model & Assumptions
// 2. Scenario A: 25/11/2026 14:30 Seven-Seater -> AVAILABLE
// 3. Scenario B: 25/11/2026 18:00 Seven-Seater -> UNAVAILABLE (All 5 MPVs booked)
// 4. Scenario C: 25/11/2026 18:00 Standard Car -> AVAILABLE (4 of 10 STDs booked, 6 free)
// 5. Booking Overlap Logic (intervals, boundaries, midnight)
// 6. Non-overlapping bookings (before/after interval)
// 7. Different dates at same clock time (25th vs 26th at 18:00)
// 8. Passenger capacity rules (Standard max 4, Seven-Seater max 6)
// 9. Deterministic Repeated Checks (idempotency)
// 10. Playwright Browser Automation for all 3 UI states and customer flows
// =============================================================
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

// Dynamic import of availability logic & dataset
const {
  determineAvailability,
  calculateFleetAvailability,
  isIntervalOverlapping,
  validateCapacityForFleet,
  SERVICE_DURATION_MINUTES,
} = await import("../src/validation/availabilityRules.ts");

const {
  FLEET_INVENTORY,
  SIMULATED_BOOKINGS,
} = await import("../src/data/fleetInventory.ts");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("test-output-scrum18");

fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name, fn) {
  try {
    await fn();
    passedCount++;
    console.log(`[PASS] ${name}`);
    results.push({ name, status: "PASS" });
  } catch (err) {
    failedCount++;
    console.error(`[FAIL] ${name} -> ${err.message}`);
    results.push({ name, status: "FAIL", error: err.message });
  }
}

console.log("=== STEP 1: SIMULATED FLEET INVENTORY & BUSINESS LOGIC (SCRUM-18) ===");

// 1. Inventory counts & categories
await test("Inventory: 10 Standard Cars and 5 Seven-Seaters in fleet dataset", () => {
  const standards = FLEET_INVENTORY.filter((v) => v.category === "standard");
  const sevenSeaters = FLEET_INVENTORY.filter((v) => v.category === "seven-seater");

  assert(standards.length === 10, `Expected 10 Standard Cars, got ${standards.length}`);
  assert(sevenSeaters.length === 5, `Expected 5 Seven-Seaters, got ${sevenSeaters.length}`);
  assert(FLEET_INVENTORY.length === 15, `Expected 15 total vehicles, got ${FLEET_INVENTORY.length}`);
});

// 2. Scenario A
await test("Scenario A: 25/11/2026 at 14:30 Seven-Seater -> AVAILABLE", () => {
  const result = calculateFleetAvailability("2026-11-25", "14:30", "seven-seater", 5);
  assert(result.status === "available", `Expected available, got ${result.status}`);
  assert(result.eligibleVehicleCount === 5, `Expected 5 eligible vehicles, got ${result.eligibleVehicleCount}`);
  assert(result.availableVehicleCount === 5, `Expected 5 available vehicles, got ${result.availableVehicleCount}`);
  assert(result.reasonCode === "FLEET_AVAILABLE", `Expected FLEET_AVAILABLE, got ${result.reasonCode}`);
});

// 3. Scenario B
await test("Scenario B: 25/11/2026 at 18:00 Seven-Seater -> UNAVAILABLE (All 5 MPVs fully booked)", () => {
  const result = calculateFleetAvailability("2026-11-25", "18:00", "seven-seater", 5);
  assert(result.status === "unavailable", `Expected unavailable, got ${result.status}`);
  assert(result.eligibleVehicleCount === 5, `Expected 5 eligible vehicles, got ${result.eligibleVehicleCount}`);
  assert(result.availableVehicleCount === 0, `Expected 0 available vehicles, got ${result.availableVehicleCount}`);
  assert(result.conflictingBookingsCount === 5, `Expected 5 conflicting bookings, got ${result.conflictingBookingsCount}`);
  assert(result.reasonCode === "FLEET_FULLY_BOOKED", `Expected FLEET_FULLY_BOOKED, got ${result.reasonCode}`);
});

// 4. Scenario C
await test("Scenario C: 25/11/2026 at 18:00 Standard Car -> AVAILABLE (Different category at same clock time)", () => {
  const result = calculateFleetAvailability("2026-11-25", "18:00", "standard", 2);
  assert(result.status === "available", `Expected available, got ${result.status}`);
  assert(result.eligibleVehicleCount === 10, `Expected 10 eligible vehicles, got ${result.eligibleVehicleCount}`);
  assert(result.availableVehicleCount === 6, `Expected 6 available vehicles (4 booked), got ${result.availableVehicleCount}`);
  assert(result.conflictingBookingsCount === 4, `Expected 4 conflicting bookings, got ${result.conflictingBookingsCount}`);
  assert(result.reasonCode === "FLEET_AVAILABLE", `Expected FLEET_AVAILABLE, got ${result.reasonCode}`);
});

// 5. Booking interval overlap verification
await test("Overlap Logic: Interval intersection math [reqStart, reqEnd) vs [bStart, bEnd)", () => {
  const rStart = new Date("2026-11-25T18:00:00");
  const rEnd = new Date("2026-11-25T19:00:00");

  // Case 1: Booking starts before, ends during [17:30 - 18:30) -> OVERLAPS
  assert(
    isIntervalOverlapping(rStart, rEnd, new Date("2026-11-25T17:30:00"), new Date("2026-11-25T18:30:00")),
    "Should overlap when booking ends inside service window"
  );

  // Case 2: Booking starts during, ends after [18:30 - 19:30) -> OVERLAPS
  assert(
    isIntervalOverlapping(rStart, rEnd, new Date("2026-11-25T18:30:00"), new Date("2026-11-25T19:30:00")),
    "Should overlap when booking starts inside service window"
  );

  // Case 3: Booking completely encloses service window [17:00 - 20:00) -> OVERLAPS
  assert(
    isIntervalOverlapping(rStart, rEnd, new Date("2026-11-25T17:00:00"), new Date("2026-11-25T20:00:00")),
    "Should overlap when booking completely encloses service window"
  );

  // Case 4: Non-overlapping: Booking ends exactly at service start [17:00 - 18:00) -> NO OVERLAP
  assert(
    !isIntervalOverlapping(rStart, rEnd, new Date("2026-11-25T17:00:00"), new Date("2026-11-25T18:00:00")),
    "Should NOT overlap when adjacent at start boundary"
  );

  // Case 5: Non-overlapping: Booking starts exactly at service end [19:00 - 20:00) -> NO OVERLAP
  assert(
    !isIntervalOverlapping(rStart, rEnd, new Date("2026-11-25T19:00:00"), new Date("2026-11-25T20:00:00")),
    "Should NOT overlap when adjacent at end boundary"
  );
});

// 6. Midnight boundary calculation
await test("Midnight Boundary: Journey crossing 00:00 is calculated deterministically", () => {
  // Booking exists for STD-001 at 23:30 to 00:30
  // Standard car request at 23:45 (23:45 to 00:45)
  const result = calculateFleetAvailability("2026-11-25", "23:45", "standard", 2);
  // STD-001 is booked, but STD-002..010 (9 cars) are free -> status is available
  assert(result.status === "available", "Should be available since 9 other standard cars are free");
  assert(result.conflictingBookingsCount === 1, "Expected 1 conflicting booking on STD-001");
});

// 7. Different dates at the same clock time
await test("Date Dependency: 26/11/2026 at 18:00 is AVAILABLE (booking schedule is date-specific)", () => {
  const result25 = calculateFleetAvailability("2026-11-25", "18:00", "seven-seater");
  const result26 = calculateFleetAvailability("2026-11-26", "18:00", "seven-seater");

  assert(result25.status === "unavailable", "25th 18:00 must be unavailable");
  assert(result26.status === "available", "26th 18:00 must be available (no bookings on 26th)");
});

// 8. Passenger capacity limits
await test("Passenger Capacity: Standard max 4, Seven-Seater max 6", () => {
  assert(validateCapacityForFleet("standard", 1), "Standard 1 pass valid");
  assert(validateCapacityForFleet("standard", 4), "Standard 4 pass valid");
  assert(!validateCapacityForFleet("standard", 5), "Standard 5 pass invalid");

  assert(validateCapacityForFleet("seven-seater", 1), "Seven-Seater 1 pass valid");
  assert(validateCapacityForFleet("seven-seater", 6), "Seven-Seater 6 pass valid");
  assert(!validateCapacityForFleet("seven-seater", 7), "Seven-Seater 7 pass invalid");
});

// 9. Deterministic Repeated Checks (Idempotency)
await test("Idempotency: Repeated calculations yield identical deterministic results", () => {
  for (let i = 0; i < 5; i++) {
    const resA = determineAvailability("2026-11-25", "14:30", "seven-seater");
    const resB = determineAvailability("2026-11-25", "18:00", "seven-seater");
    const resC = determineAvailability("2026-11-25", "18:00", "standard");

    assert(resA === "available", "Repeated check Scenario A failed");
    assert(resB === "unavailable", "Repeated check Scenario B failed");
    assert(resC === "available", "Repeated check Scenario C failed");
  }
});

console.log("\n=== STEP 2: PLAYWRIGHT BROWSER AUTOMATION (SCRUM-18: T01 - T15) ===");

let browser;
try {
  browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
} catch (e) {
  console.log(`[BLOCKED] Playwright launch: ${e.message}`);
}

if (browser) {
  const context = await browser.newContext({
    viewport: { width: 400, height: 926 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const wait = (ms = 350) => page.waitForTimeout(ms);

  const snap = async (label) => {
    const file = path.join(OUT_DIR, `${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };

  // T01 — Protected availability route
  await test("T01 — Protected availability route redirects unauthenticated users to /login", async () => {
    await page.goto(`${BASE_URL}/availability`);
    await wait(300);
    assert(new URL(page.url()).pathname === "/login", `Expected /login, got ${page.url()}`);
  });

  // Authenticate
  await page.fill("#email", "alex.morgan@example.com");
  await page.fill("#password", "Password123");
  await page.click("button[type=submit]");
  await wait(400);

  // T02 — Invalid or missing booking state rejected
  await test("T02 — Direct navigation to /availability without journey/vehicle redirects", async () => {
    await page.goto(`${BASE_URL}/availability`);
    await wait(300);
    const currentPath = new URL(page.url()).pathname;
    assert(currentPath === "/services" || currentPath === "/journey", `Expected /services or /journey, got ${currentPath}`);
  });

  // Setup full booking context for Scenario A:
  // Date: 2026-11-25, Time: 14:30, Seven-Seater, 5 passengers
  await page.goto(`${BASE_URL}/services`);
  await wait(300);
  await page.click('[data-testid="service-airport-transfer"]');
  await wait(100);
  await page.click('[data-testid="continue"]');
  await wait(300);

  await page.fill("#pickupLocation", "Manchester Piccadilly Station, M1 2PB");
  await page.fill("#destination", "Manchester Airport Terminal 2, Ringway M90 4FP");
  await page.fill("#journeyDate", "2026-11-25");
  await page.fill("#journeyTime", "14:30");
  await wait(200);
  await page.click('[data-testid="continue-to-vehicle"]');
  await wait(300);

  // Set 5 passengers & Seven-Seater on /vehicle
  await page.click('[data-testid="increase-passengers"]'); // from 3 to 4
  await wait(100);
  await page.click('[data-testid="increase-passengers"]'); // from 4 to 5
  await wait(100);
  await page.click('[data-testid="vehicle-card-seven-seater"]');
  await wait(200);

  // T08 — Passenger capacity validated
  await test("T08 — Passenger capacity validated before checking availability", async () => {
    const isStandardDisabled = await page.isVisible('[data-testid="standard-insufficient-badge"]');
    assert(isStandardDisabled, "Standard car must show insufficient capacity for 5 passengers");
  });

  // Continue to /availability
  await page.click('[data-testid="check-availability-button"]');

  // T03 — Checking state displayed
  await test("T03 — Checking state displayed immediately upon arrival", async () => {
    await wait(100);
    assert(new URL(page.url()).pathname === "/availability", `Expected /availability, got ${page.url()}`);
    const checkingCard = await page.isVisible('[data-testid="checking-state-card"]');
    assert(checkingCard, "Checking card must be displayed during simulation");
    await snap("Screen-1-CheckingVehicleAvailability");
  });

  // T04 — Scenario A: Available result reached (14:30 daytime slot)
  await test("T04 — Scenario A: Available result reached after simulation resolves", async () => {
    await page.waitForSelector('[data-testid="available-state-card"]', { timeout: 3000 });
    const badgeText = await page.textContent('[data-testid="vehicle-available-badge"]');
    assert(badgeText.includes("VEHICLE AVAILABLE"), `Expected VEHICLE AVAILABLE badge, got '${badgeText}'`);
    await snap("Screen-2-VehicleAvailable");
  });

  // T13 — Journey Summary displays actual BookingContext values
  await test("T13 — Journey Summary displays actual BookingContext values", async () => {
    const pickupTitle = await page.textContent('[data-testid="summary-pickup-title"]');
    const destTitle = await page.textContent('[data-testid="summary-dest-title"]');
    const dateTimeVal = await page.textContent('[data-testid="summary-datetime-val"]');
    const passVal = await page.textContent('[data-testid="summary-passenger-val"]');
    const fleetVal = await page.textContent('[data-testid="summary-fleet-val"]');

    assert(pickupTitle.includes("Manchester Piccadilly"), `Pickup mismatch: '${pickupTitle}'`);
    assert(destTitle.includes("Manchester Airport"), `Dest mismatch: '${destTitle}'`);
    assert(dateTimeVal.includes("14:30"), `DateTime mismatch: '${dateTimeVal}'`);
    assert(passVal.includes("5 Passengers"), `Passengers mismatch: '${passVal}'`);
    assert(fleetVal.includes("Seven-Seater"), `Fleet mismatch: '${fleetVal}'`);
  });

  // T14 — No booking confirmation or payment
  await test("T14 — No booking confirmation or payment actions presented", async () => {
    const hasPayBtn = await page.isVisible('button:has-text("Pay")');
    const hasBookBtn = await page.isVisible('button:has-text("Book Now")');
    const hasConfirmBtn = await page.isVisible('button:has-text("Confirm Booking")');

    assert(!hasPayBtn && !hasBookBtn && !hasConfirmBtn, "Must not introduce payment or booking creation");
  });

  // T09 — Change Date or Time navigation
  await test("T09 — Change Date or Time returns to Journey Details preserving valid data", async () => {
    await page.click('[data-testid="change-datetime-btn"]');
    await wait(300);

    assert(new URL(page.url()).pathname === "/journey", `Expected /journey, got ${page.url()}`);
    const timeVal = await page.inputValue("#journeyTime");
    assert(timeVal === "14:30", `Time value should be preserved: got '${timeVal}'`);
  });

  // T11 & T12 — Recheck after changing booking details (Scenario B: 18:00 peak hour)
  await test("T11 & T12 — Scenario B: Recheck at peak hour 18:00 with Seven-Seater", async () => {
    await page.fill("#journeyTime", "18:00");
    await wait(100);

    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(300);

    await page.click('[data-testid="check-availability-button"]');
    await wait(100);

    assert(new URL(page.url()).pathname === "/availability", "Should be on /availability");
  });

  // T05 — Scenario B: Unavailable result reached for Seven-Seater at 18:00
  await test("T05 — Scenario B: Unavailable result reached because all Seven-Seaters are booked", async () => {
    await page.waitForSelector('[data-testid="unavailable-state-card"]', { timeout: 3000 });
    const badgeText = await page.textContent('[data-testid="vehicle-unavailable-badge"]');
    assert(badgeText.includes("VEHICLE UNAVAILABLE"), `Expected VEHICLE UNAVAILABLE badge, got '${badgeText}'`);

    const titleText = await page.textContent("h2");
    assert(titleText.includes("No Seven-Seater Available"), `Expected No Seven-Seater Available, got '${titleText}'`);

    await snap("Screen-1A-VehicleUnavailable");
  });

  // T10 — Change Vehicle Size navigation & Scenario C verification
  await test("T10 — Change Vehicle Size to Standard Car at 18:00 resolves to AVAILABLE (Scenario C)", async () => {
    await page.click('[data-testid="change-vehicle-btn"]');
    await wait(300);

    assert(new URL(page.url()).pathname === "/vehicle", `Expected /vehicle, got ${page.url()}`);

    // Reduce passengers to 2 so Standard Car is enabled
    await page.click('[data-testid="decrease-passengers"]'); // to 4
    await wait(50);
    await page.click('[data-testid="decrease-passengers"]'); // to 3
    await wait(50);
    await page.click('[data-testid="decrease-passengers"]'); // to 2
    await wait(50);

    // Select Standard Car (Scenario C: 18:00 Standard Car has free inventory!)
    await page.click('[data-testid="vehicle-card-standard"]');
    await wait(100);

    await page.click('[data-testid="check-availability-button"]');
    await wait(100);

    // Should resolve to AVAILABLE because 6 of 10 Standard Cars are free!
    await page.waitForSelector('[data-testid="available-state-card"]', { timeout: 3000 });
    const badgeText = await page.textContent('[data-testid="vehicle-available-badge"]');
    assert(badgeText.includes("VEHICLE AVAILABLE"), `Expected VEHICLE AVAILABLE, got '${badgeText}'`);

    const fleetVal = await page.textContent('[data-testid="summary-fleet-val"]');
    assert(fleetVal.includes("Standard Car"), `Expected Standard Car, got '${fleetVal}'`);
    await snap("Screen-2-StandardCar-Available-1800");
  });

  // T15 — Full journey flow from authenticated Home to availability result
  await test("T15 — Full end-to-end journey flow from Home to Availability", async () => {
    await page.goto(`${BASE_URL}/home`);
    await wait(300);

    // Home -> Services
    await page.click('[data-node-id="6:1101"]');
    await wait(200);

    // Services -> Journey
    await page.click('[data-testid="service-daily-hire"]');
    await wait(100);
    await page.click('[data-testid="continue"]');
    await wait(200);

    // Fill Journey Details
    await page.fill("#pickupLocation", "MediaCityUK, Salford M50 2EQ");
    await page.fill("#destination", "Etihad Stadium, Manchester M11 3FF");
    await page.fill("#journeyDate", "2026-11-28");
    await page.fill("#journeyTime", "11:00");
    await wait(100);
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);

    // Vehicle -> 2 Passengers, Standard Car
    await page.click('[data-testid="decrease-passengers"]'); // from 3 to 2
    await wait(100);
    await page.click('[data-testid="vehicle-card-standard"]');
    await wait(100);
    await page.click('[data-testid="check-availability-button"]');
    await wait(100);

    // Resolves to AVAILABLE
    await page.waitForSelector('[data-testid="available-state-card"]', { timeout: 3000 });
    const fleetVal = await page.textContent('[data-testid="summary-fleet-val"]');
    assert(fleetVal.includes("Standard Car"), `Expected Standard Car, got '${fleetVal}'`);
  });

  await browser.close();
}

console.log("\n========================================================");
console.log(`TOTAL SCRUM-18 TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("========================================================");

fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify({ total: passedCount + failedCount, passed: passedCount, failed: failedCount, results }, null, 2)
);

if (failedCount > 0) {
  process.exit(1);
}
