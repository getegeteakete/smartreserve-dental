
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PhoneFooter() {
  const isMobile = useIsMobile();
  const [phoneStatus, setPhoneStatus] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [showDetails, setShowDetails] = useState(false);

  const getPhoneStatus = () => {
    const now = new Date();
    const day = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute; // minutes from midnight

    let isOpen = false;
    let message = "";

    switch (day) {
      case 0: // Sunday
        // Check if it's the monthly Sunday clinic day (simplified - assumes first Sunday of month)
        const firstSunday = new Date(now.getFullYear(), now.getMonth(), 1);
        while (firstSunday.getDay() !== 0) {
          firstSunday.setDate(firstSunday.getDate() + 1);
        }
        if (now.getDate() === firstSunday.getDate()) {
          // Monthly Sunday clinic (assuming same hours as Saturday)
          isOpen = (currentTime >= 9 * 60 && currentTime < 12 * 60 + 30) || 
                   (currentTime >= 14 * 60 && currentTime < 17 * 60 + 30);
          message = isOpen ? "診療中" : "診療時間外";
        } else {
          message = "診療時間外";
        }
        break;
      case 1: // Monday
        // Monday afternoon only: 15:00-19:00
        isOpen = currentTime >= 15 * 60 && currentTime < 19 * 60;
        message = isOpen ? "診療中" : "診療時間外";
        break;
      case 2: // Tuesday
      case 3: // Wednesday  
      case 5: // Friday
        // 10:00-13:30, 15:00-19:00
        isOpen = (currentTime >= 10 * 60 && currentTime < 13 * 60 + 30) || 
                 (currentTime >= 15 * 60 && currentTime < 19 * 60);
        message = isOpen ? "診療中" : "診療時間外";
        break;
      case 4: // Thursday
        // Check if there's a holiday in the week
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        let hasHolidayThisWeek = false; // You can implement holiday checking logic here
        
        if (hasHolidayThisWeek) {
          // Same hours as Tuesday/Wednesday/Friday
          isOpen = (currentTime >= 10 * 60 && currentTime < 13 * 60 + 30) || 
                   (currentTime >= 15 * 60 && currentTime < 19 * 60);
          message = isOpen ? "診療中" : "診療時間外";
        } else {
          message = "診療時間外";
        }
        break;
      case 6: // Saturday
        // 9:00-12:30, 14:00-17:30
        isOpen = (currentTime >= 9 * 60 && currentTime < 12 * 60 + 30) || 
                 (currentTime >= 14 * 60 && currentTime < 17 * 60 + 30);
        message = isOpen ? "診療中" : "診療時間外";
        break;
    }

    return { isOpen, message };
  };

  useEffect(() => {
    const updatePhoneStatus = () => {
      setPhoneStatus(getPhoneStatus());
    };

    updatePhoneStatus();
    const interval = setInterval(updatePhoneStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isMobile) {
    return (
      <>
        {/* スマホ用コンパクトフッター */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between py-2 px-3">
            {/* 左側：電話で予約・相談と営業状況を横並び */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">電話で予約・相談</span>
              <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                phoneStatus.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                【{phoneStatus.message}】
              </div>
            </div>
            
            {/* 右側：営業時間詳細ボタンと電話ボタン */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 px-2 py-1 h-8 text-xs"
              >
                <Clock className="h-3 w-3" />
                <span>詳細</span>
                {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
              
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-xs"
              >
                <a href="tel:092-406-2119">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>電話</span>
                </a>
              </Button>
            </div>
          </div>

          {/* 診療時間詳細（展開時） */}
          {showDetails && (
            <div className="border-t border-gray-200 py-2 px-3 bg-gray-50">
              <div className="text-xs text-gray-700 space-y-1">
                <div><strong>月：</strong>午前休診/15:00~19:00</div>
                <div><strong>火水金：</strong>10:00~13:30/15:00~19:00</div>
                <div><strong>土：</strong>9:00~12:30/14:00~17:30</div>
                <div><strong>休診：</strong>月午前・木・日・祝日</div>
                <div className="text-blue-600"><strong>※</strong>祝日週の木曜は診療・月1日曜診療</div>
              </div>
            </div>
          )}
        </div>
        
        {/* スマホ用スペーサー（高さを大幅に削減） */}
        <div className={showDetails ? "h-20" : "h-12"}></div>
      </>
    );
  }

  // PC用フッター
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">診療時間のご案内</span>
                {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <a href="tel:092-406-2119" className="text-sm font-medium text-blue-600 hover:text-blue-700 underline">
                  092-406-2119
                </a>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  phoneStatus.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {phoneStatus.message}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Button
                asChild
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <a href="tel:092-406-2119">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">電話相談</span>
                </a>
              </Button>
            </div>
          </div>

          {/* 詳細情報の展開部分 */}
          {showDetails && (
            <div className="border-t border-gray-200 py-3">
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>月曜日：</strong>午前中休診 / 15:00~19:00</div>
                <div><strong>火・水・金：</strong>10:00~13:30 / 15:00~19:00</div>
                <div><strong>土曜日：</strong>9:00~12:30 / 14:00~17:30</div>
                <div><strong>休診日：</strong>月曜午前・木・日・祝日</div>
                <div className="text-blue-600"><strong>※</strong>祝日がある週の木曜日は診療します</div>
                <div className="text-blue-600"><strong>※</strong>月一度日曜も診療しております</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* PC用スペーサー */}
      <div className={showDetails ? "h-32" : "h-16"}></div>
    </>
  );
}
