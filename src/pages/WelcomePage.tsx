// Màn Welcome — dùng nguyên code Figma "1. Welcome Screen" (6:407), chỉ gắn hành động bấm.
import { useNavigate } from "react-router-dom";
import FigmaClickable from "../components/FigmaClickable";
import MobileFrame from "../components/MobileFrame";
import WelcomeScreen from "../screens/registration/Component1WelcomeScreen";

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <MobileFrame width={477} height={982}>
      <FigmaClickable
        actions={{
          "6:470": () => navigate("/register"), // Sign Up
          "6:476": () => navigate("/login"), // Log In
        }}
      >
        <WelcomeScreen />
      </FigmaClickable>
    </MobileFrame>
  );
}
