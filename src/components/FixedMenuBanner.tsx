import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const FixedMenuBanner = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    try {
      navigate("/treatments");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return null;
};

export default FixedMenuBanner;
