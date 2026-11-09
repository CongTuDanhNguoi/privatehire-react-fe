// =============================================================
// auth.ts — Simulated authentication (KHÔNG có backend thật)
// Lưu tài khoản trong localStorage, phiên đăng nhập trong localStorage.
// Muốn nối backend thật: chỉ thay phần thân các hàm bằng fetch("/api/..."),
// giữ nguyên kiểu dữ liệu trả về -> các màn hình không phải sửa.
// =============================================================
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationForm,
} from "../validation/registerValidation";

const USERS_KEY = "phc_users";
const ATTEMPTS_KEY = "phc_login_attempts";
const SESSION_KEY = "phc_session";

export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export const DEMO_ACCOUNT = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  password: "Password123",
} as const;

interface StoredUser {
  fullName: string;
  email: string;
  homeAddress?: string;
  phone?: string;
  cardLast4?: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  email: string;
  fullName: string;
  loggedInAt: string;
}

interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "locked"; minutesLeft: number };

export type RegisterResult = { ok: true; user: SessionUser } | { ok: false; errors: RegistrationErrors };

// ---------- tiện ích ----------
const normalizeEmail = (email: string) => (email ?? "").trim().toLowerCase();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage bị chặn -> bỏ qua */
  }
}

// Băm mật khẩu SHA-256 trước khi lưu (chỉ cho demo)
async function hashPassword(password: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Dự phòng khi mở qua http://<IP máy> (crypto.subtle chỉ có trên localhost/https)
  let h = 2166136261;
  for (const ch of password) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return `fnv-${(h >>> 0).toString(16)}`;
}

function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

function startSession(user: StoredUser): SessionUser {
  const session: SessionUser = {
    email: user.email,
    fullName: user.fullName,
    loggedInAt: new Date().toISOString(),
  };
  writeJson(SESSION_KEY, session);
  return session;
}

// ---------- tài khoản ----------
export function isEmailRegistered(email: string): boolean {
  const target = normalizeEmail(email);
  return getUsers().some((u) => u.email === target);
}

export async function seedDemoAccount(): Promise<void> {
  if (isEmailRegistered(DEMO_ACCOUNT.email)) return;
  const users = getUsers();
  users.push({
    fullName: DEMO_ACCOUNT.fullName,
    email: normalizeEmail(DEMO_ACCOUNT.email),
    passwordHash: await hashPassword(DEMO_ACCOUNT.password),
    createdAt: new Date().toISOString(),
  });
  writeJson(USERS_KEY, users);
}

// Đăng ký: kiểm tra lỗi -> lưu tài khoản -> tự đăng nhập luôn
export async function registerUser(form: RegistrationForm): Promise<RegisterResult> {
  const errors = validateRegistration(form, { isEmailTaken: isEmailRegistered });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const user: StoredUser = {
    fullName: form.fullName.trim(),
    email: normalizeEmail(form.email),
    homeAddress: form.homeAddress.trim(),
    phone: form.phone.trim(),
    // KHÔNG lưu số thẻ đầy đủ và CVV — chỉ 4 số cuối
    cardLast4: form.cardNumber.replace(/\s/g, "").slice(-4),
    passwordHash: await hashPassword(form.password),
    createdAt: new Date().toISOString(),
  };
  writeJson(USERS_KEY, [...getUsers(), user]);
  return { ok: true, user: startSession(user) };
}

// ---------- đăng nhập ----------
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const key = normalizeEmail(email);
  const attempts = readJson<Record<string, AttemptRecord>>(ATTEMPTS_KEY, {});
  const record = attempts[key] ?? { count: 0, lockedUntil: 0 };
  const now = Date.now();

  if (record.lockedUntil > now) {
    return { ok: false, reason: "locked", minutesLeft: Math.ceil((record.lockedUntil - now) / 60000) };
  }

  const user = getUsers().find((u) => u.email === key);
  const passwordHash = await hashPassword(password);

  // Không phân biệt "email chưa đăng ký" và "sai mật khẩu" để không lộ thông tin
  if (!user || user.passwordHash !== passwordHash) {
    const count = record.lockedUntil && record.lockedUntil <= now ? 1 : record.count + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCK_MINUTES * 60000 : 0;
    attempts[key] = { count: lockedUntil ? 0 : count, lockedUntil };
    writeJson(ATTEMPTS_KEY, attempts);
    if (lockedUntil) return { ok: false, reason: "locked", minutesLeft: LOCK_MINUTES };
    return { ok: false, reason: "invalid" };
  }

  delete attempts[key];
  writeJson(ATTEMPTS_KEY, attempts);
  return { ok: true, user: startSession(user) };
}

export function getCurrentUser(): SessionUser | null {
  return readJson<SessionUser | null>(SESSION_KEY, null);
}

export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* bỏ qua */
  }
}
