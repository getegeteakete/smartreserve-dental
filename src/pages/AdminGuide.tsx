import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Users, 
  UserCheck, 
  Mail, 
  Settings, 
  CheckCircle, 
  X, 
  Edit, 
  Plus,
  Clock,
  AlertCircle,
  Info,
  Monitor
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function AdminGuide() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      if (isAdminLoggedIn !== "true" || adminUsername !== "sup@ei-life.co.jp") {
        navigate("/admin-login");
        return;
      }
      
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <AdminContentHeader 
          title="SmartReserve" 
          subtitle="管理者向け使い方ガイド" 
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダー */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-4 w-4" />
                管理画面に戻る
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  管理者向け使い方ガイド
                </h1>
              </div>
            </div>

        {/* 概要カード */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              システム概要
            </CardTitle>
            <CardDescription>
              春空予約システムの管理者機能について説明します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">主要機能</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 予約の確認・承認・管理</li>
                  <li>• 診療スケジュールの設定</li>
                  <li>• 診療メニューの管理</li>
                  <li>• 患者情報の管理</li>
                  <li>• リマインダーメール送信</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">アクセス情報</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>管理者ID:</strong> admin@smartreserve.com</p>
                  <p><strong>パスワード:</strong> admin123</p>
                  <p><strong>アクセス方法:</strong> PCまたはタブレット推奨</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブコンテンツ */}
        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isMobile ? '予約管理' : '予約管理'}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isMobile ? 'スケジュール' : 'スケジュール'}
            </TabsTrigger>
            <TabsTrigger value="treatments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isMobile ? '診療メニュー' : '診療メニュー'}
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {isMobile ? '患者管理' : '患者管理'}
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {isMobile ? 'メール' : 'メール管理'}
            </TabsTrigger>
          </TabsList>

          {/* 予約管理タブ */}
          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  予約管理の操作方法
                </CardTitle>
                <CardDescription>
                  患者様からの予約申し込みの確認・承認・管理を行います
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 予約状況の確認 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    1. 予約状況の確認
                  </h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      管理画面の「予約状況」タブでカレンダー形式での予約状況を確認できます。
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">表示される情報</p>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• 日付ごとの予約数</li>
                        <li>• 承認待ち予約の件数</li>
                        <li>• 確定済み予約の件数</li>
                        <li>• 時間帯別の予約状況</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 予約の承認 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    2. 予約の承認
                  </h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">承認待ち予約の処理手順</p>
                      <ol className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>1. 「予約管理」タブをクリック</li>
                        <li>2. 「承認待ち」タブで新規予約を確認</li>
                        <li>3. 予約詳細をクリックして内容を確認</li>
                        <li>4. 「承認」ボタンをクリックして確定</li>
                        <li>5. 必要に応じて備考を追加</li>
                      </ol>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="border rounded-lg p-3">
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">pending</Badge>
                        <p className="text-sm mt-1">承認待ち</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">confirmed</Badge>
                        <p className="text-sm mt-1">承認済み</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">cancelled</Badge>
                        <p className="text-sm mt-1">キャンセル</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 予約の編集・キャンセル */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    3. 予約の編集・キャンセル
                  </h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">予約変更の手順</p>
                      <ol className="text-sm text-orange-700 mt-2 space-y-1">
                        <li>1. 対象の予約をクリック</li>
                        <li>2. 「編集」ボタンをクリック</li>
                        <li>3. 日時、患者情報、備考等を修正</li>
                        <li>4. 「保存」ボタンで変更を確定</li>
                        <li>5. 自動的に変更通知メールが送信される</li>
                      </ol>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">予約キャンセルの手順</p>
                      <ol className="text-sm text-red-700 mt-2 space-y-1">
                        <li>1. 対象の予約をクリック</li>
                        <li>2. 「キャンセル」ボタンをクリック</li>
                        <li>3. キャンセル理由を入力（任意）</li>
                        <li>4. 「キャンセル実行」で確定</li>
                        <li>5. 自動的にキャンセル通知メールが送信される</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 新規予約作成 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    4. 新規予約作成
                  </h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      電話予約など、管理者が直接予約を登録する場合の手順です。
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">新規予約登録の手順</p>
                      <ol className="text-sm text-green-700 mt-2 space-y-1">
                        <li>1. 「新規予約作成」ボタンをクリック</li>
                        <li>2. 患者情報を入力（名前、電話、メール、年齢）</li>
                        <li>3. 診療メニューを選択</li>
                        <li>4. 希望日時を選択（最大3つ）</li>
                        <li>5. 備考があれば入力</li>
                        <li>6. 「登録」ボタンで保存</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* スケジュール管理タブ */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  スケジュール管理の操作方法
                </CardTitle>
                <CardDescription>
                  診療時間や特別営業日の設定を行います
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本営業時間の設定 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">1. 基本営業時間の設定</h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      月〜土曜日の基本的な診療時間を設定します。
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">設定手順</p>
                      <ol className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>1. スケジュール設定ページにアクセス</li>
                        <li>2. 対象の曜日を選択</li>
                        <li>3. 開始時間と終了時間を設定</li>
                        <li>4. 「保存」ボタンで設定を保存</li>
                      </ol>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">デフォルト設定</p>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>• 平日: 9:00-18:30</li>
                        <li>• 土曜: 9:00-17:00</li>
                        <li>• 日曜・祝日: 休診</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 特別営業日の設定 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2. 特別営業日の設定</h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      祝日の営業や休診日の臨時営業などを設定できます。
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">特別営業日追加の手順</p>
                      <ol className="text-sm text-green-700 mt-2 space-y-1">
                        <li>1. 「特別営業日追加」セクションに移動</li>
                        <li>2. カレンダーから日付を選択</li>
                        <li>3. 営業時間帯を選択</li>
                        <li>4. 「追加」ボタンで登録</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 休診日の設定 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">3. 休診日の設定</h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      臨時休診日や長期休暇の設定を行います。
                    </p>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">休診日設定の手順</p>
                      <ol className="text-sm text-red-700 mt-2 space-y-1">
                        <li>1. 対象日付を選択</li>
                        <li>2. 「休診」に設定変更</li>
                        <li>3. 必要に応じて理由を記載</li>
                        <li>4. 既存予約がある場合は事前に連絡</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 診療メニュー管理タブ */}
          <TabsContent value="treatments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  診療メニュー管理の操作方法
                </CardTitle>
                <CardDescription>
                  診療内容、料金、予約制限の設定を行います
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 診療メニューの作成 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">1. 新規診療メニューの作成</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">メニュー作成の手順</p>
                      <ol className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>1. 「新規メニュー作成」ボタンをクリック</li>
                        <li>2. 診療名を入力</li>
                        <li>3. カテゴリを選択（初診、検査、PMTC等）</li>
                        <li>4. 料金を設定</li>
                        <li>5. 所要時間を設定</li>
                        <li>6. 説明文を入力</li>
                        <li>7. 「保存」ボタンで登録</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 予約制限の設定 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2. 予約制限の設定</h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      同じ時間帯に予約可能な人数を診療内容ごとに設定できます。
                    </p>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">制限設定の手順</p>
                      <ol className="text-sm text-orange-700 mt-2 space-y-1">
                        <li>1. 対象の診療メニューを選択</li>
                        <li>2. 「最大予約数」の項目を編集</li>
                        <li>3. 同時間帯の最大人数を入力</li>
                        <li>4. 「保存」ボタンで設定を確定</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* メニューの編集・削除 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">3. メニューの編集・削除</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">編集の手順</p>
                      <ol className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>1. 一覧から対象メニューを選択</li>
                        <li>2. 「編集」ボタンをクリック</li>
                        <li>3. 必要な項目を修正</li>
                        <li>4. 「保存」で変更を確定</li>
                      </ol>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800">削除時の注意</p>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• 既存の予約がある場合は削除不可</li>
                        <li>• 削除前に関連する予約を確認</li>
                        <li>• 削除は取り消せません</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 患者管理タブ */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  患者管理の操作方法
                </CardTitle>
                <CardDescription>
                  患者情報の確認・編集・履歴管理を行います
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 患者情報の確認 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">1. 患者情報の確認</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">確認できる情報</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• 基本情報（氏名、電話、メール、年齢）</li>
                        <li>• 予約履歴（過去〜未来の全予約）</li>
                        <li>• 予約回数・来院回数</li>
                        <li>• 最後の来院日</li>
                        <li>• 特記事項・備考</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 患者情報の編集 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2. 患者情報の編集</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">編集手順</p>
                      <ol className="text-sm text-green-700 mt-2 space-y-1">
                        <li>1. 患者一覧から対象者を選択</li>
                        <li>2. 「編集」ボタンをクリック</li>
                        <li>3. 必要な情報を修正</li>
                        <li>4. 「保存」で変更を確定</li>
                      </ol>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">⚠️ 注意事項</p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• メールアドレス変更時は予約通知に影響</li>
                        <li>• 電話番号は緊急連絡用のため正確に入力</li>
                        <li>• 変更内容は即座に反映されます</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 患者検索とフィルタリング */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">3. 患者検索とフィルタリング</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">検索方法</p>
                      <ul className="text-sm text-purple-700 mt-2 space-y-1">
                        <li>• 氏名での部分一致検索</li>
                        <li>• 電話番号での完全一致検索</li>
                        <li>• メールアドレスでの検索</li>
                        <li>• 予約日での期間検索</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* メール管理タブ */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  メール管理の操作方法
                </CardTitle>
                <CardDescription>
                  リマインダーメールや通知メールの管理を行います
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* リマインダーメール */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">1. リマインダーメールの送信</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">送信タイミング</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• 前日リマインダー: 予約前日の夜（18:00頃）</li>
                        <li>• 当日朝リマインダー: 予約当日の朝（8:00頃）</li>
                        <li>• 手動送信: 管理者が任意のタイミングで送信</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">手動送信の手順</p>
                      <ol className="text-sm text-green-700 mt-2 space-y-1">
                        <li>1. 予約管理画面で「リマインダーメール管理」を確認</li>
                        <li>2. 「前日リマインダー送信」または「当日朝リマインダー送信」をクリック</li>
                        <li>3. 対象となる予約が自動で抽出される</li>
                        <li>4. 送信完了後、結果が表示される</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 自動メール通知 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2. 自動メール通知</h3>
                  <div className="pl-7 space-y-2">
                    <p className="text-sm text-gray-600">
                      以下のタイミングで自動的にメールが送信されます。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">予約受付時</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          患者様に受付確認メール<br/>
                          管理者に新規予約通知メール
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">予約確定時</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          患者様に確定通知メール<br/>
                          日時・診療内容の詳細を送信
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">予約変更時</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          患者様に変更通知メール<br/>
                          変更内容の詳細を送信
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm">キャンセル時</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          患者様にキャンセル通知メール<br/>
                          再予約の案内を送信
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* メール送信状況の確認 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">3. メール送信状況の確認</h3>
                  <div className="pl-7 space-y-2">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">送信ログの確認方法</p>
                      <ul className="text-sm text-orange-700 mt-2 space-y-1">
                        <li>• ブラウザの開発者ツールでコンソールログを確認</li>
                        <li>• 患者様からの受信確認で状況を把握</li>
                        <li>• エラーが発生した場合はシステム管理者に連絡</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* トラブルシューティング */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              よくある問題と対処法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">予約が表示されない</h4>
                <p className="text-sm text-gray-600 mt-1">
                  ページを再読み込みしてください。それでも解決しない場合は、ブラウザのキャッシュをクリアしてください。
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium">メールが送信されない</h4>
                <p className="text-sm text-gray-600 mt-1">
                  患者様のメールアドレスが正しいか確認してください。メールサーバーの問題の可能性もあります。
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">操作が反映されない</h4>
                <p className="text-sm text-gray-600 mt-1">
                  保存ボタンを押した後、少し時間をおいてからページを確認してください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* お問い合わせ */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>お問い合わせ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  システムに関するご質問やトラブルがございましたら、開発チームまでご連絡ください。
                </p>
                <div className="mt-2 text-sm">
                  <p><strong>開発・保守:</strong> 春空開発チーム</p>
                  <p><strong>緊急時連絡先:</strong> システム管理者まで</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
}
