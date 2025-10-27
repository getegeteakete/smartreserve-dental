import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ArrowLeft, CreditCard, MessageCircle, Mail, Smartphone, Calendar, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { GeneralSettingsEditor } from "@/components/admin/GeneralSettingsEditor";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const {
    settings,
    loading: settingsLoading,
    getSettingsByCategory,
    updateSetting,
    isFeatureEnabled,
  } = useSystemSettings();

  useEffect(() => {
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      if (!isAdminLoggedIn || adminUsername !== "sup@ei-life.co.jp") {
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

  const handleToggleSetting = async (key: string, currentValue: any) => {
    const newEnabled = !(currentValue?.enabled ?? false);
    await updateSetting(key, { ...currentValue, enabled: newEnabled }, newEnabled);
  };

  const handleToggleIsEnabled = async (key: string, currentIsEnabled: boolean) => {
    const setting = settings.find(s => s.setting_key === key);
    if (setting) {
      await updateSetting(key, setting.setting_value, !currentIsEnabled);
    }
  };

  if (loading || settingsLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const settingsByCategory = getSettingsByCategory();

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
          subtitle="システム設定" 
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダーセクション */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  管理画面に戻る
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <SettingsIcon className="h-6 w-6" />
                  システム設定
                </h1>
              </div>
            </div>

            {/* システム設定タブ */}
            <Tabs defaultValue="membership" className="w-full">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-7'} gap-1`}>
                <TabsTrigger value="membership" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {isMobile ? '会員' : '会員設定'}
                </TabsTrigger>
                <TabsTrigger value="line" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  {isMobile ? 'LINE' : 'LINE連動'}
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {isMobile ? '決済' : '決済設定'}
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {isMobile ? 'チャット' : 'チャット設定'}
                </TabsTrigger>
                <TabsTrigger value="notification" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {isMobile ? '通知' : '通知設定'}
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {isMobile ? '予約' : '予約設定'}
                </TabsTrigger>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  {isMobile ? '一般' : '一般設定'}
                </TabsTrigger>
              </TabsList>

              {/* 会員設定 */}
              <TabsContent value="membership" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      会員登録機能設定
                    </CardTitle>
                    <CardDescription>
                      会員登録機能のオンオフとゲスト予約の設定を行います
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.membership?.map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'membership_enabled' 
                                ? '会員登録機能を有効にする' 
                                : setting.setting_key === 'membership_email_verification'
                                ? 'メール認証を必須にする'
                                : 'ゲスト予約を許可する'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                        
                        {setting.setting_key === 'membership_enabled' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-indigo-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>メール認証を必須にする</Label>
                              <Switch
                                checked={setting.setting_value?.require_email_verification ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    require_email_verification: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>ゲスト予約も許可する</Label>
                              <Switch
                                checked={setting.setting_value?.allow_guest_booking ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    allow_guest_booking: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {setting.setting_key === 'guest_booking_enabled' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-indigo-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>電話番号を必須にする</Label>
                              <Switch
                                checked={setting.setting_value?.require_phone ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    require_phone: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>メールアドレスを必須にする</Label>
                              <Switch
                                checked={setting.setting_value?.require_email ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    require_email: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-900">
                          会員設定データがありません。Supabaseで <code className="bg-yellow-100 px-2 py-1 rounded">add-membership-line-settings.sql</code> を実行してください。
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-indigo-900">
                        <strong>現在の設定：</strong> 会員機能は無効です。ゲスト予約のみ可能な状態です。
                      </p>
                      <p className="text-sm text-indigo-800 mt-2">
                        💡 会員機能を有効にすると、ユーザーはアカウントを作成して予約履歴の確認やポイント管理ができます。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* LINE連動設定 */}
              <TabsContent value="line" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      LINE連動機能設定
                    </CardTitle>
                    <CardDescription>
                      LINE Messaging APIと連動して、予約通知やリマインダーをLINEで送信できます
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.line?.map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'line_integration_enabled' 
                                ? 'LINE連動機能を有効にする' 
                                : setting.setting_key === 'line_notification_settings'
                                ? 'LINE通知の種類を設定'
                                : 'LINE友だち追加設定'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                        
                        {setting.setting_key === 'line_integration_enabled' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-green-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>予約時に自動で友だち追加を案内</Label>
                              <Switch
                                checked={setting.setting_value?.auto_friend_add ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    auto_friend_add: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>予約完了通知をLINEで送信</Label>
                              <Switch
                                checked={setting.setting_value?.send_booking_notification ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    send_booking_notification: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {setting.setting_key === 'line_notification_settings' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-green-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>予約確定通知</Label>
                              <Switch
                                checked={setting.setting_value?.booking_confirmed ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    booking_confirmed: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>予約リマインダー</Label>
                              <Switch
                                checked={setting.setting_value?.booking_reminder ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    booking_reminder: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>キャンセル通知</Label>
                              <Switch
                                checked={setting.setting_value?.booking_cancelled ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    booking_cancelled: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>キャンペーン通知</Label>
                              <Switch
                                checked={setting.setting_value?.campaign_notification ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    campaign_notification: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {setting.setting_key === 'line_friend_settings' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-green-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>友だち追加を必須にする</Label>
                              <Switch
                                checked={setting.setting_value?.require_friend_add ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    require_friend_add: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>友だち追加特典を提供</Label>
                              <Switch
                                checked={setting.setting_value?.offer_benefits ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    offer_benefits: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-900">
                          LINE連動設定データがありません。Supabaseで <code className="bg-yellow-100 px-2 py-1 rounded">add-membership-line-settings.sql</code> を実行してください。
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        <strong>注意：</strong> LINE連動機能を使用するには、LINE Developers でMessaging API チャンネルを作成し、Channel Access Tokenを設定する必要があります。
                      </p>
                      <p className="text-sm text-yellow-800 mt-2">
                        📖 詳しくは <a href="https://developers.line.biz/ja/docs/messaging-api/" target="_blank" rel="noopener noreferrer" className="underline">LINE Messaging API ドキュメント</a> をご確認ください。
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-900">
                        <strong>💡 ヒント：</strong> LINE連動機能を有効にすると、以下のメリットがあります：
                      </p>
                      <ul className="text-sm text-green-800 mt-2 ml-4 list-disc space-y-1">
                        <li>予約確認や変更がLINEのトーク画面から可能</li>
                        <li>リマインダー通知の開封率が向上</li>
                        <li>患者様とのコミュニケーションが円滑に</li>
                        <li>キャンペーン情報を効果的に配信</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 決済設定 */}
              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      決済機能設定
                    </CardTitle>
                    <CardDescription>
                      KOMOJU決済機能のオンオフと決済方法を設定します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.payment.map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'payment_enabled' ? '決済機能を有効にする' : '決済方法の選択'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                        
                        {setting.setting_key === 'payment_methods' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-blue-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>クレジットカード決済</Label>
                              <Switch
                                checked={setting.setting_value?.credit_card ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    credit_card: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>コンビニ決済</Label>
                              <Switch
                                checked={setting.setting_value?.konbini ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    konbini: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>銀行振込（Pay-easy）</Label>
                              <Switch
                                checked={setting.setting_value?.bank_transfer ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    bank_transfer: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>注意：</strong> 決済機能を有効にする前に、KOMOJU APIキーの設定が必要です。
                        詳しくは <code className="bg-blue-100 px-2 py-1 rounded">KOMOJU_SETUP_GUIDE.md</code> をご確認ください。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* チャット設定 */}
              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      AIチャット機能設定
                    </CardTitle>
                    <CardDescription>
                      AIチャットボット機能のオンオフと動作を設定します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.chat.map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'chat_enabled' 
                                ? 'AIチャット機能を有効にする' 
                                : 'スタッフ接続機能を有効にする'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                        
                        {setting.setting_key === 'chat_enabled' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-green-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>自動応答</Label>
                              <Switch
                                checked={setting.setting_value?.auto_response ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    auto_response: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>営業時間のみ有効</Label>
                              <Switch
                                checked={setting.setting_value?.business_hours_only ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    business_hours_only: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-900">
                        <strong>ヒント：</strong> チャット機能を無効にすると、右下のチャットボタンが非表示になります。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 通知設定 */}
              <TabsContent value="notification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      SMS通知設定
                    </CardTitle>
                    <CardDescription>
                      SMS（ショートメッセージ）通知機能の設定
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.notification
                      .filter(s => s.setting_key.includes('sms'))
                      .map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'sms_enabled' 
                                ? 'SMS通知機能を有効にする' 
                                : 'SMSリマインダー設定'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                        
                        {setting.setting_key === 'sms_reminder_timing' && setting.is_enabled && (
                          <div className="ml-4 space-y-2 pl-4 border-l-2 border-purple-200">
                            <div className="flex items-center justify-between py-2">
                              <Label>24時間前に送信</Label>
                              <Switch
                                checked={setting.setting_value?.before_24h ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    before_24h: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>2時間前に送信</Label>
                              <Switch
                                checked={setting.setting_value?.before_2h ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    before_2h: checked,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <Label>30分前に送信</Label>
                              <Switch
                                checked={setting.setting_value?.before_30m ?? false}
                                onCheckedChange={(checked) => {
                                  updateSetting(setting.setting_key, {
                                    ...setting.setting_value,
                                    before_30m: checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        <strong>注意：</strong> SMS送信には別途料金が発生します。
                        Twilioまたは他のSMSプロバイダーの設定が必要です。
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      メール通知設定
                    </CardTitle>
                    <CardDescription>
                      メール通知機能の設定
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.notification
                      .filter(s => s.setting_key.includes('email'))
                      .map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'email_enabled' 
                                ? 'メール通知機能を有効にする' 
                                : 'メールリマインダー設定'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 予約設定 */}
              <TabsContent value="booking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      予約システム設定
                    </CardTitle>
                    <CardDescription>
                      予約の承認ルールやキャンセルポリシーを設定します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsByCategory.booking.map((setting) => (
                      <div key={setting.id} className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                              {setting.setting_key === 'booking_approval_required' 
                                ? '予約の承認を必須にする' 
                                : 'キャンセルポリシー'}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.setting_key}
                            checked={setting.is_enabled && (setting.setting_value?.enabled !== false)}
                            onCheckedChange={() => handleToggleSetting(setting.setting_key, setting.setting_value)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 一般設定 */}
              <TabsContent value="general" className="space-y-4">
                <GeneralSettingsEditor />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
};

export default AdminSettings;
