
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, JapaneseYen, Phone } from "lucide-react";
import { useTreatmentsWithCategories } from "@/hooks/useTreatmentsWithCategories";

const CourseDetail = () => {
  const { courseName } = useParams<{ courseName: string }>();
  const navigate = useNavigate();
  const { treatments = [] } = useTreatmentsWithCategories();

  console.log("CourseDetail - courseName:", courseName);
  console.log("CourseDetail - treatments count:", treatments.length);
  console.log("CourseDetail - treatments:", treatments);
  console.log("CourseDetail - treatment names:", treatments.map(t => t.name));

  // コース分類と対応する画像（TreatmentSelectionと同じ画像を使用）
  const courseImages = {
    "初診": "/images/first-time-bg.jpg",
    "精密検査": "/images/precision-examination-bg.jpg",
    "ホワイトニング": "/images/whitening-bg.jpg",
    "PMTC": "/lovable-uploads/87d8b2fd-ead0-49b4-bb0e-89abad0f0380.png"
  };

  const courseCategories = {
    "初診": ["初診の方【無料相談】", "初診有料相談【60分】"],
    "精密検査": ["精密検査予約【60分】"],
    "ホワイトニング": [
      "ホームホワイトニング【60分】",
      "オフィスホワイトニング（1回コース）【90分】",
      "オフィスホワイトニング（2回コース）【90分】",
      "ダブルホワイトニング【120分】"
    ],
    "PMTC": ["PMTC【60分】"]
  };

  if (!courseName || !courseCategories[courseName as keyof typeof courseCategories]) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">コースが見つかりません</h1>
          <Button onClick={() => navigate("/")}>
            トップページに戻る
          </Button>
        </div>
      </div>
    );
  }

  const courseImageUrl = courseImages[courseName as keyof typeof courseImages];
  const treatmentNames = courseCategories[courseName as keyof typeof courseCategories];
  
  // より柔軟なマッチングロジック
  const allMatchedTreatments = treatments.filter(t => {
    // 完全一致を優先
    if (treatmentNames.includes(t.name)) {
      console.log(`CourseDetail - 完全一致: ${courseName} - ${t.name}`);
      return true;
    }
    
    // 部分マッチング（カテゴリーごとに特化）
    let match = false;
    switch (courseName) {
      case "初診":
        match = t.name.includes("初診") && (t.name.includes("無料") || t.name.includes("有料"));
        break;
      case "精密検査":
        match = t.name.includes("精密検査");
        break;
      case "ホワイトニング":
        match = t.name.includes("ホワイトニング") && 
               (t.name.includes("ホーム") || t.name.includes("オフィス") || t.name.includes("ダブル"));
        break;
      case "PMTC":
        match = t.name.includes("PMTC");
        break;
      default:
        match = false;
    }
    
    if (match) {
      console.log(`CourseDetail - 部分一致: ${courseName} - ${t.name}`);
    }
    return match;
  });

  // 重複除去：同じ名前の診療メニューがある場合は最新のもの（created_atが最新）を使用
  const courseTreatments = allMatchedTreatments.reduce((unique, current) => {
    const existing = unique.find(t => t.name === current.name);
    if (!existing) {
      unique.push(current);
    } else {
      // より新しいデータで置き換え
      if (new Date(current.created_at) > new Date(existing.created_at)) {
        const index = unique.findIndex(t => t.name === current.name);
        unique[index] = current;
      }
    }
    return unique;
  }, [] as typeof treatments);

  console.log(`CourseDetail - フィルタリング結果 (${courseName}):`, {
    expectedNames: treatmentNames,
    beforeDeduplication: allMatchedTreatments.length,
    afterDeduplication: courseTreatments.length,
    foundNames: courseTreatments.map(t => t.name),
    allTreatmentIds: courseTreatments.map(t => t.id)
  });

  const handleTreatmentSelect = (treatmentId: string) => {
    console.log("予約に遷移:", treatmentId);
    navigate(`/booking?treatmentId=${treatmentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 見出し画像セクション */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img
          src={courseImageUrl}
          alt={courseName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{courseName}</h1>
            <p className="text-xl opacity-90">{courseTreatments.length}種類のメニュー</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          トップページに戻る
        </Button>
      </div>

      {/* 電話案内セクション */}
      <div className="bg-slate-800 text-white py-4">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>お急ぎの方は直接お電話ください: </span>
            <a href="tel:092-406-2119" className="font-medium text-blue-300 hover:text-blue-200 underline">
              092-406-2119
            </a>
          </div>
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseTreatments.map((treatment) => (
            <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{treatment.name}</CardTitle>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {treatment.fee === 0 ? "無料" : `¥${treatment.fee.toLocaleString()}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{treatment.duration}分</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {treatment.description || "説明なし"}
                </CardDescription>
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-4">
                  <p className="text-xs text-orange-700">
                    現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。
                  </p>
                </div>
                <Button 
                  onClick={() => handleTreatmentSelect(treatment.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  この診療内容で予約する
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
