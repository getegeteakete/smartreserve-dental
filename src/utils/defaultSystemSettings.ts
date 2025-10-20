import { supabase } from '@/integrations/supabase/client';

export interface DefaultSystemSetting {
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
  is_enabled: boolean;
}

export const defaultSystemSettings: DefaultSystemSetting[] = [
  // 決済設定
  {
    setting_key: 'payment_enabled',
    setting_value: { enabled: false },
    description: 'KOMOJU決済機能の有効/無効を設定します',
    category: 'payment',
    is_enabled: false,
  },
  {
    setting_key: 'payment_methods',
    setting_value: {
      enabled: false,
      credit_card: false,
      konbini: false,
      bank_transfer: false,
    },
    description: '利用可能な決済方法を選択します',
    category: 'payment',
    is_enabled: false,
  },
  
  // チャット設定
  {
    setting_key: 'chat_enabled',
    setting_value: {
      enabled: true,
      auto_response: true,
      business_hours_only: false,
    },
    description: 'AIチャット機能の有効/無効を設定します',
    category: 'chat',
    is_enabled: true,
  },
  {
    setting_key: 'chat_staff_connection',
    setting_value: { enabled: true },
    description: 'スタッフ接続機能の有効/無効を設定します',
    category: 'chat',
    is_enabled: true,
  },
  
  // 通知設定
  {
    setting_key: 'email_enabled',
    setting_value: { enabled: true },
    description: 'メール通知機能の有効/無効を設定します',
    category: 'notification',
    is_enabled: true,
  },
  {
    setting_key: 'email_reminder_timing',
    setting_value: {
      enabled: true,
      before_24h: true,
      before_2h: true,
      before_30m: false,
    },
    description: 'メールリマインダーの送信タイミングを設定します',
    category: 'notification',
    is_enabled: true,
  },
  {
    setting_key: 'sms_enabled',
    setting_value: { enabled: false },
    description: 'SMS通知機能の有効/無効を設定します',
    category: 'notification',
    is_enabled: false,
  },
  {
    setting_key: 'sms_reminder_timing',
    setting_value: {
      enabled: false,
      before_24h: false,
      before_2h: true,
      before_30m: false,
    },
    description: 'SMSリマインダーの送信タイミングを設定します',
    category: 'notification',
    is_enabled: false,
  },
  
  // 予約設定
  {
    setting_key: 'booking_approval_required',
    setting_value: { enabled: true },
    description: '予約の管理者による承認を必須にします',
    category: 'booking',
    is_enabled: true,
  },
  {
    setting_key: 'booking_cancel_policy',
    setting_value: {
      enabled: true,
      cancel_before_hours: 24,
      allow_urgent_cancel: true,
    },
    description: '予約キャンセルポリシーを設定します',
    category: 'booking',
    is_enabled: true,
  },
  
  // 一般設定
  {
    setting_key: 'clinic_info',
    setting_value: {
      name: '六本松 矯正歯科クリニック とよしま',
      phone: '092-406-2119',
      address: '福岡県福岡市中央区六本松2-11-30',
      email: 'info@example.com',
      business_hours: {
        monday: { start: '09:00', end: '18:30', available: true },
        tuesday: { start: '09:00', end: '18:30', available: true },
        wednesday: { start: '09:00', end: '18:30', available: true },
        thursday: { start: '09:00', end: '18:30', available: true },
        friday: { start: '09:00', end: '18:30', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false },
      },
    },
    description: 'クリニックの基本情報（医院名、連絡先、営業時間など）',
    category: 'general',
    is_enabled: true,
  },
];

export const ensureSystemSettings = async () => {
  try {
    console.log('システム設定の初期化を開始します');
    
    // 既存の設定を確認
    const { data: existingSettings, error: selectError } = await supabase
      .from('system_settings')
      .select('setting_key');
    
    if (selectError) {
      console.log('system_settingsテーブルが存在しない可能性があります。テーブルの作成が必要です。');
      // テーブル作成は手動で行う必要があります
      return false;
    }
    
    // 既存の設定キーを取得
    const existingKeys = existingSettings?.map(s => s.setting_key) || [];
    
    // 新しい設定のみを挿入
    const newSettings = defaultSystemSettings.filter(
      setting => !existingKeys.includes(setting.setting_key)
    );
    
    if (newSettings.length > 0) {
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert(newSettings);
      
      if (insertError) {
        console.error('システム設定の挿入エラー:', insertError);
        return false;
      }
      
      console.log(`${newSettings.length}件のシステム設定を追加しました`);
    } else {
      console.log('すべてのシステム設定が既に存在します');
    }
    
    return true;
  } catch (error) {
    console.error('ensureSystemSettings エラー:', error);
    return false;
  }
};

export const forceUpdateSystemSettings = async () => {
  try {
    console.log('システム設定の強制更新を開始します');
    
    // 既存の設定をすべて削除
    const { error: deleteError } = await supabase
      .from('system_settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('既存設定の削除エラー:', deleteError);
      return false;
    }
    
    // 新しい設定をすべて挿入
    const { error: insertError } = await supabase
      .from('system_settings')
      .insert(defaultSystemSettings);
    
    if (insertError) {
      console.error('システム設定の挿入エラー:', insertError);
      return false;
    }
    
    console.log('システム設定の強制更新が完了しました');
    return true;
  } catch (error) {
    console.error('forceUpdateSystemSettings エラー:', error);
    return false;
  }
};
