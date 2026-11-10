// =============================================================
// test-scrum16.mjs — Focused Automated & Runtime Testing for SCRUM-16
// Tests:
// 1. Unit validation tests for journeyValidation.ts
// 2. Playwright browser automation against Vite dev server
// 3. Visual fidelity snapshot collection for all 4 Figma views
// =============================================================
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

// Dynamic import of journey validation rules
const {
  validateJourneyForm,
  validatePickupLocation,
  validateDestination,
  validateJourneyDate,
  validateJourneyTime,
  getDayOfWeek,
  getTodayIso,
} = await import("../src/validation/journeyValidation.ts");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("test-output-scrum16");

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

console.log("=== STEP 1: UNIT VALIDATION TESTS (SCRUM-16) ===");

await test("Validation: Missing pickup location rejected", () => {
  const err = validatePickupLocation("");
  assert(err === "Pickup location is required.", `Expected required error, got '${err}'`);
});

await test("Validation: Missing destination rejected", () => {
  const err = validateDestination("");
  assert(err === "Destination is required.", `Expected required error, got '${err}'`);
});

await test("Validation: Identical pickup and destination rejected", () => {
  const err = validateDestination("Manchester Piccadilly", "Manchester Piccadilly");
  assert(err === "Destination must be different from pickup location.", `Got '${err}'`);
});

await test("Validation: Past date rejected", () => {
  const fixedNow = new Date(2026, 10, 10, 12, 0); // 10 Nov 2026
  const err = validateJourneyDate("2026-11-09", fixedNow);
  assert(err === "Journey date cannot be in the past.", `Expected past date error, got '${err}'`);
});

await test("Validation: Future date accepted", () => {
  const fixedNow = new Date(2026, 10, 10, 12, 0);
  const err = validateJourneyDate("2026-11-15", fixedNow);
  assert(err === "", `Expected valid, got '${err}'`);
});

await test("Validation: Today with past time rejected", () => {
  const fixedNow = new Date(2026, 10, 10, 14, 30); // 14:30
  const err = validateJourneyTime("14:00", "2026-11-10", fixedNow);
  assert(err === "Selected time has already passed for today.", `Expected past time error, got '${err}'`);
});

await test("Validation: Today with future time accepted", () => {
  const fixedNow = new Date(2026, 10, 10, 14, 30);
  const err = validateJourneyTime("16:00", "2026-11-10", fixedNow);
  assert(err === "", `Expected valid time, got '${err}'`);
});

await test("Validation: getDayOfWeek correctly formats day", () => {
  const day = getDayOfWeek("2026-11-11"); // Wednesday
  assert(day === "Wednesday", `Expected Wednesday, got '${day}'`);
});

await test("Validation: Full form validation with missing fields", () => {
  const errors = validateJourneyForm({
    pickupLocation: "",
    destination: "",
    journeyDate: "",
    journeyTime: "",
  });
  assert(Boolean(errors.pickupLocation), "Missing pickup error");
  assert(Boolean(errors.destination), "Missing destination error");
  assert(Boolean(errors.journeyDate), "Missing date error");
  assert(Boolean(errors.journeyTime), "Missing time error");
});

console.log("\n=== STEP 2: BROWSER AUTOMATION RUNTIME CHECKS (SCRUM-16) ===");

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
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const wait = (ms = 350) => page.waitForTimeout(ms);

  const snap = async (label) => {
    const file = path.join(OUT_DIR, `${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };

  // Helper: Login and go to Service Selection
  await test("Browser: Authenticate & navigate to /services", async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill("#email", "alex.morgan@example.com");
    await page.fill("#password", "Password123");
    await page.click("button[type=submit]");
    await wait(400);
    assert(new URL(page.url()).pathname === "/home", `Expected /home, got ${page.url()}`);

    await page.click('[data-node-id="6:1101"]'); // Book a Ride
    await wait(300);
    assert(new URL(page.url()).pathname === "/services", `Expected /services, got ${page.url()}`);
  });

  await test("Browser: Select Service and enter /journey (Screen 1 Initial)", async () => {
    await page.click('[data-testid="service-airport-transfer"]');
    await wait(100);
    await page.click('[data-testid="continue"]');
    await wait(400);
    assert(new URL(page.url()).pathname === "/journey", `Expected /journey, got ${page.url()}`);
    const serviceTitle = await page.textContent('[data-testid="journey-service-title"]');
    assert(serviceTitle.includes("Airport Transfer"), `Expected Airport Transfer, got '${serviceTitle}'`);
    await snap("01-Screen1-JourneyDetails-Default");
  });

  await test("Browser: Missing Required Fields shows error state (Screen 1 Error)", async () => {
    // Clear inputs
    await page.fill("#pickupLocation", "");
    await page.fill("#destination", "");
    await page.fill("#journeyDate", "");
    await page.fill("#journeyTime", "");

    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);

    assert(new URL(page.url()).pathname === "/journey", "Should remain on /journey when invalid");
    const pickupErr = await page.textContent("#pickupLocation-error");
    const destErr = await page.textContent("#destination-error");
    const dateErr = await page.textContent("#journeyDate-error");
    const timeErr = await page.textContent("#journeyTime-error");

    assert(pickupErr.includes("required"), `Expected pickup required error, got '${pickupErr}'`);
    assert(destErr.includes("required"), `Expected dest required error, got '${destErr}'`);
    assert(dateErr.includes("required"), `Expected date required error, got '${dateErr}'`);
    assert(timeErr.includes("required"), `Expected time required error, got '${timeErr}'`);
    await snap("02-Screen1-MissingRequiredFields");
  });

  await test("Browser: Past Date/Time validation shows error (Screen 1 Past Date)", async () => {
    await page.fill("#pickupLocation", "Manchester Piccadilly Station");
    await page.fill("#destination", "Manchester Airport Terminal 2");
    await page.fill("#journeyDate", "2020-01-01");
    await page.fill("#journeyTime", "12:00");

    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);

    const dateErr = await page.textContent("#journeyDate-error");
    assert(dateErr.includes("cannot be in the past"), `Expected past date error, got '${dateErr}'`);
    await snap("03-Screen1-PastDateTimeValidation");
  });

  await test("Browser: Open Screen 2 (Pickup Location Search) and select Manchester Piccadilly", async () => {
    await page.click('[data-testid="search-pickup"]');
    await wait(300);

    // Verify Screen 2 header and input
    const header = await page.textContent("h1");
    assert(header.includes("Select Pickup Location"), `Expected Select Pickup Location, got '${header}'`);
    await snap("04-Screen2-PickupLocationSearch");

    // Search and filter
    await page.fill("#pickup-search-input", "Piccadilly");
    await wait(200);

    // Click Manchester Piccadilly Station suggestion
    await page.click("button:has-text('Manchester Piccadilly Station')");
    await wait(300);

    // Verify back on form with updated value
    const val = await page.inputValue("#pickupLocation");
    assert(val.includes("Manchester Piccadilly Station"), `Expected Piccadilly, got '${val}'`);
  });

  await test("Browser: Open Screen 3 (Destination Search) and inspect layout", async () => {
    await page.click('[data-testid="search-destination"]');
    await wait(300);

    // Verify Screen 3 header
    const header = await page.textContent("h1");
    assert(header.includes("Select Destination"), `Expected Select Destination, got '${header}'`);
    await snap("05-Screen3-DestinationSearch");
  });

  await test("Browser: Open Screen 4 (Set Location on Map) from Destination Search", async () => {
    // Click 'Set on Map' button on destination search screen
    await page.click("button:has-text('Set on Map')");
    await wait(300);

    // Verify Screen 4 header
    const header = await page.textContent("h1");
    assert(header.includes("Set Location on Map"), `Expected Set Location on Map, got '${header}'`);
    await snap("06-Screen4-SetLocationOnMap");

    // Click Confirm Location CTA
    await page.click("button:has-text('Confirm Location')");
    await wait(300);

    // Verify returned to form
    const destVal = await page.inputValue("#destination");
    assert(destVal.length > 0, "Destination should have value from map");
  });

  await test("Browser: Select Destination from Search (Manchester Airport Terminal 2)", async () => {
    await page.click('[data-testid="search-destination"]');
    await wait(200);

    // Filter airport
    await page.fill("#dest-search-input", "Airport");
    await wait(200);

    await page.click("button:has-text('Manchester Airport Terminal 2')");
    await wait(300);

    const destVal = await page.inputValue("#destination");
    assert(destVal.includes("Manchester Airport Terminal 2"), `Expected Terminal 2, got '${destVal}'`);
  });

  await test("Browser: Swap locations button exchanges pickup and destination", async () => {
    const pickupBefore = await page.inputValue("#pickupLocation");
    const destBefore = await page.inputValue("#destination");

    await page.click('[data-testid="swap-locations"]');
    await wait(150);

    const pickupAfter = await page.inputValue("#pickupLocation");
    const destAfter = await page.inputValue("#destination");

    assert(pickupAfter === destBefore, `Pickup expected ${destBefore}, got ${pickupAfter}`);
    assert(destAfter === pickupBefore, `Dest expected ${pickupBefore}, got ${destAfter}`);

    // Swap back to original order
    await page.click('[data-testid="swap-locations"]');
    await wait(150);
  });

  await test("Browser: Set valid future date & time (Screen 1 Completed State)", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split("T")[0];

    await page.fill("#journeyDate", dateStr);
    await page.fill("#journeyTime", "14:30");
    await wait(200);

    // Check day of week displayed
    const dayOfWeek = await page.textContent('[data-testid="date-day-of-week"]');
    assert(dayOfWeek.length > 0, "Day of week should be displayed");

    await snap("07-Screen1-JourneyDetailsCompleted");
  });

  await test("Browser: Continue to Vehicle Size successfully navigates to /vehicle", async () => {
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/vehicle", `Expected /vehicle, got ${page.url()}`);

    // Verify summary values on /vehicle
    const summaryPickup = await page.textContent('[data-testid="summary-pickup"]');
    const summaryDest = await page.textContent('[data-testid="summary-destination"]');
    const summaryTime = await page.textContent('[data-testid="summary-time"]');

    assert(summaryPickup.includes("Manchester Piccadilly"), `Summary pickup mismatch: '${summaryPickup}'`);
    assert(summaryDest.includes("Manchester Airport"), `Summary dest mismatch: '${summaryDest}'`);
    assert(summaryTime.includes("14:30"), `Summary time mismatch: '${summaryTime}'`);

    await snap("08-VehicleSelectionPage-Reached");
  });

  await test("Browser: Back to Journey Details preserves all entered state", async () => {
    await page.click('[data-testid="back-to-journey"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/journey", `Expected /journey, got ${page.url()}`);

    const pickupVal = await page.inputValue("#pickupLocation");
    const destVal = await page.inputValue("#destination");
    const timeVal = await page.inputValue("#journeyTime");

    assert(pickupVal.includes("Manchester Piccadilly"), `Pickup lost: '${pickupVal}'`);
    assert(destVal.includes("Manchester Airport"), `Dest lost: '${destVal}'`);
    assert(timeVal === "14:30", `Time lost: '${timeVal}'`);

    await snap("09-JourneyDataPreservedAfterBack");
  });

  await browser.close();
}

console.log("\n========================================================");
console.log(`TOTAL SCRUM-16 TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("========================================================");

// Save summary json
fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify({ total: passedCount + failedCount, passed: passedCount, failed: failedCount, results }, null, 2)
);

if (failedCount > 0) {
  process.exit(1);
}
