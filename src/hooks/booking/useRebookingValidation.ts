import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RebookingStatus {
  can_rebook: boolean;
  pending_count: number;
  confirmed_count: number;
  message: string;
}

export const useRebookingValidation = () => {
  const { toast } = useToast();

  const checkRebookingEligibility = async (email: string): Promise<RebookingStatus | null> => {
    try {
      console.log("再予約可否チェック開始:", email);

      const { data, error } = await supabase.rpc('check_rebooking_eligibility', {
        p_email: email
      });

      if (error) {
        console.error("再予約可否チェックエラー:", error);
        throw error;
      }

      const result = data[0] as RebookingStatus;
      console.log("再予約可否チェック結果:", result);

      return result;
    } catch (error: any) {
      console.error("再予約可否チェック処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約状況の確認中にエラーが発生しました",
      });
      return null;
    }
  };

  const cancelExistingPendingAppointments = async (email: string): Promise<number> => {
    try {
      console.log("既存pending予約キャンセル開始:", email);

      const { data, error } = await supabase.rpc('cancel_existing_pending_appointments', {
        p_email: email
      });

      if (error) {
        console.error("既存pending予約キャンセルエラー:", error);
        throw error;
      }

      const cancelledCount = data as number;
      console.log("キャンセルした予約数:", cancelledCount);

      if (cancelledCount > 0) {
        toast({
          title: "既存予約をキャンセルしました",
          description: `申込み中の予約 ${cancelledCount}件を自動的にキャンセルし、新しい予約を受け付けます`,
        });
      }

      return cancelledCount;
    } catch (error: any) {
      console.error("既存pending予約キャンセル処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "既存予約のキャンセル処理中にエラーが発生しました",
      });
      return 0;
    }
  };

  const cancelAppointmentWithReason = async (
    appointmentId: string, 
    cancelReason?: string
  ): Promise<boolean> => {
    try {
      console.log("予約キャンセル開始:", { appointmentId, cancelReason });

      const { data, error } = await supabase.rpc('cancel_appointment_with_reason', {
        p_appointment_id: appointmentId,
        p_cancel_reason: cancelReason
      });

      if (error) {
        console.error("予約キャンセルエラー:", error);
        
        // confirmed状態の予約キャンセル試行の場合は専用メッセージ
        if (error.message.includes('確定済みの予約はキャンセルできません')) {
          toast({
            variant: "destructive",
            title: "キャンセル不可",
            description: "確定済みの予約はキャンセルできません。管理者にお問い合わせください。",
          });
        } else {
          toast({
            variant: "destructive",
            title: "キャンセルエラー",
            description: "予約のキャンセル処理中にエラーが発生しました",
          });
        }
        return false;
      }

      console.log("予約キャンセル成功:", data);
      toast({
        title: "キャンセル完了",
        description: "予約をキャンセルしました",
      });

      return true;
    } catch (error: any) {
      console.error("予約キャンセル処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約のキャンセル処理中にエラーが発生しました",
      });
      return false;
    }
  };

  return {
    checkRebookingEligibility,
    cancelExistingPendingAppointments,
    cancelAppointmentWithReason
  };
};