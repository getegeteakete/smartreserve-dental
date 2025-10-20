import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ArrowLeft, CreditCard, MessageCircle, Mail, Smartphone, Calendar, Settings as SettingsIcon, RefreshCw, Edit, Save, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { ensureSystemSettings, forceUpdateSystemSettings } from "@/utils/defaultSystemSettings";

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [editingGeneralSettings, setEditingGeneralSettings] = useState(false);
  const [generalSettingsForm, setGeneralSettingsForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    business_hours: {
      monday: { start: '', end: '', available: true },
      tuesday: { start: '', end: '', available: true },
      wednesday: { start: '', end: '', available: true },
      thursday: { start: '', end: '', available: true },
      friday: { start: '', end: '', available: true },
      saturday: { start: '', end: '', available: true },
      sunday: { start: '', end: '', available: false },
    }
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const {
    settings,
    loading: settingsLoading,
    getSettingsByCategory,
    updateSetting,
    isFeatureEnabled,
    refetch,
  } = useSystemSettings();

  useEffect(() => {
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

  // 一般設定の読み込み
  useEffect(() => {
    const loadGeneralSettings = () => {
      try {
        const settingsByCategory = getSettingsByCategory();
        console.log('General settings loaded:', settingsByCategory.general);
        const clinicInfo = settingsByCategory.general.find(s => s.setting_key === 'clinic_info');
        if (clinicInfo && clinicInfo.setting_value) {
          console.log('Setting generalSettingsForm from database:', clinicInfo.setting_value);
          setGeneralSettingsForm(clinicInfo.setting_value);
        } else {
          console.log('No clinic_info found, using default values');
          // デフォルト値で初期化
          setGeneralSettingsForm({
            name: '六本松 矯正歯科クリニック とよしま予約ページ',
            phone: '092-406-2119',
            address: '福岡県福岡市中央区六本松',
            email: '489@489.toyoshima-do.com',
            business_hours: {
              monday: { start: '10:00', end: '13:30', available: true },
              tuesday: { start: '10:00', end: '13:30', available: true },
              wednesday: { start: '10:00', end: '13:30', available: true },
              thursday: { start: '10:00', end: '13:30', available: true },
              friday: { start: '10:00', end: '13:30', available: true },
              saturday: { start: '09:00', end: '12:30', available: true },
              sunday: { start: '', end: '', available: false },
            }
          });
        }
      } catch (error) {
        console.error('Error loading general settings:', error);
      }
    };

    // 設定が存在するかどうかに関係なく実行
    loadGeneralSettings();
  }, [settings, getSettingsByCategory]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
  };

  const handleToggleSetting = async (key: string, currentValue: any, checked?: boolean) => {
    
    const setting = settings.find(s => s.setting_key === key);
    if (!setting) {
      console.error('Setting not found:', key);
      return;
    }
    
    try {
      console.log('Toggle setting start:', { key, currentValue, currentIsEnabled: setting.is_enabled, checked });
      
      // checked パラメータがある場合はそれを使用、そうでなければ現在の値を反転
      const newIsEnabled = checked !== undefined ? checked : !setting.is_enabled;
      
      // setting_value の enabled も更新
      const newSettingValue = {
        ...currentValue,
        enabled: newIsEnabled
      };
      
      console.log('About to update setting:', { key, newSettingValue, newIsEnabled });
      
      await updateSetting(key, newSettingValue, newIsEnabled);
      
      console.log('Setting update completed for:', key);
    } catch (error) {
      console.error('設定の切り替えエラー:', error);
      toast({
        title: 'エラー',
        description: '設定の切り替えに失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleToggleIsEnabled = async (key: string, currentIsEnabled: boolean) => {
    const setting = settings.find(s => s.setting_key === key);
    if (setting) {
      await updateSetting(key, setting.setting_value, !currentIsEnabled);
    }
  };

  // 決済設定専用のハンドラー
  const handlePaymentToggle = async (setting: any, checked: boolean) => {
    try {
      console.log('Payment toggle:', { key: setting.setting_key, checked, currentValue: setting.setting_value });
      
      const newSettingValue = {
        ...setting.setting_value,
        enabled: checked
      };
      
      console.log('Updating payment setting:', { key: setting.setting_key, newSettingValue, checked });
      
      // is_enabled と setting_value.enabled の両方を更新
      await updateSetting(setting.setting_key, newSettingValue, checked);
      
      console.log('Payment setting update completed');
    } catch (error) {
      console.error('Payment toggle error:', error);
      toast({
        title: 'エラー',
        description: '決済設定の更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  // 一般設定の保存機能
  const handleSaveGeneralSettings = async () => {
    try {
      console.log('Saving general settings:', generalSettingsForm);
      
      await updateSetting('clinic_info', generalSettingsForm);
      
      // 設定を再読み込み
      await refetch();
      
      setEditingGeneralSettings(false);
      
      toast({
        title: '保存完了',
        description: '一般設定が正常に更新されました',
      });
    } catch (error) {
      console.error('General settings save error:', error);
      toast({
        title: 'エラー',
        description: '一般設定の保存に失敗しました',
        variant: 'destructive',
      });
    }
  };

  // 一般設定の編集開始
  const handleStartEditingGeneralSettings = () => {
    console.log('編集モード開始');
    
    // 現在の設定値を確実にフォームに読み込み
    try {
      const settingsByCategory = getSettingsByCategory();
      const clinicInfo = settingsByCategory.general.find(s => s.setting_key === 'clinic_info');
      
      if (clinicInfo && clinicInfo.setting_value) {
        console.log('設定値読み込み:', clinicInfo.setting_value);
        setGeneralSettingsForm(clinicInfo.setting_value);
      } else {
        console.log('データベースに設定がないため、現在のフォーム値またはデフォルト値を使用');
        // 現在のgeneralSettingsFormの値を使用、またはデフォルト値を設定
        if (!generalSettingsForm.name) {
          setGeneralSettingsForm(prev => ({
            ...prev,
            name: prev.name || '六本松 矯正歯科クリニック とよしま予約ページ',
            phone: prev.phone || '092-406-2119',
            address: prev.address || '福岡県福岡市中央区六本松',
            email: prev.email || '489@489.toyoshima-do.com',
            business_hours: prev.business_hours || {
              monday: { start: '10:00', end: '13:30', available: true },
              tuesday: { start: '10:00', end: '13:30', available: true },
              wednesday: { start: '10:00', end: '13:30', available: true },
              thursday: { start: '10:00', end: '13:30', available: true },
              friday: { start: '10:00', end: '13:30', available: true },
              saturday: { start: '09:00', end: '12:30', available: true },
              sunday: { start: '', end: '', available: false },
            }
          }));
        }
      }
    } catch (error) {
      console.error('編集開始時のエラー:', error);
    }
    
    setEditingGeneralSettings(true);
  };

  // 一般設定の編集キャンセル
  const handleCancelEditingGeneralSettings = () => {
    const settingsByCategory = getSettingsByCategory();
    const clinicInfo = settingsByCategory.general.find(s => s.setting_key === 'clinic_info');
    if (clinicInfo && clinicInfo.setting_value) {
      setGeneralSettingsForm(clinicInfo.setting_value);
    }
    setEditingGeneralSettings(false);
  };

  const handleInitializeSettings = async () => {
    try {
      setInitializing(true);
      console.log('システム設定の初期化を開始');
      
      const result = await ensureSystemSettings();
      if (result) {
        toast({
          title: '初期化完了',
          description: 'システム設定が正常に初期化されました',
        });
        await refetch();
      } else {
        toast({
          title: '初期化失敗',
          description: 'システム設定の初期化に失敗しました。データベースの確認が必要です。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('初期化エラー:', error);
      toast({
        title: 'エラー',
        description: 'システム設定の初期化中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleForceUpdateSettings = async () => {
    try {
      setInitializing(true);
      console.log('システム設定の強制更新を開始');
      
      const result = await forceUpdateSystemSettings();
      if (result) {
        toast({
          title: '更新完了',
          description: 'システム設定が強制更新されました',
        });
        await refetch();
      } else {
        toast({
          title: '更新失敗',
          description: 'システム設定の更新に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('強制更新エラー:', error);
      toast({
        title: 'エラー',
        description: 'システム設定の更新中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
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

  // デバッグ情報を出力
  console.log('SystemSettings - settings:', settings);
  console.log('SystemSettings - settingsByCategory:', settingsByCategory);
  console.log('SystemSettings - payment settings:', settingsByCategory.payment);
  console.log('SystemSettings - chat settings:', settingsByCategory.chat);

  // 設定が空の場合の表示
  if (settings.length === 0) {
    return (
      <>
        <AdminHeader title="システム設定" />
        <div className="pt-20 min-h-screen bg-gray-50">
          <div className={`container ${isMobile ? 'max-w-full px-2' : 'max-w-6xl'} mx-auto py-8 px-4`}>
            <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'} mb-6`}>
              <div className={`${isMobile ? 'space-y-2' : 'flex items-center gap-4'}`}>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2"
                  size={isMobile ? "sm" : "default"}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {isMobile ? '戻る' : '管理画面に戻る'}
                </Button>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold flex items-center gap-2`}>
                  <SettingsIcon className="h-6 w-6" />
                  システム設定
                </h1>
              </div>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-orange-600" />
                  システム設定が未初期化です
                </CardTitle>
                <CardDescription>
                  システム設定が初期化されていません。下記のボタンを押して初期化してください。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleInitializeSettings}
                    disabled={initializing}
                    className="w-full flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
                    {initializing ? '初期化中...' : 'システム設定を初期化'}
                  </Button>
                  <Button 
                    onClick={handleForceUpdateSettings}
                    disabled={initializing}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
                    {initializing ? '更新中...' : '設定を強制更新'}
                  </Button>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>注意：</strong> システム設定の初期化に失敗する場合は、データベースに「system_settings」テーブルが存在しない可能性があります。
                    <code className="block mt-2 bg-yellow-100 px-2 py-1 rounded">create-system-settings-table.sql</code> をSupabase SQL Editorで実行してください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ScrollToTopButton />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="システム設定" />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className={`container ${isMobile ? 'max-w-full px-2' : 'max-w-6xl'} mx-auto py-8 px-4`}>
          <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'} mb-6`}>
            <div className={`${isMobile ? 'space-y-2' : 'flex items-center gap-4'}`}>
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-4 w-4" />
                {isMobile ? '戻る' : '管理画面に戻る'}
              </Button>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold flex items-center gap-2`}>
                <SettingsIcon className="h-6 w-6" />
                システム設定
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleInitializeSettings}
                disabled={initializing}
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
                {initializing ? '初期化中' : '初期化'}
              </Button>
              <Button variant="outline" onClick={handleLogout} size={isMobile ? "sm" : "default"}>
                ログアウト
              </Button>
            </div>
          </div>

          <Tabs defaultValue="payment" className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
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
                  {settingsByCategory.payment.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>決済設定が読み込まれていません。</p>
                      <Button 
                        onClick={handleInitializeSettings}
                        className="mt-4"
                        variant="outline"
                      >
                        設定を初期化
                      </Button>
                    </div>
                  ) : (
                    settingsByCategory.payment.map((setting) => (
                    <div key={setting.id} className="space-y-3">
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex-1">
                          <Label htmlFor={setting.setting_key} className="text-base font-semibold">
                            {setting.setting_key === 'payment_enabled' ? '決済機能を有効にする' : '決済方法の選択'}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <Switch
                          id={setting.setting_key}
                          checked={setting.is_enabled && setting.setting_value?.enabled !== false}
                          onCheckedChange={(checked) => {
                            console.log('Payment Switch onCheckedChange:', { key: setting.setting_key, checked, currentIsEnabled: setting.is_enabled, currentValueEnabled: setting.setting_value?.enabled });
                            handlePaymentToggle(setting, checked);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
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
                  )))}
                  
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
                  {settingsByCategory.chat.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>チャット設定が読み込まれていません。</p>
                      <Button 
                        onClick={handleInitializeSettings}
                        className="mt-4"
                        variant="outline"
                      >
                        設定を初期化
                      </Button>
                    </div>
                  ) : (
                    settingsByCategory.chat.map((setting) => (
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
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => {
                            console.log('Chat Switch onCheckedChange:', { key: setting.setting_key, checked });
                            handleToggleSetting(setting.setting_key, setting.setting_value);
                          }}
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
                  )))}
                  
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
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => {
                            console.log('Notification Switch onCheckedChange:', { key: setting.setting_key, checked });
                            handleToggleSetting(setting.setting_key, setting.setting_value);
                          }}
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
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => {
                            console.log('Email Switch onCheckedChange:', { key: setting.setting_key, checked });
                            handleToggleSetting(setting.setting_key, setting.setting_value);
                          }}
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
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => {
                            console.log('Booking Switch onCheckedChange:', { key: setting.setting_key, checked });
                            handleToggleSetting(setting.setting_key, setting.setting_value);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 一般設定 */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                    一般設定
                  </CardTitle>
                  <CardDescription>
                    医院名、連絡先、営業時間などの基本情報
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">クリニック基本情報</h3>
                      <p className="text-sm text-gray-600">医院名、連絡先、営業時間などの基本情報を設定してください</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!editingGeneralSettings ? (
                        <Button 
                          onClick={handleStartEditingGeneralSettings}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          編集する
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Edit className="h-4 w-4" />
                          編集中
                        </div>
                      )}
                    </div>
                  </div>

                  {editingGeneralSettings ? (
                    <div className="space-y-6">
                      {/* 基本情報フォーム */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clinic_name">医院名</Label>
                          <Input
                            id="clinic_name"
                            value={generalSettingsForm.name}
                            onChange={(e) => setGeneralSettingsForm({
                              ...generalSettingsForm,
                              name: e.target.value
                            })}
                            placeholder="医院名を入力"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clinic_phone">電話番号</Label>
                          <Input
                            id="clinic_phone"
                            value={generalSettingsForm.phone}
                            onChange={(e) => setGeneralSettingsForm({
                              ...generalSettingsForm,
                              phone: e.target.value
                            })}
                            placeholder="電話番号を入力"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clinic_address">住所</Label>
                        <Input
                          id="clinic_address"
                          value={generalSettingsForm.address}
                          onChange={(e) => setGeneralSettingsForm({
                            ...generalSettingsForm,
                            address: e.target.value
                          })}
                          placeholder="住所を入力"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clinic_email">メールアドレス</Label>
                        <Input
                          id="clinic_email"
                          type="email"
                          value={generalSettingsForm.email}
                          onChange={(e) => setGeneralSettingsForm({
                            ...generalSettingsForm,
                            email: e.target.value
                          })}
                          placeholder="メールアドレスを入力"
                        />
                      </div>

                      {/* 営業時間設定 */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold">営業時間設定</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(generalSettingsForm.business_hours).map(([day, hours]) => (
                            <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`${day}_available`}
                                  checked={hours.available}
                                  onChange={(e) => setGeneralSettingsForm(prev => ({
                                    ...prev,
                                    business_hours: {
                                      ...prev.business_hours,
                                      [day]: {
                                        ...prev.business_hours[day],
                                        available: e.target.checked
                                      }
                                    }
                                  }))}
                                  className="rounded"
                                />
                                <Label htmlFor={`${day}_available`} className="text-sm font-medium w-16">
                                  {day === 'monday' ? '月曜日' :
                                   day === 'tuesday' ? '火曜日' :
                                   day === 'wednesday' ? '水曜日' :
                                   day === 'thursday' ? '木曜日' :
                                   day === 'friday' ? '金曜日' :
                                   day === 'saturday' ? '土曜日' :
                                   day === 'sunday' ? '日曜日' : day}
                                </Label>
                              </div>
                              {hours.available && (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="time"
                                    value={hours.start}
                                    onChange={(e) => setGeneralSettingsForm(prev => ({
                                      ...prev,
                                      business_hours: {
                                        ...prev.business_hours,
                                        [day]: {
                                          ...prev.business_hours[day],
                                          start: e.target.value
                                        }
                                      }
                                    }))}
                                    className="w-24 text-sm"
                                  />
                                  <span className="text-sm">〜</span>
                                  <Input
                                    type="time"
                                    value={hours.end}
                                    onChange={(e) => setGeneralSettingsForm(prev => ({
                                      ...prev,
                                      business_hours: {
                                        ...prev.business_hours,
                                        [day]: {
                                          ...prev.business_hours[day],
                                          end: e.target.value
                                        }
                                      }
                                    }))}
                                    className="w-24 text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 保存・キャンセルボタン */}
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                          onClick={handleCancelEditingGeneralSettings}
                          variant="outline"
                        >
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleSaveGeneralSettings}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 現在の設定値を表示 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">医院名</Label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">
                            {generalSettingsForm.name || '未設定'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">電話番号</Label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">
                            {generalSettingsForm.phone || '未設定'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">住所</Label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">
                            {generalSettingsForm.address || '未設定'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">メールアドレス</Label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">
                            {generalSettingsForm.email || '未設定'}
                          </p>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">営業時間</Label>
                          <div className="text-sm bg-gray-50 p-3 rounded border">
                            {generalSettingsForm.business_hours && Object.entries(generalSettingsForm.business_hours).map(([day, hours]: [string, any]) => (
                              <div key={day} className="flex justify-between py-1">
                                <span>
                                  {day === 'monday' ? '月曜日' :
                                   day === 'tuesday' ? '火曜日' :
                                   day === 'wednesday' ? '水曜日' :
                                   day === 'thursday' ? '木曜日' :
                                   day === 'friday' ? '金曜日' :
                                   day === 'saturday' ? '土曜日' :
                                   day === 'sunday' ? '日曜日' : day}
                                </span>
                                <span>
                                  {hours.available ? `${hours.start} - ${hours.end}` : '定休日'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* 編集ボタン - 常に表示 */}
                      <div className="flex justify-center pt-4">
                        <Button 
                          onClick={handleStartEditingGeneralSettings}
                          className="flex items-center gap-2"
                          size="lg"
                        >
                          <Edit className="h-4 w-4" />
                          編集する
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </>
  );
}

