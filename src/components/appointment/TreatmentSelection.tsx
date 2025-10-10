
import { useTreatmentsWithCategories } from "@/hooks/useTreatmentsWithCategories";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface TreatmentSelectionProps {
  selectedTreatment: string | undefined;
  onTreatmentSelect: (treatment: string) => void;
  fee: number;
  // 親から診療データを直接受け取る
  treatmentData?: {
    id: string;
    name: string;
    fee: number;
    duration: number;
    description?: string;
  };
}

const TreatmentSelection = ({
  selectedTreatment,
  onTreatmentSelect,
  fee,
  treatmentData,
}: TreatmentSelectionProps) => {
  const { treatments = [], isLoading, error } = useTreatmentsWithCategories();
  
  console.log("診療メニューリスト:", treatments);
  console.log("選択中の診療メニュー:", selectedTreatment);
  console.log("親から受け取った診療データ:", treatmentData);

  // 診療メニューが読み込まれたら通知する
  useEffect(() => {
    if (treatments && treatments.length > 0) {
      console.log(`${treatments.length}件の診療メニューを読み込みました`);
    }
  }, [treatments]);

  // エラーが発生した場合に通知する
  useEffect(() => {
    if (error) {
      toast.error("診療メニューの読み込みに失敗しました", {
        description: error instanceof Error ? error.message : "データを取得できません"
      });
    }
  }, [error]);

  // 選択された診療内容を取得（親からのデータを優先、なければDBから検索）
  const selectedTreatmentData = treatmentData || 
    (selectedTreatment ? treatments.find((treatment) => treatment.id === selectedTreatment) : null);

  console.log("表示用選択された診療データ:", selectedTreatmentData);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">診療内容</label>
      {isLoading ? (
        <div className="flex items-center text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          診療メニューを読み込み中...
        </div>
      ) : error ? (
        <div className="flex items-center text-sm text-red-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          エラーが発生しました: {error instanceof Error ? error.message : "データを取得できません"}
        </div>
      ) : selectedTreatmentData ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-white font-medium">
            {selectedTreatmentData.name}
          </div>
          <div className="text-gray-200 text-sm">
            {selectedTreatmentData.duration}分 - ¥{selectedTreatmentData.fee.toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-sm text-red-500">
          診療メニューが見つかりません
          {selectedTreatment && (
            <div className="text-xs text-gray-500 mt-1">
              ID: {selectedTreatment}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TreatmentSelection;
