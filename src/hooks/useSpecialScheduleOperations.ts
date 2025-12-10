
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSpecialScheduleOperations = () => {
  const { toast } = useToast();

  const handleSpecialScheduleToggle = async (scheduleId: string, isAvailable: boolean) => {
    try {
      console.log("特別診療日更新処理開始:", scheduleId, isAvailable);
      
      const { error } = await (supabase as any).rpc('update_special_clinic_schedule', {
        p_id: scheduleId,
        p_is_available: isAvailable
      });

      if (error) {
        console.error("特別診療日更新エラー:", error);
        throw error;
      }

      console.log("特別診療日更新成功");
      toast({
        title: "更新完了",
        description: "特別診療日が更新されました",
      });
    } catch (error: any) {
      console.error("特別診療日更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `特別診療日の更新に失敗しました: ${error.message}`,
      });
      throw error;
    }
  };

  const handleSpecialScheduleDelete = async (scheduleId: string) => {
    try {
      console.log("特別診療日削除処理開始:", scheduleId);
      
      const { data, error } = await (supabase as any).rpc('delete_special_clinic_schedule', {
        p_id: scheduleId
      });

      if (error) {
        console.error("特別診療日削除RPC呼び出しエラー:", error);
        throw error;
      }

      console.log("特別診療日削除RPC呼び出し成功:", data);
      
      // データベースから実際に削除されたか確認
      const { data: checkData, error: checkError } = await supabase
        .from('special_clinic_schedules')
        .select('id')
        .eq('id', scheduleId);

      if (checkError) {
        console.error("削除確認エラー:", checkError);
      } else {
        console.log("削除確認結果:", checkData);
        if (checkData && checkData.length === 0) {
          console.log("特別診療日が正常に削除されました");
        } else {
          console.warn("特別診療日の削除が完了していない可能性があります");
        }
      }
      
      toast({
        title: "削除完了",
        description: "特別診療日が削除されました",
      });
    } catch (error: any) {
      console.error("特別診療日削除処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `特別診療日の削除に失敗しました: ${error.message}`,
      });
      throw error;
    }
  };

  return {
    handleSpecialScheduleToggle,
    handleSpecialScheduleDelete,
  };
};
