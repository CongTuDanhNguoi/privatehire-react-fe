// Lưu dịch vụ người dùng đã chọn để Journey Details hiển thị đúng.
// Giữ trong sessionStorage để F5 không mất lựa chọn.
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { findService, type Service, type ServiceId } from "../data/services";

const STORAGE_KEY = "phc_selected_service";

interface BookingContextValue {
  selectedService: Service | undefined;
  selectService: (id: ServiceId) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function readStored(): ServiceId | null {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY);
    return findService(id) ? (id as ServiceId) : null;
  } catch {
    return null;
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [serviceId, setServiceId] = useState<ServiceId | null>(readStored);

  const selectService = useCallback((id: ServiceId) => {
    setServiceId(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const clearBooking = useCallback(() => {
    setServiceId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
  }, []);

  return (
    <BookingContext.Provider value={{ selectedService: findService(serviceId), selectService, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
