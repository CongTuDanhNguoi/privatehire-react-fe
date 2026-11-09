import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BookingProvider } from "./context/BookingContext";
import { seedDemoAccount } from "./services/auth";
import "./index.css";

// Tạo sẵn tài khoản demo: alex.morgan@example.com / Password123
void seedDemoAccount();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <BookingProvider>
        <App />
      </BookingProvider>
    </BrowserRouter>
  </StrictMode>
);
