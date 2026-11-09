// Chặn truy cập khi chưa đăng nhập / tránh vào lại Login khi đã đăng nhập
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

// Trang cần đăng nhập (Home, Services, Journey, Profile)
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getCurrentUser()) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: "auth-required" }} />;
  }
  return <>{children}</>;
}

// Trang chỉ dành cho người CHƯA đăng nhập (Welcome, Login, Register)
export function GuestOnly({ children }: { children: ReactNode }) {
  if (getCurrentUser()) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
