import { Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const BusinessStatusBanner = () => {
  // 営業時間を取得する関数
  const getBusinessHours = () => {
    const today = new Date();
    const day = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

    switch (day) {
      case 0: // 日曜日
        return "月一度日曜診療あり";
      case 1: // 月曜日
        return "15:00〜19:00";
      case 2: // 火曜日
      case 4: // 木曜日
      case 5: // 金曜日
        return "10:00〜13:30 / 15:00〜19:00";
      case 6: // 土曜日
        return "9:00〜12:30 / 14:00〜17:30";
      default:
        return "10:00〜13:30 / 15:00〜19:00";
    }
  };

  const businessStatus = {
    isOpen: true,
    message: '本日は営業日',
    hours: getBusinessHours()
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Clock className={`h-5 w-5 flex-shrink-0 ${businessStatus.isOpen ? 'text-green-600' : 'text-red-600'}`} />
            <div className="min-w-0">
              <div className={`font-medium text-sm ${businessStatus.isOpen ? 'text-green-800' : 'text-red-800'}`}>
                {businessStatus.message}
              </div>
              <div className="text-xs text-gray-600">
                {businessStatus.hours}
              </div>
            </div>
          </div>
          <Button
            onClick={() => window.open("tel:092-406-2119")}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
          >
            <Phone className="h-4 w-4 mr-1" />
            電話
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessStatusBanner;
