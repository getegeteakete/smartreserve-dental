
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTreatmentsWithCategories } from "@/hooks/useTreatmentsWithCategories";
import { TreatmentCoursesList } from "./treatment-limits/TreatmentCoursesList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface TreatmentLimit {
  id: string;
  treatment_name: string;
  max_reservations_per_slot: number;
}

interface TreatmentLimitsManagerProps {
  treatmentLimits: TreatmentLimit[];
  onUpdate: (treatmentName: string, maxReservations: number) => Promise<void>;
  onAdd: (treatmentName: string, maxReservations: number) => Promise<void>;
  onDelete: (treatmentName: string) => Promise<void>;
  setTreatmentLimits: React.Dispatch<React.SetStateAction<TreatmentLimit[]>>;
}

export const TreatmentLimitsManager = ({ 
  treatmentLimits, 
  onUpdate, 
  onAdd, 
  onDelete, 
  setTreatmentLimits 
}: TreatmentLimitsManagerProps) => {
  const { treatments, updateTreatment, deleteTreatment, refetch } = useTreatmentsWithCategories();
  const [localTreatmentLimits, setLocalTreatmentLimits] = useState(treatmentLimits);

  console.log("TreatmentLimitsManager - treatmentLimits:", treatmentLimits);
  console.log("TreatmentLimitsManager - treatmentLimits count:", treatmentLimits.length);

  // treatmentLimitsプロパティが変更された時にlocalTreatmentLimitsを同期
  useEffect(() => {
    console.log("TreatmentLimitsManager - treatmentLimitsプロパティ変更:", treatmentLimits);
    setLocalTreatmentLimits(treatmentLimits);
  }, [treatmentLimits]);

  const testFetchTreatmentLimits = async () => {
    try {
      console.log("手動でtreatment_limits取得テスト開始");
      const { data, error } = await (supabase as any).rpc('get_treatment_limits');
      console.log("手動テスト結果:", { data, error });
      
      if (!error && data) {
        setLocalTreatmentLimits(data);
        setTreatmentLimits(data);
      }
    } catch (error) {
      console.error("手動テストエラー:", error);
    }
  };

  const handleMaxReservationsChange = async (id: string, newValue: number) => {
    console.log("🔄 handleMaxReservationsChange開始:", { id, newValue });
    
    // 該当するtreatment_nameを見つけてデータベースに保存
    const treatmentLimit = localTreatmentLimits.find(tl => tl.id === id);
    if (treatmentLimit) {
      console.log("TreatmentLimitsManager - データベース更新開始:", { id, newValue, treatmentName: treatmentLimit.treatment_name });
      try {
        await onUpdate(treatmentLimit.treatment_name, newValue);
        console.log("TreatmentLimitsManager - データベース更新成功");
        
        // 成功後にローカル状態を即座に更新
        const updatedLimit = { ...treatmentLimit, max_reservations_per_slot: newValue };
        setLocalTreatmentLimits(prev => 
          prev.map(tl => 
            tl.id === id ? updatedLimit : tl
          )
        );
        
        setTreatmentLimits(prev => 
          prev.map(tl => 
            tl.id === id ? updatedLimit : tl
          )
        );
        
        console.log("✅ ローカル状態更新完了");
        
      } catch (error) {
        console.error("TreatmentLimitsManager - データベース更新エラー:", error);
      }
    }
  };

  // 治療更新のラッパー関数（強制データ再取得付き）
  const handleTreatmentUpdate = async (treatment: any) => {
    console.log("TreatmentLimitsManager - 治療更新開始:", treatment);
    
    try {
      await updateTreatment(treatment);
      console.log("TreatmentLimitsManager - 治療更新成功、データ再取得開始");
      
      // 強制的にデータを再取得
      await refetch();
      console.log("TreatmentLimitsManager - データ再取得完了");
      
    } catch (error) {
      console.error("TreatmentLimitsManager - 治療更新エラー:", error);
      throw error; // エラーを子コンポーネントに伝播
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>診療種別ごとの予約制限設定</CardTitle>
        <CardDescription>
          各診療種別について、同じ時間枠での最大予約人数を設定できます。診療内容の詳細（料金・時間・説明）も編集可能です。
        </CardDescription>
        <div className="flex gap-2">
          <Button onClick={testFetchTreatmentLimits} variant="outline" size="sm">
            🔧 治療制限データを手動取得
          </Button>
          <span className="text-sm text-gray-600">
            現在の制限データ数: {localTreatmentLimits.length}件
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TreatmentCoursesList
          treatments={treatments}
          treatmentLimits={localTreatmentLimits}
          onUpdate={onUpdate}
          onAdd={onAdd}
          onDelete={onDelete}
          onMaxReservationsChange={handleMaxReservationsChange}
          onTreatmentUpdate={handleTreatmentUpdate}
          onTreatmentDelete={deleteTreatment}
        />
      </CardContent>
    </Card>
  );
};
