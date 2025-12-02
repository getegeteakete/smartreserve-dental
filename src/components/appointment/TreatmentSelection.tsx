
import { useTreatmentsWithCategories } from "@/hooks/useTreatmentsWithCategories";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  // スクロール処理用のコールバック
  onScrollToTop?: () => void;
}

const TreatmentSelection = ({
  selectedTreatment,
  onTreatmentSelect,
  fee,
  treatmentData,
  onScrollToTop,
}: TreatmentSelectionProps) => {
  const { treatments = [], isLoading, error } = useTreatmentsWithCategories();
  // 診療メニューが確定されたかどうかを管理
  const [isTreatmentLocked, setIsTreatmentLocked] = useState(false);
  
  console.log("診療メニューリスト:", treatments);
  console.log("選択中の診療メニュー:", selectedTreatment);
  console.log("親から受け取った診療データ:", treatmentData);

  // treatmentDataが渡されている場合（他のページから遷移してきた場合）は自動的にロック
  useEffect(() => {
    if (treatmentData) {
      setIsTreatmentLocked(true);
    }
  }, [treatmentData]);

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

  // 診療メニューを選択する
  const handleTreatmentSelect = (treatmentId: string) => {
    onTreatmentSelect(treatmentId);
    
    // 診療メニューを選択したら、少し遅延してカレンダーへスクロール
    setTimeout(() => {
      if (onScrollToTop) {
        onScrollToTop();
      }
    }, 300);
  };

  // 診療メニューの選択を確定する
  const handleConfirmSelection = () => {
    if (selectedTreatment) {
      setIsTreatmentLocked(true);
      toast.success("診療メニューを確定しました", {
        description: "予約日時を選択してください"
      });
      
      // カレンダー（予約日時選択）へスクロール
      setTimeout(() => {
        if (onScrollToTop) {
          // 親コンポーネントで定義されたスクロール処理を実行（カレンダーへスクロール）
          onScrollToTop();
        } else {
          // フォールバック: ページ上部へスクロール
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 600);
    }
  };

  // 選択された診療内容を取得（親からのデータを優先、なければDBから検索）
  const selectedTreatmentData = treatmentData || 
    (selectedTreatment ? treatments.find((treatment) => treatment.id === selectedTreatment) : null);

  console.log("表示用選択された診療データ:", selectedTreatmentData);

  // カテゴリー画像のマッピング
  const categoryImages = {
    "初めての方": "/images/first-time-bg.jpg",
    "精密検査予約": "/images/precision-examination-bg.jpg", 
    "ホワイトニング予約": "/images/whitening-bg.jpg",
    "PMTC予約": "/images/first-time-bg.jpg"
  };

  // カテゴリー名を取得
  const getCategoryName = (treatmentName: string) => {
    if (treatmentName.includes("初診") || treatmentName.includes("相談")) return "初めての方";
    if (treatmentName.includes("精密検査")) return "精密検査予約";
    if (treatmentName.includes("ホワイトニング")) return "ホワイトニング予約";
    if (treatmentName.includes("PMTC")) return "PMTC予約";
    return "初めての方"; // デフォルト
  };

  const categoryName = selectedTreatmentData ? getCategoryName(selectedTreatmentData.name) : "初めての方";
  const categoryImage = categoryImages[categoryName as keyof typeof categoryImages];

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-slate-800">診療内容 *</label>
      {isLoading ? (
        <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg">
          <div className="flex items-center text-slate-600">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            診療メニューを読み込み中...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-3 h-5 w-5" />
            エラーが発生しました: {error instanceof Error ? error.message : "データを取得できません"}
          </div>
        </div>
      ) : isTreatmentLocked && selectedTreatmentData ? (
        // 確定後の表示（変更不可）
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* カテゴリー画像 */}
          {categoryImage && (
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
              <img 
                src={categoryImage} 
                alt={categoryName}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  // 画像読み込みエラー時のフォールバック
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">{categoryName}</h3>
              </div>
            </div>
          )}
          
          {/* 診療内容詳細 */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-slate-800 mb-2">
                  {selectedTreatmentData.name}
                </h4>
                {selectedTreatmentData.description && (
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedTreatmentData.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{selectedTreatmentData.fee.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">料金</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedTreatmentData.duration}分
                  </div>
                  <div className="text-xs text-slate-500">診療時間</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="h-4 w-4" />
                <span>確定済み</span>
              </div>
            </div>
          </div>
        </div>
      ) : !isTreatmentLocked ? (
        // 診療メニュー選択UI
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((treatment) => (
              <Card
                key={treatment.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTreatment === treatment.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => handleTreatmentSelect(treatment.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{treatment.name}</h4>
                    {selectedTreatment === treatment.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {treatment.description && (
                    <p className="text-sm text-slate-600 mb-3">{treatment.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                      <span>¥{treatment.fee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <span>{treatment.duration}分</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedTreatment && (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                onClick={handleConfirmSelection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg"
              >
                この診療メニューで確定する
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800 font-medium">診療メニューを選択してください</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentSelection;
