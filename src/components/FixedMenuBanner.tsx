import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";

const FixedMenuBanner = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    try {
      navigate("/treatments");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handlePhoneClick = () => {
    try {
      window.open("tel:092-406-2119");
    } catch (error) {
      console.error("Phone call error:", error);
    }
  };

  return (
    <>
      {/* モバイル用：下部固定メニューのみ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-2 gap-0">
          <Button
            onClick={handleBookingClick}
            className="flex flex-col items-center gap-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none border-r border-blue-500 h-auto"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm font-medium">予約する</span>
          </Button>
          <Button
            onClick={handlePhoneClick}
            className="flex flex-col items-center gap-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-none h-auto"
          >
            <Phone className="h-6 w-6" />
            <span className="text-sm font-medium">電話する</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default FixedMenuBanner;
