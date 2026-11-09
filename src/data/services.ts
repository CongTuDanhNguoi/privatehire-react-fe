// Mock data: 6 dịch vụ trên màn "2.1 SERVICE SELECTION" (đúng chữ theo thiết kế)
import type { IconName } from "../components/Icon";

export type ServiceId =
  | "local-travel"
  | "long-distance"
  | "airport-transfer"
  | "hotel-transfer"
  | "airport-meet-greet"
  | "daily-hire";

export interface Service {
  id: ServiceId;
  title: string;
  description: string;
  icon: IconName;
}

export const SERVICES: Service[] = [
  { id: "local-travel", title: "Local Travel", description: "Short point-to-point urban rides", icon: "car" },
  { id: "long-distance", title: "Long-Distance", description: "Inter-city & cross-country journeys", icon: "route" },
  { id: "airport-transfer", title: "Airport Transfer", description: "Direct curbside flight connections", icon: "planeTakeoff" },
  { id: "hotel-transfer", title: "Hotel Transfer", description: "Seamless luxury luggage handling", icon: "bed" },
  { id: "airport-meet-greet", title: "Airport Meet & Greet", description: "Arrival hall concierge & porterage", icon: "mapPin" },
  { id: "daily-hire", title: "Driver & Car Daily Hire", description: "Private driver and vehicle for a selected hire period.", icon: "clock" },
];

export const findService = (id: string | null | undefined): Service | undefined =>
  SERVICES.find((s) => s.id === id);
