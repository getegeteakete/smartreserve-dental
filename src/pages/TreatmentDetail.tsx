import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, JapaneseYen, Phone } from "lucide-react";
import Header from "@/components/Header";

const TreatmentDetail = () => {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const navigate = useNavigate();

  // ページ遷移時に最上部にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [treatmentId]);

  const treatments = [
    {
      id: "initial-free",
      title: "初診の方【無料相談】",
      description: "口腔内診察・矯正治療の概要説明（予想される治療方法や期間などについて）・装置の種類ならびに費用の説明・お支払い方法など",
      duration: "30分",
      price: "無料",
      fee: 0,
      category: "初診",
      detailedDescription: [
        "口腔内の状態を詳しく診察いたします",
        "矯正治療の概要について丁寧にご説明します",
        "予想される治療方法や期間についてお話しします",
        "装置の種類とそれぞれの特徴をご紹介します",
        "費用とお支払い方法についてご説明します",
        "ご質問・ご相談にお答えします"
      ]
    },
    {
      id: "initial-paid",
      title: "初診有料相談",
      description: "無料相談に加え、口腔内スキャナ撮影を行い、その場でAIを使った大まかな治療シミュレーションを行います",
      duration: "45分",
      price: "¥5,000",
      fee: 5000,
      category: "初診",
      detailedDescription: [
        "無料相談のすべての内容に加えて",
        "最新の口腔内スキャナーによる精密な撮影",
        "AIを活用した治療シミュレーション",
        "より具体的な治療計画のご提案",
        "治療後の予想される歯並びをその場で確認"
      ]
    },
    {
      id: "detailed-exam",
      title: "精密検査予約",
      description: "相談を受けられた方で、精密検査を希望される方はこちらから予約をお願いします",
      duration: "60分",
      price: "¥10,000",
      fee: 10000,
      category: "精密検査",
      detailedDescription: [
        "レントゲン撮影（パノラマ・セファロ）",
        "口腔内・顔面写真撮影",
        "歯型採取または口腔内スキャナー撮影",
        "咬合診査",
        "詳細な治療計画の立案",
        "検査結果のご説明とカウンセリング"
      ]
    },
    {
      id: "home-whitening",
      title: "ホームホワイトニング",
      description: "薬液とマウスピースを使って、自宅で行うホワイトニングです。初回はカウンセリングとホワイトニング用マウスピースの型取りをします",
      duration: "30分",
      price: "¥25,000",
      fee: 25000,
      category: "ホワイトニング",
      detailedDescription: [
        "カウンセリングと口腔内チェック",
        "ホワイトニング用マウスピースの型取り",
        "マウスピース製作（約1週間後にお渡し）",
        "ホワイトニングジェルの使用方法説明",
        "自宅での使用期間中のサポート",
        "効果確認とアフターケア指導"
      ]
    },
    {
      id: "office-whitening-1",
      title: "オフィスホワイトニング（1回コース）",
      description: "漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです",
      duration: "90分",
      price: "¥30,000",
      fee: 30000,
      category: "ホワイトニング",
      detailedDescription: [
        "カウンセリングと口腔内チェック",
        "歯面清掃とコンディショニング",
        "ホワイトニング剤の塗布",
        "専用ライトによる照射（3回繰り返し）",
        "効果確認と仕上げ",
        "アフターケア指導"
      ]
    },
    {
      id: "office-whitening-2",
      title: "オフィスホワイトニング（2回コース）",
      description: "漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです",
      duration: "90分 × 2回",
      price: "¥50,000",
      fee: 50000,
      category: "ホワイトニング",
      detailedDescription: [
        "1回目：初回オフィスホワイトニング",
        "2回目：効果確認とさらなるホワイトニング",
        "より高い効果を期待できます",
        "2回に分けることで歯への負担を軽減",
        "持続性の高い白さを実現",
        "個人差に応じた調整が可能"
      ]
    },
    {
      id: "double-whitening",
      title: "ダブルホワイトニング",
      description: "初回オフィスホワイトニングとホームホワイトニング用マウスピースの型取りを行います",
      duration: "120分",
      price: "¥70,000",
      fee: 70000,
      category: "ホワイトニング",
      detailedDescription: [
        "初回：オフィスホワイトニング実施",
        "同日：ホームホワイトニング用型取り",
        "マウスピース製作（約1週間後）",
        "ホームホワイトニングジェルお渡し",
        "オフィス＋ホームの相乗効果",
        "最も効果的で持続性の高いコース"
      ]
    },
    {
      id: "pmtc",
      title: "プロによるお口の全体クリーニング",
      description: "バイオフィルムを取り除いた後、フッ素、エナメルトリートメント、舌クリーニングなど、お口の状態に合わせて必要なケアを行います",
      duration: "60分",
      price: "¥8,000",
      fee: 8000,
      category: "PMTC",
      detailedDescription: [
        "口腔内診査とカウンセリング",
        "バイオフィルムの除去",
        "歯石除去と歯面清掃",
        "フッ素塗布",
        "エナメルトリートメント",
        "舌クリーニングとケア指導"
      ]
    }
  ];

  const treatment = treatments.find(t => t.id === treatmentId);

  if (!treatment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">診療メニューが見つかりません</h1>
            <Button onClick={() => navigate("/")}>
              トップページに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    navigate(`/booking?treatmentId=${treatment.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 bg-gray-50">
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

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* 戻るボタン */}
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          診療メニュー一覧に戻る
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* メイン情報 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{treatment.title}</CardTitle>
                <CardDescription className="text-base">{treatment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">所要時間</div>
                      <div className="font-medium">{treatment.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <JapaneseYen className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">料金</div>
                      <div className="font-medium text-blue-600 text-lg">{treatment.price}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">診療内容詳細</h3>
                  <ul className="space-y-2">
                    {treatment.detailedDescription.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 予約セクション */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">予約について</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                    <p className="text-xs text-orange-700">
                      現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    この診療内容で予約する
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">または</div>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <a href="tel:092-406-2119">
                        <Phone className="h-4 w-4 mr-2" />
                        電話で予約する
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TreatmentDetail;
