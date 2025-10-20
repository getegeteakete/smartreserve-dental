
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
    // 診療データを確実に渡すためのオブジェクト作成
    const treatmentData = {
      id: treatment.id,
      name: treatment.name,
      fee: treatment.fee,
      duration: treatment.duration,
      description: treatment.description,
      category: treatment.category
    };
    
    // stateを確実に渡す
    navigate("/booking", { 
      state: { 
        selectedTreatment: treatment.id,
        treatmentData: treatmentData
      },
      replace: false
    });
  };

  // カテゴリー別にグループ化する関数
  const categorizeByCategory = (treatments: TreatmentWithCategory[]) => {
    console.log("🔍 TreatmentSelection: カテゴリ化開始", treatments);
    
    // 重複を除去（名前ベースで判定）
    const uniqueTreatments = treatments.filter((treatment, index, self) => 
      index === self.findIndex(t => t.name === treatment.name)
    );
    
    console.log("🔍 TreatmentSelection: 重複除去後", uniqueTreatments);
    
    return uniqueTreatments.reduce((acc: Record<string, TreatmentWithCategory[]>, treatment) => {
      let categoryName: string;
      
      // カテゴリが設定されている場合はそれを使用
      if (treatment.category?.name) {
        categoryName = treatment.category.name;
      } else {
      // カテゴリが設定されていない場合は名前から推測
      const name = treatment.name;
      if (name.includes('初診') || name.includes('初心')) {
        categoryName = '初めての方';
      } else if (name.includes('精密検査')) {
        categoryName = '精密検査予約';
      } else if (name.includes('ホワイトニング')) {
        categoryName = 'ホワイトニング予約';
      } else if (name.includes('PMTC') || name.includes('クリーニング')) {
        categoryName = 'PMTC予約';
      } else if (name.includes('矯正')) {
        categoryName = '矯正歯科';
      } else {
        // どのカテゴリにも当てはまらない場合は「初めての方」として分類
        categoryName = '初めての方';
      }
      }
      
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(treatment);
      return acc;
    }, {});
  };

  // カテゴリー別に診療メニューをグループ化
  const categorizedTreatments = categorizeByCategory(treatments);
  console.log("🔍 TreatmentSelection: カテゴリ化結果", categorizedTreatments);

  // カテゴリーの表示順序を固定
  const categoryOrder = ["初めての方", "精密検査予約", "ホワイトニング予約", "PMTC予約"];
  
  // 存在するカテゴリのみを順序通りに取得
  const orderedCategories = categoryOrder.filter(category => categorizedTreatments[category]);
  console.log("🔍 TreatmentSelection: 表示対象カテゴリ", orderedCategories);

  // カテゴリーセクションにスクロールする関数
  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // エラー状態の処理
  if (error) {
    console.error("TreatmentSelection - エラー表示:", error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">診療メニューの取得中にエラーが発生しました。</p>
          <p className="text-sm text-gray-500">{error.message || "不明なエラーです。"}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // ローディング状態の処理
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">診療メニューを読み込み中...</p>
        </div>
      </div>
    );
  }

  // データが空の場合の処理
  if (!treatments || treatments.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-600">診療メニューが見つかりません。</p>
          <p className="text-sm text-gray-500 mt-2">管理者にお問い合わせください。</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // カテゴリー画像のマッピング
  const categoryImages = {
    "初診": "/lovable-uploads/23dd7cf2-1136-4319-a747-b59ff65618a9.png",
    "精密検査": "/lovable-uploads/70893a9e-d0ea-49bd-ba4b-f6b20d984c28.png", 
    "ホワイトニング": "/lovable-uploads/b3452854-e2f9-4414-b8fd-41f432c466ff.png",
    "PMTC": "/lovable-uploads/87d8b2fd-ead0-49b4-bb0e-89abad0f0380.png"
  };



  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* 固定カテゴリー選択ヘッダー */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex flex-wrap justify-center gap-2">
              {orderedCategories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => scrollToCategory(category)}
                  size="sm"
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* スクロール可能なコンテンツ部分 */}
        <ScrollArea className="flex-1 px-4">
          <div className="pb-32">
            {/* カテゴリーごとの表示 */}
            {orderedCategories.map((category) => (
              <div key={category} id={`category-${category}`} className="mb-8">
                {/* カテゴリーの見出し画像とタイトル */}
                <div className="text-center mb-6">
                  {categoryImages[category as keyof typeof categoryImages] && (
                    <div className="w-full max-w-lg mx-auto h-48 mb-4 overflow-hidden rounded-lg">
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

            {orderedCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">現在、診療メニューを準備中です。</p>
                <p className="text-sm text-gray-500">
                  お急ぎの場合は、お電話にてお問い合わせください。
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 固定カテゴリー選択ヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm -mx-4 px-4 py-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {orderedCategories.map((category) => (
            <Button
              key={category}
              variant="outline"
              onClick={() => scrollToCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* カテゴリーごとの表示 */}
      {orderedCategories.map((category) => (
        <div key={category} id={`category-${category}`} className="mb-12">
          {/* カテゴリーの見出し画像とタイトル */}
          <div className="text-center mb-8">
            {categoryImages[category as keyof typeof categoryImages] && (
              <div className="w-full max-w-2xl mx-auto h-64 mb-6 overflow-hidden rounded-lg">
                <img
                  src={categoryImages[category as keyof typeof categoryImages]}
                  alt={category}
                  className="w-full h-full object-cover"
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
                  <CardTitle className="text-xl font-semibold text-gray-900 leading-tight">
                    {treatment.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base text-gray-600">
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

      {orderedCategories.length === 0 && (
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
  );
};

export default TreatmentSelection;
