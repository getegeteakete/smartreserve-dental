import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TokenValidationResult {
  is_valid: boolean;
  email: string | null;
  appointment_id: string | null;
  type: string | null;
  error_message: string | null;
}

export const useAppointmentTokens = () => {
  const { toast } = useToast();

  const generateTokens = async (email: string, appointmentId: string) => {
    try {
      // キャンセル用トークン生成
      const { data: cancelToken, error: cancelError } = await supabase.rpc('generate_appointment_token', {
        p_email: email,
        p_appointment_id: appointmentId,
        p_type: 'cancel'
      });

      if (cancelError) {
        console.error("キャンセルトークン生成エラー:", cancelError);
        throw cancelError;
      }

      // 再予約用トークン生成
      const { data: rebookToken, error: rebookError } = await supabase.rpc('generate_appointment_token', {
        p_email: email,
        p_appointment_id: appointmentId,
        p_type: 'rebook'
      });

      if (rebookError) {
        console.error("再予約トークン生成エラー:", rebookError);
        throw rebookError;
      }
      
      return {
        cancelToken: cancelToken as string,
        rebookToken: rebookToken as string
      };
    } catch (error: any) {
      console.error("トークン生成処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約管理トークンの生成に失敗しました",
      });
      return null;
    }
  };

  const validateToken = async (token: string): Promise<TokenValidationResult | null> => {
    try {
      const { data, error } = await supabase.rpc('validate_appointment_token', {
        p_token: token
      });

      if (error) {
        console.error("トークン検証エラー:", error);
        throw error;
      }

      const result = data[0] as TokenValidationResult;

      if (!result.is_valid && result.error_message) {
        toast({
          variant: "destructive",
          title: "アクセスエラー",
          description: result.error_message,
        });
      }

      return result;
    } catch (error: any) {
      console.error("トークン検証処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "アクセス権限の確認に失敗しました",
      });
      return null;
    }
  };

  const markTokenAsUsed = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('mark_token_as_used', {
        p_token: token
      });

      if (error) {
        console.error("トークン使用済みマークエラー:", error);
        throw error;
      }

      return data as boolean;
    } catch (error: any) {
      console.error("トークン使用済みマーク処理エラー:", error);
      return false;
    }
  };

  return {
    generateTokens,
    validateToken,
    markTokenAsUsed
  };
};