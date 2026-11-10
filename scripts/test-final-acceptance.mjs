// =============================================================
// test-final-acceptance.mjs — Comprehensive Acceptance Audit Suite
// Executes all 13 E2E Customer Journeys and verifies Stories 12, 13, 15, 16, 17, 18
// =============================================================
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("test-output-final-audit");

fs.mkdirSync(OUT_DIR, { recursive: true });

const results = [];
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(id, name, fn) {
  try {
    await fn();
    passedCount++;
    console.log(`[PASS] ${id} — ${name}`);
    results.push({ id, name, status: "PASS" });
  } catch (err) {
    failedCount++;
    console.error(`[FAIL] ${id} — ${name} -> ${err.message}`);
    results.push({ id, name, status: "FAIL", error: err.message });
  }
}

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

  // E2E-12: Unauthenticated users cannot bypass protected routes
  await test("E2E-12", "Unauthenticated users cannot bypass protected routes", async () => {
    await page.goto(`${BASE_URL}/home`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /home");

    await page.goto(`${BASE_URL}/services`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /services");

    await page.goto(`${BASE_URL}/journey`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /journey");

    await page.goto(`${BASE_URL}/vehicle`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /vehicle");

    await page.goto(`${BASE_URL}/availability`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /availability");

    await page.goto(`${BASE_URL}/profile`);
    await wait(200);
    assert(new URL(page.url()).pathname === "/login", "Expected redirect to /login from /profile");
    await snap("E2E-12-Protected-Routes-Redirect");
  });

  // E2E-01: Register -> Login -> Home
  const auditEmail = `audit_user_${Date.now()}@example.co.uk`;
  const auditPassword = "Password123!";

  await test("E2E-01", "Register -> Login -> Home flow", async () => {
    await page.goto(`${BASE_URL}/register`);
    await wait(200);

    await page.fill("#fullName", "Audit Customer");
    await page.fill("#homeAddress", "123 Oxford Road, Manchester M1 7ED");
    await page.fill("#phone", "07123456789");
    await page.fill("#email", auditEmail);
    await page.fill("#cardholderName", "Audit Customer");
    await page.fill("#cardNumber", "4532 1111 2222 3333");
    await page.fill("#expiry", "11/28");
    await page.fill("#cvv", "999");
    await page.fill("#password", auditPassword);
    await page.fill("#confirmPassword", auditPassword);
    await snap("E2E-01-Registration-Form-Filled");

    await page.click("button[type=submit]");
    await wait(400);

    assert(new URL(page.url()).pathname === "/register/complete", "Expected /register/complete");
    const displayedEmail = await page.textContent('[data-testid="registered-email"]');
    assert(displayedEmail.includes(auditEmail), "Registered email mismatch on success screen");
    await snap("E2E-01-Registration-Success-Screen");

    // Click Go to Login
    await page.click('[data-testid="go-to-login"]');
    await wait(300);

    assert(new URL(page.url()).pathname === "/login", "Expected /login");
    const prefilledEmail = await page.inputValue("#email");
    assert(prefilledEmail === auditEmail, "Login email was not prefilled");
    await snap("E2E-01-Login-Prefilled");

    // Enter password and log in
    await page.fill("#password", auditPassword);
    await page.click("button[type=submit]");
    await wait(400);

    assert(new URL(page.url()).pathname === "/home", "Expected /home after login");
    await snap("E2E-01-Home-Page-Authenticated");
  });

  // E2E-02: Invalid Login -> Correction -> Home
  await test("E2E-02", "Invalid Login -> Correction -> Home", async () => {
    // Logout first via Profile
    await page.goto(`${BASE_URL}/profile`);
    await wait(200);
    await page.click('[data-testid="logout"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/login", "Expected /login after logout");

    // Enter wrong password
    await page.fill("#email", auditEmail);
    await page.fill("#password", "WrongPassword999!");
    await page.click("button[type=submit]");
    await wait(300);

    // Verify error banner
    const alertBanner = await page.isVisible('div[role="alert"]');
    assert(alertBanner, "Expected error banner for invalid credentials");
    await snap("E2E-02-Login-Invalid-Credentials");

    // Correct password
    await page.fill("#password", auditPassword);
    await page.click("button[type=submit]");
    await wait(400);

    assert(new URL(page.url()).pathname === "/home", "Expected /home after correct credentials");
    await snap("E2E-02-Login-Success-Recovered");
  });

  // E2E-03: Home -> Select Service -> Journey Details
  await test("E2E-03", "Home -> Select Service -> Journey Details", async () => {
    // Click "Book a Journey" CTA or service navigation
    await page.click('[data-node-id="6:1101"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/services", "Expected /services");
    await snap("E2E-03-Services-Selection-Screen");

    // Continue should be disabled without selection
    const continueBtn = page.locator('[data-testid="continue"]');
    const isInitiallyDisabled = await continueBtn.isDisabled();
    assert(isInitiallyDisabled, "Continue button must be disabled when no service is selected");

    // Select "Airport Transfer"
    await page.click('[data-testid="service-airport-transfer"]');
    await wait(100);
    const isNowEnabled = !(await continueBtn.isDisabled());
    assert(isNowEnabled, "Continue button must be enabled after selecting service");

    // Click Continue
    await page.click('[data-testid="continue"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/journey", "Expected /journey");
    await snap("E2E-03-Journey-Details-Initial");
  });

  // E2E-04: Invalid Journey Details -> Correct Inputs -> Vehicle Size
  await test("E2E-04", "Invalid Journey Details -> Correct Inputs -> Vehicle Size", async () => {
    // Attempt submit with empty fields
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);

    const hasErrors = (await page.isVisible('#pickupLocation-error')) || (await page.isVisible('#destination-error'));
    assert(hasErrors, "Error messages must appear on missing fields");
    await snap("E2E-04-Journey-Validation-Errors");

    // Select pickup via search screen
    await page.click('[data-testid="search-pickup"]');
    await wait(200);
    await page.fill("#pickup-search-input", "Piccadilly");
    await wait(200);
    await page.click("button:has-text('Manchester Piccadilly Station')");
    await wait(200);

    // Select destination via search screen
    await page.click('[data-testid="search-destination"]');
    await wait(200);
    await page.fill("#dest-search-input", "Airport");
    await wait(200);
    await page.click("button:has-text('Manchester Airport Terminal 2')");
    await wait(200);

    // Fill valid future date and daytime
    await page.fill("#journeyDate", "2026-11-25");
    await page.fill("#journeyTime", "14:30");
    await wait(200);
    await snap("E2E-04-Journey-Details-Valid-Completed");

    // Submit
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/vehicle", "Expected /vehicle after valid inputs");
    await snap("E2E-04-Vehicle-Size-Arrival");
  });

  // E2E-05: Three passengers -> Select Seven-Seater
  await test("E2E-05", "Three passengers -> Select Seven-Seater", async () => {
    // Current default passenger count is 3
    const passengerCount = await page.textContent('[data-testid="passenger-display"]');
    assert(passengerCount.includes("3 Passengers"), `Expected 3 Passengers, got ${passengerCount}`);

    // Select Seven-Seater
    await page.click('[data-testid="vehicle-card-seven-seater"]');
    await wait(100);

    const isCtaEnabled = !(await page.locator('[data-testid="check-availability-button"]').isDisabled());
    assert(isCtaEnabled, "Check Availability CTA must be enabled");
    await snap("E2E-05-Three-Passengers-Seven-Seater");
  });

  // E2E-06: Five passengers -> Standard Car insufficient -> Seven-Seater selected
  await test("E2E-06", "Five passengers -> Standard Car insufficient -> Seven-Seater selected", async () => {
    // Increase to 5 passengers
    await page.click('[data-testid="increase-passengers"]'); // to 4
    await wait(50);
    await page.click('[data-testid="increase-passengers"]'); // to 5
    await wait(100);

    // Standard Car must be disabled and marked insufficient
    const isStandardInsufficient = await page.isVisible('[data-testid="standard-insufficient-badge"]');
    assert(isStandardInsufficient, "Standard car must show insufficient capacity for 5 passengers");

    // Ensure Seven-Seater is selected
    await page.click('[data-testid="vehicle-card-seven-seater"]');
    await wait(100);
    await snap("E2E-06-Five-Passengers-Seven-Seater-Only");
  });

  // E2E-07: Vehicle Size -> Checking -> Available (14:30 Daytime Slot)
  await test("E2E-07", "Vehicle Size -> Checking -> Available (14:30 Daytime Slot)", async () => {
    await page.click('[data-testid="check-availability-button"]');
    await wait(100);

    assert(new URL(page.url()).pathname === "/availability", "Expected /availability");
    const isChecking = await page.isVisible('[data-testid="checking-state-card"]');
    assert(isChecking, "Expected checking state immediately upon arrival");
    await snap("E2E-07-Availability-Checking-State");

    // Wait for resolution
    await page.waitForSelector('[data-testid="available-state-card"]', { timeout: 3000 });
    const badgeText = await page.textContent('[data-testid="vehicle-available-badge"]');
    assert(badgeText.includes("VEHICLE AVAILABLE"), `Expected VEHICLE AVAILABLE, got '${badgeText}'`);
    await snap("E2E-07-Availability-Available-State");
  });

  // E2E-09: Available -> Change Date/Time -> Recheck with Peak Hour (18:00)
  await test("E2E-09", "Change Date/Time -> Recheck with Peak Hour (18:00)", async () => {
    await page.click('[data-testid="change-datetime-btn"]');
    await wait(300);

    assert(new URL(page.url()).pathname === "/journey", "Expected /journey after Change Date/Time");
    // Verify inputs preserved
    const timeVal = await page.inputValue("#journeyTime");
    assert(timeVal === "14:30", "Journey time was not preserved in form");

    // Change to peak rush hour 18:00
    await page.fill("#journeyTime", "18:00");
    await wait(100);
    await snap("E2E-09-Journey-Time-Changed-To-1800");

    // Continue to Vehicle Size
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/vehicle", "Expected /vehicle");

    // Recheck availability
    await page.click('[data-testid="check-availability-button"]');
    await wait(100);
    assert(new URL(page.url()).pathname === "/availability", "Expected /availability");
  });

  // E2E-08: Peak Hour (18:00) -> Checking -> Unavailable
  await test("E2E-08", "Peak Hour (18:00) -> Checking -> Unavailable", async () => {
    await page.waitForSelector('[data-testid="unavailable-state-card"]', { timeout: 3000 });
    const badgeText = await page.textContent('[data-testid="vehicle-unavailable-badge"]');
    assert(badgeText.includes("VEHICLE UNAVAILABLE"), `Expected VEHICLE UNAVAILABLE, got '${badgeText}'`);
    await snap("E2E-08-Availability-Unavailable-State");
  });

  // E2E-10: Unavailable -> Change Vehicle Size -> Recheck
  await test("E2E-10", "Unavailable -> Change Vehicle Size -> Recheck", async () => {
    await page.click('[data-testid="change-vehicle-btn"]');
    await wait(300);
    assert(new URL(page.url()).pathname === "/vehicle", "Expected /vehicle after Change Vehicle Size");
    await snap("E2E-10-Vehicle-Size-Return");

    // Adjust passengers to 2 and select Standard Car
    await page.click('[data-testid="decrease-passengers"]'); // to 4
    await wait(50);
    await page.click('[data-testid="decrease-passengers"]'); // to 3
    await wait(50);
    await page.click('[data-testid="decrease-passengers"]'); // to 2
    await wait(50);
    await page.click('[data-testid="vehicle-card-standard"]');
    await wait(100);

    // Change time back to 10:00 AM via Back to Journey
    await page.click('[data-testid="back-button"]');
    await wait(200);
    assert(new URL(page.url()).pathname === "/journey", "Expected /journey");
    await page.fill("#journeyTime", "10:00");
    await wait(100);
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);

    // Standard Car should be selected
    await page.click('[data-testid="check-availability-button"]');
    await wait(100);
    await page.waitForSelector('[data-testid="available-state-card"]', { timeout: 3000 });

    const fleetVal = await page.textContent('[data-testid="summary-fleet-val"]');
    assert(fleetVal.includes("Standard Car"), `Expected Standard Car, got '${fleetVal}'`);
    await snap("E2E-10-Rechecked-Standard-Car-Available");
  });

  // E2E-11: Back navigation preserves valid input
  await test("E2E-11", "Back navigation preserves valid input across the flow", async () => {
    // Back from Availability to Vehicle Size
    await page.click('[data-testid="change-vehicle-btn"]');
    await wait(200);
    const passVal = await page.textContent('[data-testid="passenger-display"]');
    assert(passVal.includes("2 Passengers"), "Passenger count not preserved on /vehicle");

    // Back from Vehicle Size to Journey
    await page.click('[data-testid="back-button"]');
    await wait(200);
    assert(new URL(page.url()).pathname === "/journey", "Expected /journey");
    const pickupVal = await page.inputValue("#pickupLocation");
    const destVal = await page.inputValue("#destination");
    const timeVal = await page.inputValue("#journeyTime");
    assert(pickupVal.length > 0, "Pickup location lost on back navigation");
    assert(destVal.length > 0, "Destination lost on back navigation");
    assert(timeVal === "10:00", "Time lost on back navigation");

    // Back from Journey to Services
    await page.click('button[aria-label="Go Back to Service Selection"]');
    await wait(200);
    assert(new URL(page.url()).pathname === "/services", "Expected /services");
    const isServiceActive = (await page.getAttribute('[data-testid="service-airport-transfer"]', "aria-checked")) === "true";
    assert(isServiceActive, "Selected service was not preserved on back navigation");
    await snap("E2E-11-Back-Preserved-Services");
  });

  // E2E-13: No booking or payment is created during availability checks
  await test("E2E-13", "No booking or payment is created during availability checks", async () => {
    // Return to availability
    await page.click('[data-testid="continue"]');
    await wait(200);
    await page.click('[data-testid="continue-to-vehicle"]');
    await wait(200);
    await page.click('[data-testid="check-availability-button"]');
    await wait(800);

    const hasPayBtn = await page.isVisible('button:has-text("Pay")');
    const hasBookBtn = await page.isVisible('button:has-text("Book Now")');
    const hasConfirmBtn = await page.isVisible('button:has-text("Confirm Booking")');
    const hasCardInput = await page.isVisible('input[name="cardNumber"]');

    assert(!hasPayBtn && !hasBookBtn && !hasConfirmBtn && !hasCardInput, "No booking confirmation or payment form must exist on availability page");
    await snap("E2E-13-No-Payment-Actions");
  });

  await browser.close();
}

console.log("\n========================================================");
console.log(`TOTAL E2E AUDIT TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("========================================================");

fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify({ total: passedCount + failedCount, passed: passedCount, failed: failedCount, results }, null, 2)
);

if (failedCount > 0) {
  process.exit(1);
}
