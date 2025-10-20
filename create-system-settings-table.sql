-- ============================================
-- システム設定テーブル
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);

-- RLS（Row Level Security）の設定
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー: 全ユーザーが読み取り可能、管理者のみ更新可能
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.system_settings
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable all access for authenticated users" ON public.system_settings
  FOR ALL USING (true);

-- トリガー: updated_at の自動更新
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- デフォルトシステム設定の挿入
-- ============================================

INSERT INTO public.system_settings (setting_key, setting_value, description, category, is_enabled) VALUES
-- 決済設定
('payment_enabled', '{"enabled": false}', 'KOMOJU決済機能の有効/無効を設定します', 'payment', false),
('payment_methods', '{"enabled": false, "credit_card": false, "konbini": false, "bank_transfer": false}', '利用可能な決済方法を選択します', 'payment', false),

-- チャット設定
('chat_enabled', '{"enabled": true, "auto_response": true, "business_hours_only": false}', 'AIチャット機能の有効/無効を設定します', 'chat', true),
('chat_staff_connection', '{"enabled": true}', 'スタッフ接続機能の有効/無効を設定します', 'chat', true),

-- 通知設定
('email_enabled', '{"enabled": true}', 'メール通知機能の有効/無効を設定します', 'notification', true),
('email_reminder_timing', '{"enabled": true, "before_24h": true, "before_2h": true, "before_30m": false}', 'メールリマインダーの送信タイミングを設定します', 'notification', true),
('sms_enabled', '{"enabled": false}', 'SMS通知機能の有効/無効を設定します', 'notification', false),
('sms_reminder_timing', '{"enabled": false, "before_24h": false, "before_2h": true, "before_30m": false}', 'SMSリマインダーの送信タイミングを設定します', 'notification', false),

-- 予約設定
('booking_approval_required', '{"enabled": true}', '予約の管理者による承認を必須にします', 'booking', true),
('booking_cancel_policy', '{"enabled": true, "cancel_before_hours": 24, "allow_urgent_cancel": true}', '予約キャンセルポリシーを設定します', 'booking', true),

-- 一般設定
('clinic_info', '{
  "name": "六本松 矯正歯科クリニック とよしま",
  "phone": "092-406-2119",
  "address": "福岡県福岡市中央区六本松2-11-30",
  "email": "info@example.com",
  "business_hours": {
    "monday": {"start": "09:00", "end": "18:30", "available": true},
    "tuesday": {"start": "09:00", "end": "18:30", "available": true},
    "wednesday": {"start": "09:00", "end": "18:30", "available": true},
    "thursday": {"start": "09:00", "end": "18:30", "available": true},
    "friday": {"start": "09:00", "end": "18:30", "available": true},
    "saturday": {"start": "09:00", "end": "17:00", "available": true},
    "sunday": {"start": "00:00", "end": "00:00", "available": false}
  }
}', 'クリニックの基本情報（医院名、連絡先、営業時間など）', 'general', true)

ON CONFLICT (setting_key) DO NOTHING;
