-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_enabled ON system_settings(is_enabled);

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at_trigger
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- RLSポリシーの設定
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが設定を参照可能
CREATE POLICY "全ユーザーが設定を参照可能"
  ON system_settings
  FOR SELECT
  USING (true);

-- 管理者のみが設定を更新可能
CREATE POLICY "管理者のみが設定を更新可能"
  ON system_settings
  FOR ALL
  USING (auth.role() = 'service_role');

-- デフォルト設定の挿入
INSERT INTO system_settings (setting_key, setting_value, description, category, is_enabled)
VALUES
  -- 決済機能設定
  (
    'payment_enabled',
    '{"enabled": true, "provider": "komoju", "test_mode": true}'::jsonb,
    '決済機能の有効/無効とプロバイダー設定',
    'payment',
    true
  ),
  (
    'payment_methods',
    '{"credit_card": true, "konbini": true, "bank_transfer": true}'::jsonb,
    '利用可能な決済方法',
    'payment',
    true
  ),
  
  -- チャット機能設定
  (
    'chat_enabled',
    '{"enabled": true, "auto_response": true, "business_hours_only": false}'::jsonb,
    'AIチャット機能の有効/無効と動作設定',
    'chat',
    true
  ),
  (
    'chat_staff_connection',
    '{"enabled": true, "max_concurrent_chats": 5}'::jsonb,
    'スタッフ接続機能の設定',
    'chat',
    true
  ),
  
  -- SMS通知設定
  (
    'sms_enabled',
    '{"enabled": false, "provider": "twilio", "send_confirmation": true, "send_reminder": true}'::jsonb,
    'SMS通知機能の有効/無効と送信設定',
    'notification',
    false
  ),
  (
    'sms_reminder_timing',
    '{"before_24h": true, "before_2h": true, "before_30m": false}'::jsonb,
    'SMSリマインダーの送信タイミング',
    'notification',
    false
  ),
  
  -- メール通知設定
  (
    'email_enabled',
    '{"enabled": true, "send_confirmation": true, "send_reminder": true, "send_cancellation": true}'::jsonb,
    'メール通知機能の設定',
    'notification',
    true
  ),
  (
    'email_reminder_timing',
    '{"before_24h": true, "before_2h": false, "on_morning": true}'::jsonb,
    'メールリマインダーの送信タイミング',
    'notification',
    true
  ),
  
  -- 予約システム設定
  (
    'booking_approval_required',
    '{"enabled": true, "auto_approve_returning_patients": false}'::jsonb,
    '予約の承認が必要かどうか',
    'booking',
    true
  ),
  (
    'booking_cancellation_policy',
    '{"allow_cancellation": true, "hours_before": 24, "refund_enabled": true}'::jsonb,
    '予約キャンセルポリシー',
    'booking',
    true
  ),
  
  -- 一般設定
  (
    'business_name',
    '{"name": "春空歯科クリニック", "name_en": "Harukora Dental Clinic"}'::jsonb,
    '医院名',
    'general',
    true
  ),
  (
    'contact_info',
    '{"phone": "03-1234-5678", "email": "info@harukora-dental.com", "address": "東京都渋谷区"}'::jsonb,
    '連絡先情報',
    'general',
    true
  ),
  (
    'business_hours',
    '{"weekday": "9:00-18:30", "saturday": "9:00-17:00", "sunday": "closed", "holiday": "closed"}'::jsonb,
    '営業時間',
    'general',
    true
  )
ON CONFLICT (setting_key) DO NOTHING;

-- コメントの追加
COMMENT ON TABLE system_settings IS 'システム全体の設定を管理するテーブル';
COMMENT ON COLUMN system_settings.setting_key IS '設定のキー（一意）';
COMMENT ON COLUMN system_settings.setting_value IS '設定値（JSON形式で柔軟に保存）';
COMMENT ON COLUMN system_settings.description IS '設定の説明';
COMMENT ON COLUMN system_settings.category IS '設定のカテゴリ（payment/chat/notification/booking/general）';
COMMENT ON COLUMN system_settings.is_enabled IS '設定が有効かどうか';

