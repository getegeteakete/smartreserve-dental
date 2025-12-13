
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Phone } from "lucide-react";
import Header from "@/components/Header";

const Guide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            トップページに戻る
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">使い方ガイド</h1>
          <p className="text-gray-600">
            六本松矯正歯科クリニックとよしま予約システムの使い方をご説明いたします
          </p>
        </div>

        <div className="grid gap-6">
          {/* 予約の取り方 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                予約の取り方
              </CardTitle>
              <CardDescription>
                初回から再診まで、オンラインで簡単に予約できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">診療メニューを選択</h4>
                    <p className="text-sm text-gray-600">
                      トップページまたはヘッダーメニューから、ご希望の診療内容を選択してください
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">日時を選択</h4>
                    <p className="text-sm text-gray-600">
                      カレンダーから空いている日時を選択してください
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">患者情報を入力</h4>
                    <p className="text-sm text-gray-600">
                      お名前、連絡先等の必要な情報をご入力ください
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">予約完了</h4>
                    <p className="text-sm text-gray-600">
                      予約が完了すると、確認メールが送信されます
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* お問い合わせ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                お困りの際は
              </CardTitle>
              <CardDescription>
                システムに関するお問い合わせ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <h4 className="font-medium mb-1">お電話でのお問い合わせ</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    WEBでの予約が困難な場合は、直接お電話ください。
                  </p>
                  <a 
                    href="tel:092-406-2119" 
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    092-406-2119
                  </a>
                </div>
                <div>
                  <h4 className="font-medium mb-1">システムの不具合</h4>
                  <p className="text-sm text-gray-600">
                    予約システムに不具合がある場合は、お電話でご連絡ください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
