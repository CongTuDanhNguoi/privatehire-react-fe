// Khung điện thoại 390px đặt giữa màn hình máy tính (giống frame Figma)
import type { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
  width?: number;
  height?: number; // chiều cao cố định cho màn Figma tĩnh (size-full)
  minHeight?: number;
  className?: string;
}

export default function MobileFrame({ children, width = 390, height, minHeight = 844, className = "" }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-[#f1f5f9] sm:py-8">
      <div
        className={`relative mx-auto w-full ${className}`}
        style={{ maxWidth: width, height, minHeight: height ? undefined : minHeight }}
      >
        {children}
      </div>
    </div>
  );
}
