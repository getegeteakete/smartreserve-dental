
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Header from "@/components/Header";
import TreatmentSelection from "@/pages/TreatmentSelection";
import { ensureDefaultTreatments, forceUpdateDefaultTreatments } from "@/utils/defaultTreatmentData";
import { ensureDefaultSchedule } from "@/utils/defaultScheduleData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatSettings } from "@/hooks/useSystemSettings";
import { AIChatBot } from "@/components/chat/AIChatBot";
import { StaffConnectionDialog } from "@/components/chat/StaffConnectionDialog";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const { isChatEnabled } = useChatSettings();

  useEffect(() => {
    // アプリ起動時にデフォルトデータを確保
    const initializeData = async () => {
      await ensureDefaultTreatments();
      await ensureDefaultSchedule();
      
      // 5秒後に診療メニューが表示されていない場合は強制更新を試す
      setTimeout(async () => {
        console.log("診療メニューの強制更新を試行します");
        await forceUpdateDefaultTreatments();
      }, 5000);
    };
    
    initializeData();
  }, []);

  const handleBookingRequest = (data: any) => {
    // 予約画面に遷移し、抽出されたデータを渡す
    navigate('/booking', { 
      state: { 
        aiBookingData: data,
        fromAI: true 
      } 
    });
  };

  const handleStaffConnection = () => {
    setShowStaffDialog(true);
  };

  const handlePhoneCall = (staffId?: string) => {
    // 実際の実装では、電話システムと連携
    alert(`スタッフ（ID: ${staffId || 'default'}）にお電話をおかけします`);
  };

  const handleStaffChatStart = (staffId: string) => {
    // スタッフとのチャットを開始
    alert(`スタッフ（ID: ${staffId}）とのチャットを開始します`);
  };

  const handleViewMyPage = () => {
    // マイページへ遷移
    navigate('/mypage');
  };

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
          <p className="text-xs text-gray-500 mt-2">SmartReserve予約システム</p>
        </div>
      </div>

      {/* AIチャットボット（設定で有効な場合のみ表示） */}
      {isChatEnabled && (
        <>
          <AIChatBot
            onBookingRequest={handleBookingRequest}
            onStaffConnection={handleStaffConnection}
            onPhoneCall={handlePhoneCall}
            onViewMyPage={handleViewMyPage}
          />

          {/* スタッフ接続ダイアログ */}
          <StaffConnectionDialog
            open={showStaffDialog}
            onOpenChange={setShowStaffDialog}
            onPhoneCall={handlePhoneCall}
            onChatStart={handleStaffChatStart}
          />
        </>
      )}

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
}
