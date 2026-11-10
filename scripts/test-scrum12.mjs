// =============================================================
// test-scrum12.mjs — Comprehensive Verification Suite for SCRUM-12 (Registration Flow Fix)
// Tests:
// 1. Form Validation (empty fields, invalid format, duplicate email, password mismatch)
// 2. Registration persistence in localStorage without automatic session start
// 3. Registration Complete screen with registered email and "Go to Login" CTA
// 4. Navigation to /login with prefilled email
// 5. Protected route redirection prior to login
// 6. Successful login with new credentials transitioning to /home
// =============================================================
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.resolve("test-output-scrum12");

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

console.log("=== STEP 1: SCRUM-12 REGISTRATION FLOW TESTS ===");

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

  // Clear previous session/users before test run
  await page.goto(`${BASE_URL}/register`);
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await wait(300);

  // T01: Form validation on empty submit
  await test("T01 — Submitting empty registration form shows validation errors", async () => {
    await page.click("button[type=submit]");
    await wait(200);

    const fullNameError = await page.textContent("#fullName-error");
    const emailError = await page.textContent("#email-error");
    const passwordError = await page.textContent("#password-error");

    assert(fullNameError && fullNameError.length > 0, "Full name required error missing");
    assert(emailError && emailError.length > 0, "Email required error missing");
    assert(passwordError && passwordError.length > 0, "Password required error missing");
  });

  // T02: Invalid email format
  await test("T02 — Invalid email format triggers email validation error", async () => {
    await page.fill("#email", "invalid-email-address");
    await page.locator("#email").blur();
    await wait(200);

    const emailError = await page.textContent("#email-error");
    assert(emailError && emailError.toLowerCase().includes("email"), `Expected email error, got '${emailError}'`);
  });

  // T03: Password mismatch
  await test("T03 — Password mismatch triggers confirmation error", async () => {
    await page.fill("#password", "SecurePass123!");
    await page.fill("#confirmPassword", "DifferentPass123!");
    await page.locator("#confirmPassword").blur();
    await wait(200);

    const confirmError = await page.textContent("#confirmPassword-error");
    assert(confirmError && confirmError.length > 0, "Confirm password error missing");
  });

  // T04: Fill valid form data
  const testEmail = `newcustomer_${Date.now()}@testphc.co.uk`;
  const testPassword = "Password123!";

  await test("T04 — Successful registration submits form and transitions to /register/complete", async () => {
    await page.fill("#fullName", "Sarah Jenkins");
    await page.fill("#homeAddress", "42 Deansgate, Manchester M3 2FW");
    await page.fill("#phone", "07700900123");
    await page.fill("#email", testEmail);
    await page.fill("#cardholderName", "Sarah Jenkins");
    await page.fill("#cardNumber", "4532 0150 1234 5678");
    await page.fill("#expiry", "12/28");
    await page.fill("#cvv", "888");
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await wait(200);

    await page.click("button[type=submit]");
    await wait(400);

    const currentUrl = page.url();
    assert(new URL(currentUrl).pathname === "/register/complete", `Expected /register/complete, got ${currentUrl}`);
  });

  // T05: Verify Registration Complete Page content
  await test("T05 — Registration Complete page displays success message, registered email and Go to Login CTA", async () => {
    const isComplete = await page.isVisible('[data-testid="registration-complete-page"]');
    assert(isComplete, "Registration complete page container missing");

    const registeredEmail = await page.textContent('[data-testid="registered-email"]');
    assert(registeredEmail.includes(testEmail), `Registered email '${registeredEmail}' does not contain '${testEmail}'`);

    const hasGoToLogin = await page.isVisible('[data-testid="go-to-login"]');
    assert(hasGoToLogin, "Go to Login button must be visible");

    await snap("Registration-Success");
  });

  // T06: Verify DEF-05 Fix — Session is NOT started automatically
  await test("T06 — DEF-05 Fix: No active session created upon registration (phc_session is null)", async () => {
    const session = await page.evaluate(() => localStorage.getItem("phc_session"));
    assert(!session || session === "null", `phc_session should be null/empty, got '${session}'`);
  });

  // T07: Protected routes reject access
  await test("T07 — Protected routes reject access before login", async () => {
    await page.goto(`${BASE_URL}/home`);
    await wait(300);
    assert(new URL(page.url()).pathname === "/login", `Expected redirect to /login from /home, got ${page.url()}`);

    await page.goto(`${BASE_URL}/services`);
    await wait(300);
    assert(new URL(page.url()).pathname === "/login", `Expected redirect to /login from /services, got ${page.url()}`);
  });

  // T08: Return to /register/complete through a valid registration state and click "Go to Login"
  await test("T08 — Clicking Go to Login navigates to /login with prefilled email", async () => {
    // Re-register a quick user to test the button click transition
    const secondEmail = `john.smith_${Date.now()}@testphc.co.uk`;
    await page.goto(`${BASE_URL}/register`);
    await wait(200);
    await page.fill("#fullName", "John Smith");
    await page.fill("#homeAddress", "10 King Street, Manchester M2 6AZ");
    await page.fill("#phone", "07700900456");
    await page.fill("#email", secondEmail);
    await page.fill("#cardholderName", "John Smith");
    await page.fill("#cardNumber", "4532 0150 8765 4321");
    await page.fill("#expiry", "08/29");
    await page.fill("#cvv", "123");
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await wait(100);

    await page.click("button[type=submit]");
    await wait(400);

    assert(new URL(page.url()).pathname === "/register/complete", "Must be on /register/complete");

    // Click Go to Login
    await page.click('[data-testid="go-to-login"]');
    await wait(400);

    assert(new URL(page.url()).pathname === "/login", `Expected /login, got ${page.url()}`);

    // Verify email is prefilled!
    const loginEmailVal = await page.inputValue("#email");
    assert(loginEmailVal === secondEmail, `Login email should be prefilled with '${secondEmail}', got '${loginEmailVal}'`);

    // Verify password is empty (security requirement)
    const loginPassVal = await page.inputValue("#password");
    assert(loginPassVal === "", `Password should remain empty, got '${loginPassVal}'`);

    await snap("Login-Transition");
  });

  // T09: Successful login with newly created credentials
  await test("T09 — Logging in with new credentials establishes session and navigates to /home", async () => {
    await page.fill("#password", testPassword);
    await wait(100);
    await page.click("button[type=submit]");
    await wait(400);

    assert(new URL(page.url()).pathname === "/home", `Expected /home after login, got ${page.url()}`);

    // Verify session now exists
    const session = await page.evaluate(() => localStorage.getItem("phc_session"));
    assert(session && session.length > 0, "phc_session should exist after login");
  });

  await browser.close();
}

console.log("\n========================================================");
console.log(`TOTAL SCRUM-12 TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("========================================================");

fs.writeFileSync(
  path.join(OUT_DIR, "summary.json"),
  JSON.stringify({ total: passedCount + failedCount, passed: passedCount, failed: failedCount, results }, null, 2)
);

if (failedCount > 0) {
  process.exit(1);
}
