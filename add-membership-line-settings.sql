-- 会員登録機能とLINE連動機能の設定を追加

-- 会員登録機能の設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'membership_enabled',
  '{"enabled": false, "require_email_verification": true, "allow_guest_booking": true}'::jsonb,
  false,
  'membership',
  '会員登録機能を有効にする。無効の場合はゲスト予約のみ可能です。',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 会員登録時のメール認証設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'membership_email_verification',
  '{"require_verification": true, "resend_limit": 3}'::jsonb,
  true,
  'membership',
  '会員登録時のメール認証を必須にする',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ゲスト予約の許可設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'guest_booking_enabled',
  '{"enabled": true, "require_phone": true, "require_email": true}'::jsonb,
  true,
  'membership',
  '会員登録なしのゲスト予約を許可する',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- LINE連動機能の設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'line_integration_enabled',
  '{"enabled": false, "auto_friend_add": false, "send_booking_notification": true}'::jsonb,
  false,
  'line',
  'LINE連動機能を有効にする。予約通知やリマインダーをLINEで送信できます。',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- LINE通知の設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'line_notification_settings',
  '{"booking_confirmed": true, "booking_reminder": true, "booking_cancelled": true, "campaign_notification": false}'::jsonb,
  true,
  'line',
  'LINE通知の種類を設定する',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- LINE友だち追加設定
INSERT INTO system_settings (setting_key, setting_value, is_enabled, category, description, created_at, updated_at)
VALUES (
  'line_friend_settings',
  '{"require_friend_add": false, "offer_benefits": true, "benefits_description": "LINE友だち追加で予約がもっと便利に！"}'::jsonb,
  true,
  'line',
  'LINE友だち追加の設定と特典',
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO UPDATE
SET 
  setting_value = EXCLUDED.setting_value,
  is_enabled = EXCLUDED.is_enabled,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 設定の確認
SELECT 
  setting_key,
  setting_value,
  is_enabled,
  category,
  description
FROM system_settings
WHERE category IN ('membership', 'line')
ORDER BY category, setting_key;


