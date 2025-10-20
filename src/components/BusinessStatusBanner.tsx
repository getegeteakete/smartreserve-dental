import { Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const BusinessStatusBanner = () => {
  // 一時的にシンプルな表示に変更
  const businessStatus = {
    isOpen: true,
    message: '本日は営業中',
    nextOpen: null
  };

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
