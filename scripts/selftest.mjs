// =============================================================
// Self-test tự động theo Acceptance Criteria.
// Cách chạy (cần `npm run dev` đang chạy ở terminal khác):
//   npm i -D playwright && npx playwright install chromium   (chỉ lần đầu)
//   npm run selftest
// Kết quả: thư mục selftest/ gồm ảnh từng bước + report.html + report.pdf
// =============================================================
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const OUT = path.resolve(process.env.OUT_DIR ?? "selftest");
const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? "playwright");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
if (process.env.ASSET_ROUTER) await (await import(process.env.ASSET_ROUTER)).default(context);
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

const results = [];
let shot = 0;
const snap = async (label) => {
  const file = `${String(++shot).padStart(2, "0")}-${label}.png`;
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  return file;
};
const pathname = () => new URL(page.url()).pathname;
const wait = (ms = 300) => page.waitForTimeout(ms);
const resetStorage = async () => {
  await page.goto(BASE + "/gallery");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
};

async function test(id, criterion, steps, fn) {
  const shots = [];
  let ok = true;
  let detail = "";
  try {
    detail = (await fn((label) => snap(label).then((f) => shots.push(f)))) ?? "";
  } catch (err) {
    ok = false;
    detail = err.message;
    shots.push(await snap(`${id}-FAILED`));
  }
  results.push({ id, criterion, steps, ok, detail, shots });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${criterion}${ok ? "" : "  -> " + detail}`);
}
function expect(cond, message) {
  if (!cond) throw new Error(message);
}

const login = async (email = "alex.morgan@example.com", password = "Password123") => {
  await page.goto(BASE + "/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await wait(400);
};
const SERVICE_IDS = ["local-travel", "long-distance", "airport-transfer", "hotel-transfer", "airport-meet-greet", "daily-hire"];
const checkedCount = () => page.locator('[role="radio"][aria-checked="true"]').count();

// ---------------------------------------------------------------
await resetStorage();

await test("AC-01", "Guest không vào được Home / Services / Journey / Profile", "Chưa đăng nhập, gõ thẳng từng đường dẫn", async (s) => {
  for (const p of ["/home", "/services", "/journey", "/profile"]) {
    await page.goto(BASE + p);
    await wait();
    expect(pathname() === "/login", `${p} không bị chuyển về /login (đang ở ${pathname()})`);
  }
  await s("guest-redirected-to-login");
  return "Cả 4 đường dẫn đều bị chuyển về /login";
});

await test("AC-02", "Welcome → Log In mở màn Login", "Mở /, bấm Log In", async (s) => {
  await page.goto(BASE + "/");
  await s("welcome");
  await page.click('[data-node-id="6:476"]');
  await wait();
  expect(pathname() === "/login", `Đang ở ${pathname()}`);
  await s("login-screen");
});

await test("AC-03", "Login: kiểm tra lỗi nhập", "Bỏ trống → bấm Log In; nhập 'bnadffad'; sai mật khẩu", async (s) => {
  await page.goto(BASE + "/login");
  await page.click("button[type=submit]");
  await wait();
  expect((await page.textContent("#email-error"))?.includes("Email address is required."), "thiếu lỗi email trống");
  expect((await page.textContent("#password-error"))?.includes("Password is required."), "thiếu lỗi mật khẩu trống");
  await s("login-empty-fields");
  await page.fill("#email", "bnadffad");
  await page.locator("#password").focus();
  await wait();
  expect((await page.textContent("#email-error"))?.includes("Please enter a valid email address."), "thiếu lỗi định dạng email");
  await s("login-invalid-email");
  await page.fill("#email", "alex.morgan@example.com");
  await page.fill("#password", "wrongpass");
  await page.click("button[type=submit]");
  await wait(400);
  expect((await page.textContent("[role=alert]"))?.includes("Incorrect email or password"), "thiếu banner sai tài khoản");
  await s("login-wrong-password");
});

await test("AC-04", "Login thành công → Home", "Đăng nhập alex.morgan@example.com / Password123", async (s) => {
  await login();
  expect(pathname() === "/home", `Đang ở ${pathname()}`);
  await s("login-success-home");
});

await test("AC-05", "Home → Book a Ride → Service Selection", "Bấm Book a Ride trên Home", async (s) => {
  await page.goto(BASE + "/home");
  await page.click('[data-node-id="6:1101"]');
  await wait();
  expect(pathname() === "/services", `Đang ở ${pathname()}`);
  await s("service-selection-empty");
});

await test("AC-06", "Continue bị tắt khi chưa chọn dịch vụ", "Mở Service Selection, chưa chọn gì", async () => {
  expect(await page.isDisabled('[data-testid="continue"]'), "Continue không bị tắt");
  expect((await checkedCount()) === 0, "Đang có dịch vụ được chọn sẵn");
  return "Continue disabled, 0 dịch vụ được chọn";
});

await test("AC-07", "Cả 6 dịch vụ đều chọn được, mỗi lần chỉ 1, Continue bật khi đã chọn", "Lần lượt bấm 6 thẻ dịch vụ", async (s) => {
  expect((await page.locator('[role="radio"]').count()) === 6, "Không đủ 6 dịch vụ");
  for (const id of SERVICE_IDS) {
    await page.click(`[data-testid="service-${id}"]`);
    await wait(100);
    expect((await page.getAttribute(`[data-testid="service-${id}"]`, "aria-checked")) === "true", `${id} không được chọn`);
    expect((await checkedCount()) === 1, `Có ${await checkedCount()} dịch vụ cùng được chọn`);
    expect(!(await page.isDisabled('[data-testid="continue"]')), "Continue vẫn bị tắt sau khi chọn");
  }
  await page.click('[data-testid="service-airport-meet-greet"]');
  await s("service-selected-meet-greet");
  return "6/6 dịch vụ chọn được; luôn chỉ 1 dịch vụ được chọn; Continue enabled";
});

await test("AC-08", "Continue → Journey Details hiển thị đúng dịch vụ", "Chọn Airport Meet & Greet → Continue", async (s) => {
  await page.click('[data-testid="continue"]');
  await wait();
  expect(pathname() === "/journey", `Đang ở ${pathname()}`);
  const title = await page.textContent('[data-testid="journey-service-title"]');
  expect(title === "Airport Meet & Greet", `Journey hiển thị "${title}"`);
  await s("journey-meet-greet");
  return `Journey hiển thị: ${title}`;
});

await test("AC-09", "Đổi dịch vụ → Journey Details cập nhật lựa chọn mới", "Bấm Change → chọn Hotel Transfer → Continue", async (s) => {
  await page.click('[data-node-id="6:1538"]');
  await wait();
  expect(pathname() === "/services", `Change không về Service Selection (${pathname()})`);
  expect((await page.getAttribute('[data-testid="service-airport-meet-greet"]', "aria-checked")) === "true", "Không giữ lựa chọn cũ");
  await page.click('[data-testid="service-hotel-transfer"]');
  await s("service-changed-hotel");
  await page.click('[data-testid="continue"]');
  await wait();
  const title = await page.textContent('[data-testid="journey-service-title"]');
  expect(title === "Hotel Transfer", `Journey vẫn hiển thị "${title}"`);
  await s("journey-hotel-transfer");
  return `Journey cập nhật thành: ${title}`;
});

await test("AC-10", "Home → My Profile", "Về Home, bấm tab Profile", async (s) => {
  await page.goto(BASE + "/home");
  await page.click('[data-node-id="6:1051"]');
  await wait();
  expect(pathname() === "/profile", `Đang ở ${pathname()}`);
  expect((await page.textContent('[data-testid="profile-email"]')) === "alex.morgan@example.com", "Sai email trên Profile");
  await s("profile");
  await page.click('[data-testid="tab-home"]');
  await wait();
  expect(pathname() === "/home", "Tab Home không về Home");
});

await test("AC-11", "Log Out → không vào lại được Home", "Profile → Log Out → gõ /home", async (s) => {
  await page.goto(BASE + "/profile");
  await page.click('[data-testid="logout"]');
  await wait();
  expect(pathname() === "/login", `Sau Log Out đang ở ${pathname()}`);
  await page.goto(BASE + "/home");
  await wait();
  expect(pathname() === "/login", "Vẫn vào được Home sau khi Log Out");
  await s("after-logout");
});

await test("AC-12", "Register: kiểm tra lỗi nhập", "Bỏ trống → Create Account; nhập dữ liệu sai như Figma 2A", async (s) => {
  await page.goto(BASE + "/register");
  await page.click("button[type=submit]");
  await wait();
  const required = await page.locator("[role=alert]").count();
  expect(required === 10, `Chỉ có ${required}/10 ô báo lỗi khi bỏ trống`);
  await s("register-empty");
  const bad = {
    fullName: "Alex Morgan", email: "alex.morgan", homeAddress: "221B Baker St, London NW1 6XE", phone: "+44 7911 123456",
    cardholderName: "Alex Morgan", cardNumber: "4242 4242 4242 4242", expiry: "12/23", cvv: "123",
    password: "password123", confirmPassword: "differentpass",
  };
  for (const [k, v] of Object.entries(bad)) await page.fill(`#${k}`, v);
  await page.click("button[type=submit]");
  await wait();
  const text = await page.locator("[role=alert]").allTextContents();
  for (const m of ["Please enter a valid email address.", "Card has expired", "Password must include an uppercase letter.", "Passwords do not match."]) {
    expect(text.some((t) => t.includes(m)), `Thiếu lỗi "${m}"`);
  }
  await s("register-figma-2a-errors");
  return text.join(" | ");
});

await test("AC-13", "Register: email đã tồn tại", "Đăng ký bằng alex.morgan@example.com", async (s) => {
  await page.fill("#email", "alex.morgan@example.com");
  await page.fill("#expiry", "08/28");
  await page.fill("#password", "Password123");
  await page.fill("#confirmPassword", "Password123");
  await page.click("button[type=submit]");
  await wait(400);
  expect((await page.textContent("#email-error"))?.includes("already registered"), "Không báo email trùng");
  await s("register-duplicate-email");
});

await test("AC-14", "Register thành công → Registration Complete → Home", "Dùng email mới → Create Account → Go to Home", async (s) => {
  await page.fill("#email", "new.user@example.com");
  await page.click("button[type=submit]");
  await wait(500);
  expect(pathname() === "/register/complete", `Đang ở ${pathname()}`);
  expect((await page.textContent('[data-testid="registered-email"]')) === "new.user@example.com", "Sai email trên màn Complete");
  await s("registration-complete");
  await page.click("text=Go to Home");
  await wait();
  expect(pathname() === "/home", `Đang ở ${pathname()}`);
  await s("register-to-home");
  await page.goto(BASE + "/profile");
  await wait();
  expect((await page.textContent('[data-testid="profile-email"]')) === "new.user@example.com", "Profile không hiện tài khoản mới");
  return "Tài khoản mới đăng nhập luôn, Profile hiện new.user@example.com";
});

await test("AC-15", "Không có màn Booking Confirmation / Payment", "Kiểm tra danh sách route", async () => {
  for (const p of ["/confirmation", "/payment", "/booking"]) {
    await page.goto(BASE + p);
    await wait(200);
    expect(!pathname().startsWith(p), `Có route ${p}`);
  }
  return "Không có route confirmation / payment / booking";
});

await browser.close();

// ---------- báo cáo ----------
const passed = results.filter((r) => r.ok).length;
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const rows = results
  .map(
    (r) => `<tr><td>${r.id}</td><td>${esc(r.criterion)}<div class="steps">${esc(r.steps)}</div></td>
<td class="${r.ok ? "pass" : "fail"}">${r.ok ? "PASS" : "FAIL"}</td><td>${esc(r.detail)}</td>
<td>${r.shots.map((f) => `<a href="${f}"><img src="${f}"></a>`).join("")}</td></tr>`
  )
  .join("\n");
const html = `<!doctype html><html><head><meta charset="utf-8"><title>PrivateHire Cars — Self-test</title><style>
body{font-family:system-ui,sans-serif;margin:24px;color:#0f172a} h1{margin:0 0 4px} .meta{color:#475569;margin-bottom:16px}
table{border-collapse:collapse;width:100%;font-size:13px} td,th{border:1px solid #e2e8f0;padding:8px;vertical-align:top;text-align:left}
th{background:#f1f5f9} .pass{color:#047857;font-weight:700} .fail{color:#b91c1c;font-weight:700} .steps{color:#64748b;font-size:12px;margin-top:4px}
img{width:120px;border:1px solid #e2e8f0;margin:2px;border-radius:4px} tr{page-break-inside:avoid}
</style></head><body><h1>PrivateHire Cars — Self-test report</h1>
<div class="meta">${new Date().toLocaleString()} · ${BASE} · <b>${passed}/${results.length} PASS</b>${pageErrors.length ? ` · JS errors: ${esc(pageErrors.join("; "))}` : " · 0 JS errors"}</div>
<table><tr><th>ID</th><th>Acceptance criterion / steps</th><th>Result</th><th>Detail</th><th>Evidence</th></tr>${rows}</table></body></html>`;
fs.writeFileSync(path.join(OUT, "report.html"), html);

const pdfBrowser = await chromium.launch();
const pdfPage = await pdfBrowser.newPage();
await pdfPage.goto("file://" + path.join(OUT, "report.html").replace(/\\/g, "/"));
await pdfPage.pdf({ path: path.join(OUT, "report.pdf"), format: "A4", landscape: true, printBackground: true, margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" } });
await pdfBrowser.close();

console.log(`\n${passed}/${results.length} PASS — report: ${path.join(OUT, "report.html")}`);
process.exitCode = passed === results.length ? 0 : 1;
