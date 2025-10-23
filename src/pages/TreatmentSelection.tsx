import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BadgeJapaneseYen, Calendar } from "lucide-react";
import { useTreatmentsWithCategories } from "@/hooks/useTreatmentsWithCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import FixedMenuBanner from "@/components/FixedMenuBanner";
import BusinessStatusBanner from "@/components/BusinessStatusBanner";

const TreatmentSelection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { treatments, isLoading, error } = useTreatmentsWithCategories();

  useEffect(() => {
    if (error) {
      console.error("TreatmentSelection - エラーが発生:", error);
    }
  }, [error]);

  const handleBookingClick = (treatment: TreatmentWithCategory) => {
    navigate("/booking", {
      state: {
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        treatmentFee: treatment.fee,
        treatmentDuration: treatment.duration,
        treatmentDescription: treatment.description,
        categoryName: treatment.category?.name || "その他",
      },
    });
  };

  // カテゴリー別に診療メニューを分類
  const categorizeByCategory = (treatments: TreatmentWithCategory[]) => {
    console.log("🔍 TreatmentSelection: カテゴリ化開始", treatments);
    
    // より強力な重複除去: IDと名前の組み合わせで重複をチェック
    const seenTreatments = new Set<string>();
    const uniqueTreatments = treatments.filter((treatment) => {
      const key = `${treatment.id}-${treatment.name}`;
      if (seenTreatments.has(key)) {
        console.log("🚫 重複を検出してスキップ:", treatment.name);
        return false;
      }
      seenTreatments.add(key);
      return true;
    });
    
    console.log("🔍 TreatmentSelection: 重複除去後", uniqueTreatments);

    const categorized: { [key: string]: TreatmentWithCategory[] } = {};
    
    uniqueTreatments.forEach(treatment => {
      const category = treatment.category?.name || "その他";
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      // カテゴリー内でも重複をチェック
      const alreadyExists = categorized[category].some(
        existingTreatment => existingTreatment.id === treatment.id || existingTreatment.name === treatment.name
      );
      
      if (!alreadyExists) {
        categorized[category].push(treatment);
      } else {
        console.log("🚫 カテゴリー内重複を検出してスキップ:", treatment.name, "in", category);
      }
    });

    console.log("🔍 TreatmentSelection: カテゴリ化結果", categorized);
    return categorized;
  };

  const categorizedTreatments = categorizeByCategory(treatments || []);
  
  // 表示するカテゴリーの順序を定義
  const categoryOrder = ["初めての方", "精密検査予約", "ホワイトニング予約", "PMTC予約"];
  
  // 表示対象のカテゴリーを取得（順序を保持）
  const displayCategories = categoryOrder.filter(category => 
    categorizedTreatments[category] && categorizedTreatments[category].length > 0
  );
  
  console.log("🔍 TreatmentSelection: 表示対象カテゴリ", displayCategories);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">診療メニューを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">診療メニューの読み込みに失敗しました</p>
          <Button onClick={() => window.location.reload()}>
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // カテゴリー画像のマッピング
  const categoryImages = {
    "初めての方": "/images/first-time-bg.jpg",
    "精密検査予約": "/images/precision-examination-bg.jpg", 
    "ホワイトニング予約": "/images/whitening-bg.jpg",
    "PMTC予約": "http://xn--68j7a2dtb9053amj1aoqai3wdd676ltle.com/wp-content/uploads/2024/03/touin10.jpg"
  };



  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* 固定カテゴリー選択ヘッダー */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex flex-wrap justify-center gap-2">
              {displayCategories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const element = document.getElementById(`category-${category}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 診療メニュー一覧 */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-8">
            {displayCategories.map((category) => (
              <div key={category} id={`category-${category}`} className="space-y-4">
                {/* カテゴリーヘッダー */}
                <div className="text-center py-4 bg-gray-100 rounded-sm border border-gray-200">
                  {categoryImages[category as keyof typeof categoryImages] && (
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                      <img
                        src={categoryImages[category as keyof typeof categoryImages]}
                        alt={category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {category}
                  </h2>
                </div>
                
                {/* 診療メニュー表示 */}
                <div className="grid gap-4 grid-cols-1">
                  {categorizedTreatments[category].map((treatment) => (
                    <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
                                              <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                            {treatment.name}
                          </CardTitle>
                        </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-sm text-gray-600">
                          {treatment.description || "詳細な説明はお問い合わせください。"}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{treatment.duration}分</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BadgeJapaneseYen className="h-4 w-4" />
                            <span className="font-semibold">
                              {treatment.fee === 0 ? "無料" : `¥${treatment.fee.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookingClick(treatment)}
                            className="w-full flex items-center gap-1"
                          >
                            <Calendar className="h-4 w-4" />
                            予約する
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* 固定メニューバナー - 一時的に無効化 */}
        {/* <FixedMenuBanner /> */}
        
        {/* 営業状況バナー（モバイルのみ） - 一時的に無効化 */}
        {/* <BusinessStatusBanner /> */}
      </div>
    );
  }

  // デスクトップ表示
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">診療メニュー</h1>
          <p className="text-gray-600">ご希望の診療メニューを選択してください</p>
        </div>

        {displayCategories.length > 0 ? (
          <div className="space-y-12">
            {displayCategories.map((category) => (
              <div key={category} className="space-y-6">
                {/* カテゴリーヘッダー */}
                <div className="text-center py-6 bg-gray-100 rounded-sm border border-gray-200">
                  {categoryImages[category as keyof typeof categoryImages] && (
                    <div className="w-full h-[300px] mx-auto mb-4 rounded-none overflow-hidden">
                      <img
                        src={categoryImages[category as keyof typeof categoryImages]}
                        alt={category}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`画像読み込みエラー: ${categoryImages[category as keyof typeof categoryImages]}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {category}
                  </h2>
                </div>
                
                {/* 診療メニュー表示 */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedTreatments[category].map((treatment) => (
                    <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                          {treatment.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-sm text-gray-600">
                          {treatment.description || "詳細な説明はお問い合わせください。"}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{treatment.duration}分</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BadgeJapaneseYen className="h-4 w-4" />
                            <span className="font-semibold">
                              {treatment.fee === 0 ? "無料" : `¥${treatment.fee.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookingClick(treatment)}
                            className="w-full flex items-center gap-1"
                          >
                            <Calendar className="h-4 w-4" />
                            予約する
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">現在、診療メニューを準備中です。</p>
            <p className="text-sm text-gray-500">
              お急ぎの場合は、お電話にてお問い合わせください。
            </p>
          </div>
        )}
        
        {/* 固定メニューバナー - 一時的に無効化 */}
        {/* <FixedMenuBanner /> */}
        
        {/* 営業状況バナー（モバイルのみ） - 一時的に無効化 */}
        {/* <BusinessStatusBanner /> */}
      </div>
    </div>
  );
};

export default TreatmentSelection;