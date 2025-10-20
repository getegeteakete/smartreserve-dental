import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";

const FixedMenuBanner = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* PC用：右側固定メニュー */}
      <div className="hidden md:block fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-blue-600 text-white p-2 rounded-l-lg shadow-lg">
          <Button
            onClick={() => navigate("/treatments")}
            className="bg-transparent hover:bg-blue-700 text-white border-none p-3 writing-mode-vertical-rl text-orientation-mixed"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed"
            }}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-lg font-bold">予約する</span>
          </Button>
        </div>
      </div>

      {/* モバイル用：下部固定メニュー */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-2 gap-0">
          <Button
            onClick={() => navigate("/treatments")}
            className="flex flex-col items-center gap-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none border-r border-blue-500 h-auto"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm font-medium">予約する</span>
          </Button>
          <Button
            onClick={() => window.open("tel:092-406-2119")}
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
