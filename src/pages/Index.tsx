
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Header from "@/components/Header";
import TreatmentSelection from "@/pages/TreatmentSelection";
import { ensureDefaultTreatments } from "@/utils/defaultTreatmentData";
import { ensureDefaultSchedule } from "@/utils/defaultScheduleData";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // アプリ起動時にデフォルトデータを確保
    ensureDefaultTreatments();
    ensureDefaultSchedule();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16">
        <TreatmentSelection />
      </div>
      
      {/* 管理者ログインボタン */}
      <div className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mx-auto"
          >
            <Shield className="h-4 w-4" />
            管理者ログイン
          </Button>
          <p className="text-xs text-gray-500 mt-2">©合同会社UMA - SmartReserve予約システム</p>
        </div>
      </div>
    </div>
  );
}
