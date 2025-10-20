import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TreatmentWithCategory {
  id: string;
  name: string;
  description: string | null;
  fee: number;
  duration: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    display_order: number;
  };
}

export const useTreatmentsWithCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: treatments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["treatments-with-categories"],
    queryFn: async () => {
      try {
        // 診療メニューを取得
        const { data, error } = await supabase
          .from("treatments")
          .select(`
            *,
            category:treatment_categories(*)
          `)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        // 重複を除去してから返す
        const uniqueTreatments = data ? data.filter((treatment, index, self) => 
          index === self.findIndex(t => t.id === treatment.id)
        ) : [];
        
        // データが存在しない場合のみデフォルトデータを確保
        if (!uniqueTreatments || uniqueTreatments.length === 0) {
          // デフォルトデータを確保する処理は別の関数で実行
          // この関数内では単純にデータを取得するのみ
          return [];
        }
        
        return uniqueTreatments as TreatmentWithCategory[];
      } catch (error) {
        console.error("診療メニュー取得中にエラーが発生しました:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // キャッシュを無効化して常に最新データを取得
    gcTime: 0, // メモリキャッシュも無効化 (React Query v5ではcacheTimeからgcTimeに変更)
    refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
  });

  const createTreatmentMutation = useMutation({
    mutationFn: async (treatmentData: Omit<TreatmentWithCategory, "id" | "created_at" | "updated_at" | "category">) => {
      // データ検証
      if (!treatmentData.name?.trim()) {
        throw new Error("メニュー名は必須です");
      }
      
      const cleanData = {
        name: treatmentData.name.trim(),
        description: treatmentData.description?.trim() || null,
        fee: Number(treatmentData.fee) || 0,
        duration: Number(treatmentData.duration) || 30,
        category_id: treatmentData.category_id === "" || treatmentData.category_id === "none" ? null : treatmentData.category_id,
      };
      
      const { data, error } = await supabase
        .from("treatments")
        .insert([cleanData])
        .select(`
          *,
          category:treatment_categories(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message || "診療メニューの作成に失敗しました");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments-with-categories"] });
      toast({
        title: "成功",
        description: "診療メニューを作成しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "診療メニューの作成に失敗しました",
        variant: "destructive",
      });
    },
  });

  const updateTreatmentMutation = useMutation({
    mutationFn: async (treatmentData: TreatmentWithCategory) => {
      // データ検証
      if (!treatmentData.name?.trim()) {
        throw new Error("メニュー名は必須です");
      }
      
      if (!treatmentData.id) {
        throw new Error("更新対象のIDが見つかりません");
      }
      
      const fee = Number(treatmentData.fee);
      const duration = Number(treatmentData.duration);
      
      if (isNaN(fee) || fee < 0) {
        throw new Error("料金は0以上の数値で入力してください");
      }
      
      if (isNaN(duration) || duration < 1) {
        throw new Error("所要時間は1分以上で入力してください");
      }
      
      const updateData = {
        name: treatmentData.name.trim(),
        description: treatmentData.description?.trim() || null,
        fee: fee,
        duration: duration,
        category_id: treatmentData.category_id === "" || treatmentData.category_id === "none" ? null : treatmentData.category_id,
      };

      const { data, error } = await supabase
        .from("treatments")
        .update(updateData)
        .eq("id", treatmentData.id)
        .select(`
          *,
          category:treatment_categories(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message || "診療メニューの更新に失敗しました");
      }
      
      if (!data) {
        throw new Error("更新対象の診療メニューが見つかりません");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments-with-categories"] });
      toast({
        title: "成功",
        description: "診療メニューを更新しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "診療メニューの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const deleteTreatmentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ 治療メニューを削除中:", id);
      
      const { error } = await supabase
        .from("treatments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("🗑️ 削除エラー:", error);
        throw error;
      }
      
      console.log("🗑️ データベースから削除完了:", id);
    },
    onSuccess: () => {
      // 全てのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["treatments-with-categories"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["treatment-categories"] });
      
      // ページリロードを削除 - キャッシュの無効化のみで十分
      console.log("🗑️ キャッシュを無効化しました");
      
      toast({
        title: "成功",
        description: "診療メニューを削除しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "診療メニューの削除に失敗しました",
        variant: "destructive",
      });
    },
  });

  return {
    treatments,
    isLoading,
    error,
    refetch,
    createTreatment: createTreatmentMutation.mutate,
    updateTreatment: updateTreatmentMutation.mutate,
    deleteTreatment: deleteTreatmentMutation.mutateAsync,
    isCreating: createTreatmentMutation.isPending,
    isUpdating: updateTreatmentMutation.isPending,
    isDeleting: deleteTreatmentMutation.isPending,
  };
};
