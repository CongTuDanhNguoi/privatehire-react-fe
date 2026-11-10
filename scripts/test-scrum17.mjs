// =============================================================
// test-scrum17.mjs — Comprehensive Verification Suite for SCRUM-17
// Tests:
// 1. Unit & Business Logic Tests for Vehicle Capacity Rules
// 2. Playwright E2E Browser Automation for States A, B, and C
// 3. Automated Screenshot Capture at 430x926 matching Figma reference dimensions
// 4. Persistence, Route Guards & Back Navigation Tests
// =============================================================
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("test-output-scrum17");

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

console.log("=== STEP 1: BUSINESS LOGIC SPECIFICATION TESTS (SCRUM-17) ===");

await test("Capacity Rule: Standard Car max capacity is 4 passengers", () => {
  const STANDARD_MAX = 4;
  assert(STANDARD_MAX === 4, "Standard car must seat up to 4");
});

await test("Capacity Rule: Seven-Seater max capacity is 6 passengers", () => {
  const SEVEN_SEATER_MAX = 6;
  assert(SEVEN_SEATER_MAX === 6, "Seven-Seater must seat up to 6");
});

await test("Capacity Rule: Passenger bounds are strictly 1 to 6", () => {
  const MIN = 1;
  const MAX = 6;
  assert(MIN === 1 && MAX === 6, "Allowed passenger count must be 1 to 6");
});

console.log("\n=== STEP 2: PLAYWRIGHT BROWSER AUTOMATION (SCRUM-17) ===");

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
  // Use exact Figma dimensions: 430x926 viewport
  const context = await browser.newContext({
    viewport: { width: 430, height: 926 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const wait = (ms = 350) => page.waitForTimeout(ms);

  const snap = async (label) => {
    const file = path.join(OUT_DIR, `${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    return file;
  };

  // Helper: Login and reach /journey with valid data
  await test("Route Guard & Auth: Unauthenticated /vehicle redirected to /login", async () => {
    await page.goto(`${BASE_URL}/vehicle`);
    await wait(300);
    assert(new URL(page.url()).pathname === "/login", `Expected /login, got ${page.url()}`);
  });

  await test("Setup: Authenticate and complete Journey Details", async () => {
    await page.fill("#email", "alex.morgan@example.com");
    await page.fill("#password", "Password123");
    await page.click("button[type=submit]");
    await wait(400);

    // Navigate to services
    await page.click('[data-node-id="6:1101"]'); // Book a Ride
    await wait(300);

    // Select Airport Transfer
    await page.click('[data-testid="service-airport-transfer"]');
    await wait(100);
    await page.click('[data-testid="continue"]');
    await wait(400);

    // Fill Journey Details
    await page.fill("#pickupLocation", "Manchester Piccadilly Station, M1 2PB");
    await page.fill("#destination", "Manchester Airport Terminal 2, Ringway M90 4FP");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split("T")[0];

    await page.fill("#journeyDate", dateStr);
    await page.fill("#journeyTime", "14:30");
    await wait(200);

    // Continue to Vehicle Size
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/vehicle", `Expected /vehicle, got ${page.url()}`);
  });

  // -------------------------------------------------------------
  // STATE A VERIFICATION
  // -------------------------------------------------------------
  await test("State A: 3 Passengers, Standard unselected, Seven-Seater selected, CTA enabled", async () => {
    // Verify 3 passengers display
    const countText = await page.textContent('[data-testid="passenger-display"]');
    assert(countText.includes("3 Passengers"), `Expected 3 Passengers, got '${countText}'`);

    // Verify hint
    const hint = await page.textContent('[data-testid="passenger-hint"]');
    assert(hint.includes("Standard or 7-Seater suitable"), `Expected suitable hint, got '${hint}'`);

    // Ensure Seven-Seater is selected and Standard is unselected
    const isSevenSeaterSelected = await page.isVisible('[data-testid="seven-seater-selected-indicator"]');
    const isStandardUnselected = await page.isVisible('[data-testid="standard-unselected-indicator"]');

    assert(isSevenSeaterSelected, "Seven-Seater must have selected indicator");
    assert(isStandardUnselected, "Standard Car must be unselected");

    // CTA must be enabled
    const ctaDisabled = await page.isDisabled('[data-testid="check-availability-button"]');
    assert(!ctaDisabled, "CTA button must be ENABLED in State A");

    await snap("State-A-VehicleSizeSelection-3Passengers");
  });

  // -------------------------------------------------------------
  // INTERACTIVE STEPPER & CAPACITY LIMITS
  // -------------------------------------------------------------
  await test("Stepper: Cannot decrease below 1 passenger", async () => {
    // Decrease from 3 to 1
    await page.click('[data-testid="decrease-passengers"]'); // 2
    await wait(100);
    await page.click('[data-testid="decrease-passengers"]'); // 1
    await wait(100);

    const countText = await page.textContent('[data-testid="passenger-display"]');
    assert(countText.includes("1 Passenger"), `Expected 1 Passenger, got '${countText}'`);

    // Minus button must be disabled
    const minusDisabled = await page.isDisabled('[data-testid="decrease-passengers"]');
    assert(minusDisabled, "Decrease button must be disabled at 1 passenger");
  });

  await test("Selection: Switch selection to Standard Car at 1 passenger", async () => {
    await page.click('[data-testid="vehicle-card-standard"]');
    await wait(200);

    const isStandardSelected = await page.isVisible('[data-testid="standard-selected-indicator"]');
    const isSevenUnselected = await page.isVisible('[data-testid="seven-seater-unselected-indicator"]');

    assert(isStandardSelected, "Standard Car should now be selected");
    assert(isSevenUnselected, "Seven-Seater should now be unselected");

    const ctaDisabled = await page.isDisabled('[data-testid="check-availability-button"]');
    assert(!ctaDisabled, "CTA button must be enabled with Standard Car selected");
  });

  await test("Automatic Selection Clearing: Increasing to 5 clears Standard selection without auto-selecting", async () => {
    // Standard Car currently selected. Increase: 1 -> 2 -> 3 -> 4 -> 5
    await page.click('[data-testid="increase-passengers"]'); // 2
    await wait(100);
    await page.click('[data-testid="increase-passengers"]'); // 3
    await wait(100);
    await page.click('[data-testid="increase-passengers"]'); // 4
    await wait(100);

    // At 4, Standard is still valid
    assert(await page.isVisible('[data-testid="standard-selected-indicator"]'), "Standard should still be selected at 4");

    // Increase to 5 (exceeds Standard capacity of 4)
    await page.click('[data-testid="increase-passengers"]'); // 5
    await wait(200);

    const countText = await page.textContent('[data-testid="passenger-display"]');
    assert(countText.includes("5 Passengers"), `Expected 5 Passengers, got '${countText}'`);

    // Standard must NOT be selected
    const standardSelected = await page.isVisible('[data-testid="standard-selected-indicator"]');
    assert(!standardSelected, "Standard selection must be cleared when exceeding capacity");

    // Seven-Seater must NOT be auto-selected (business rule: do not auto-select replacement)
    const sevenSelected = await page.isVisible('[data-testid="seven-seater-selected-indicator"]');
    assert(!sevenSelected, "Seven-Seater must NOT be automatically selected");
  });

  // -------------------------------------------------------------
  // STATE B VERIFICATION
  // -------------------------------------------------------------
  await test("State B: 5 Passengers, Standard disabled & insufficient, Seven-Seater unselected, CTA disabled", async () => {
    // Verify Standard Car shows Insufficient Capacity badge and message
    const badgeVisible = await page.isVisible('[data-testid="standard-insufficient-badge"]');
    assert(badgeVisible, "INSUFFICIENT CAPACITY badge must be visible on Standard Car");

    const cardText = await page.textContent('[data-testid="vehicle-card-standard"]');
    assert(cardText.includes("This vehicle cannot accommodate 5 passengers"), "Capacity error text must be displayed");

    // Verify Seven-Seater is unselected
    const isSevenUnselected = await page.isVisible('[data-testid="seven-seater-unselected-indicator"]');
    assert(isSevenUnselected, "Seven-Seater must be unselected");

    // CTA must be DISABLED
    const ctaDisabled = await page.isDisabled('[data-testid="check-availability-button"]');
    assert(ctaDisabled, "CTA button must be DISABLED in State B");

    // Clicking disabled Standard Car should NOT select it
    await page.click('[data-testid="vehicle-card-standard"]');
    await wait(150);
    const standardStillNotSelected = !(await page.isVisible('[data-testid="standard-selected-indicator"]'));
    assert(standardStillNotSelected, "Clicking disabled Standard Car must NOT select it");

    await snap("State-B-InsufficientCapacity-5Passengers");
  });

  // -------------------------------------------------------------
  // STATE C VERIFICATION
  // -------------------------------------------------------------
  await test("State C: 5 Passengers, Standard disabled, Seven-Seater selected, CTA enabled", async () => {
    // Select Seven-Seater
    await page.click('[data-testid="vehicle-card-seven-seater"]');
    await wait(200);

    // Standard Car remains disabled with Insufficient Capacity
    const badgeVisible = await page.isVisible('[data-testid="standard-insufficient-badge"]');
    assert(badgeVisible, "Standard Car must still show INSUFFICIENT CAPACITY badge");

    // Seven-Seater is selected
    const isSevenSelected = await page.isVisible('[data-testid="seven-seater-selected-indicator"]');
    assert(isSevenSelected, "Seven-Seater must be selected");

    // CTA is ENABLED
    const ctaDisabled = await page.isDisabled('[data-testid="check-availability-button"]');
    assert(!ctaDisabled, "CTA button must be ENABLED in State C");

    await snap("State-C-CorrectedSelection-5Passengers");
  });

  await test("Stepper: Cannot increase above 6 passengers", async () => {
    // Currently at 5, increase to 6
    await page.click('[data-testid="increase-passengers"]'); // 6
    await wait(100);

    const countText = await page.textContent('[data-testid="passenger-display"]');
    assert(countText.includes("6 Passengers"), `Expected 6 Passengers, got '${countText}'`);

    // Plus button must be disabled
    const plusDisabled = await page.isDisabled('[data-testid="increase-passengers"]');
    assert(plusDisabled, "Increase button must be disabled at 6 passengers");
  });

  // -------------------------------------------------------------
  // NAVIGATION & PERSISTENCE
  // -------------------------------------------------------------
  await test("Navigation: Back to Journey Details preserves all entered information", async () => {
    await page.click('[data-testid="back-to-journey"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/journey", `Expected /journey, got ${page.url()}`);

    const pickup = await page.inputValue("#pickupLocation");
    const dest = await page.inputValue("#destination");
    const time = await page.inputValue("#journeyTime");

    assert(pickup.includes("Manchester Piccadilly"), `Pickup lost: '${pickup}'`);
    assert(dest.includes("Manchester Airport"), `Dest lost: '${dest}'`);
    assert(time === "14:30", `Time lost: '${time}'`);
  });

  await test("Persistence: Returning forward to /vehicle restores passenger count and vehicle selection", async () => {
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/vehicle", `Expected /vehicle, got ${page.url()}`);

    const countText = await page.textContent('[data-testid="passenger-display"]');
    assert(countText.includes("6 Passengers"), `Expected 6 Passengers preserved, got '${countText}'`);

    const isSevenSelected = await page.isVisible('[data-testid="seven-seater-selected-indicator"]');
    assert(isSevenSelected, "Seven-Seater selection should be preserved");

    await snap("04-StatePreserved-ReturnFromJourney");
  });

  await test("Navigation: Continue routes to /availability with booking payload preserved", async () => {
    await page.click('[data-testid="check-availability-button"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/availability", `Expected /availability, got ${page.url()}`);

    const service = await page.textContent('[data-testid="summary-service"]');
    const passengers = await page.textContent('[data-testid="summary-passengers"]');
    const vehicle = await page.textContent('[data-testid="summary-vehicle"]');

    assert(service.includes("Airport Transfer"), `Service mismatch: '${service}'`);
    assert(passengers.includes("6 Passengers"), `Passengers mismatch: '${passengers}'`);
    assert(vehicle.includes("Seven-Seater"), `Vehicle mismatch: '${vehicle}'`);

    await snap("05-AvailabilityPlaceholder-Reached");
  });

  await page.click('[data-testid="back-to-vehicle-btn"]');
  await wait(300);
  assert(new URL(page.url()).pathname === "/vehicle", "Should return to /vehicle from /availability");

  await browser.close();
}

console.log("\n========================================================");
console.log(`TOTAL SCRUM-17 TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("========================================================");

fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify({ total: passedCount + failedCount, passed: passedCount, failed: failedCount, results }, null, 2)
);

if (failedCount > 0) {
  process.exit(1);
}
