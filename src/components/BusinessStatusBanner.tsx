import { useState, useEffect } from "react";
import { getTodayBusinessStatus } from "@/utils/businessDayDisplay";
import { Clock, Phone } from "lucide-react";

interface BusinessStatus {
  isOpen: boolean;
  message: string;
  nextOpen: string | null;
}

const BusinessStatusBanner = () => {
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = getTodayBusinessStatus();
      setBusinessStatus(status);
    };

    // 初期表示
    updateStatus();

    // 1分ごとに更新
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!businessStatus) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${businessStatus.isOpen ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <div className={`font-medium text-sm ${businessStatus.isOpen ? 'text-green-800' : 'text-red-800'}`}>
                {businessStatus.message}
              </div>
              {businessStatus.nextOpen && (
                <div className="text-xs text-gray-600">
                  {businessStatus.nextOpen}
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => window.open("tel:092-406-2119")}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
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
