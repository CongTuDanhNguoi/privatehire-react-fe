// Màn Home — dùng nguyên code Figma "1. Home" (6:1028), chỉ gắn hành động bấm.
import { useNavigate } from "react-router-dom";
import FigmaClickable from "../components/FigmaClickable";
import MobileFrame from "../components/MobileFrame";
import HomeScreen from "../screens/home/Component1Home";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <MobileFrame height={952}>
      <FigmaClickable
        actions={{
          "6:1101": () => navigate("/services"), // Book a Ride
          "6:1115": () => navigate("/services"), // View All Services
          "6:1030": () => navigate("/home"), // tab Home
          "6:1051": () => navigate("/profile"), // tab Profile
        }}
      >
        <HomeScreen />
      </FigmaClickable>
    </MobileFrame>
  );
}
