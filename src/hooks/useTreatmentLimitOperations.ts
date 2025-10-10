
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTreatmentLimitOperations = () => {
  const { toast } = useToast();

  const handleTreatmentLimitUpdate = async (treatmentName: string, maxReservations: number) => {
    try {
      console.log("handleTreatmentLimitUpdate開始:", { treatmentName, maxReservations });
      
      const { error } = await (supabase as any).rpc('upsert_treatment_limit', {
        p_treatment_name: treatmentName,
        p_max_reservations: maxReservations
      });

      console.log("upsert_treatment_limit結果:", { error });

      if (error) throw error;

      console.log("治療制限更新成功:", { treatmentName, maxReservations });
      
      toast({
        title: "更新完了",
        description: "診療種別の予約制限が更新されました",
      });
    } catch (error: any) {
      console.error("診療種別制限更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `診療種別制限の更新に失敗しました: ${error.message}`,
      });
    }
  };

  const handleTreatmentLimitDelete = async (treatmentName: string) => {
    try {
      const { error } = await (supabase as any).rpc('delete_treatment_limit', {
        p_treatment_name: treatmentName
      });

      if (error) throw error;

      toast({
        title: "削除完了",
        description: "診療種別の予約制限が削除されました",
      });
    } catch (error: any) {
      console.error("診療種別制限削除エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `診療種別制限の削除に失敗しました: ${error.message}`,
      });
    }
  };

  return {
    handleTreatmentLimitUpdate,
    handleTreatmentLimitDelete,
  };
};
