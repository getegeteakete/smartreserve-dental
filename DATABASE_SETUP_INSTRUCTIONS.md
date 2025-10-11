# 🔧 データベースセットアップ手順

## 📋 概要

新しく実装した機能を動作させるために、データベースに以下のテーブルを追加します：
1. `payment_sessions` - 決済セッション管理
2. `system_settings` - システム設定管理

## 🚀 セットアップ手順

### ステップ1: Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) を開く
2. プロジェクトを選択
3. 左サイドバーから **SQL Editor** をクリック

### ステップ2: 決済テーブルの作成

以下のSQLを実行します：

#### SQL 1: payment_sessions テーブル作成

```sql
-- 決済セッションテーブル
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_appointment_id ON payment_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);

-- appointmentsテーブルにpayment_statusカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_payment_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_sessions_updated_at_trigger
  BEFORE UPDATE ON payment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_sessions_updated_at();

-- RLSポリシーの設定
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- 管理者は全てのレコードにアクセス可能
CREATE POLICY "管理者は全ての決済セッションにアクセス可能"
  ON payment_sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- 一般ユーザーは自分の予約に関連する決済セッションのみ参照可能
CREATE POLICY "ユーザーは自分の決済セッションのみ参照可能"
  ON payment_sessions
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- コメントの追加
COMMENT ON TABLE payment_sessions IS '決済セッション情報を管理するテーブル';
COMMENT ON COLUMN payment_sessions.session_id IS 'KOMOJUのセッションID';
COMMENT ON COLUMN payment_sessions.appointment_id IS '関連する予約ID';
COMMENT ON COLUMN payment_sessions.amount IS '決済金額（円）';
COMMENT ON COLUMN payment_sessions.currency IS '通貨コード';
COMMENT ON COLUMN payment_sessions.status IS '決済ステータス（pending/completed/failed/cancelled/refunded）';
COMMENT ON COLUMN payment_sessions.payment_method IS '決済方法（credit_card/konbini/bank_transfer）';
COMMENT ON COLUMN payment_sessions.payment_details IS '決済の詳細情報（JSON）';
```

**実行方法：**
1. SQL Editorで新しいクエリを作成
2. 上記のSQLをコピー＆ペースト
3. 右下の「Run」ボタンをクリック
4. ✅ "Success. No rows returned" と表示されればOK

---

### ステップ3: システム設定テーブルの作成

#### SQL 2: system_settings テーブル作成

```sql
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

-- コメントの追加
COMMENT ON TABLE system_settings IS 'システム全体の設定を管理するテーブル';
COMMENT ON COLUMN system_settings.setting_key IS '設定のキー（一意）';
COMMENT ON COLUMN system_settings.setting_value IS '設定値（JSON形式で柔軟に保存）';
COMMENT ON COLUMN system_settings.description IS '設定の説明';
COMMENT ON COLUMN system_settings.category IS '設定のカテゴリ（payment/chat/notification/booking/general）';
COMMENT ON COLUMN system_settings.is_enabled IS '設定が有効かどうか';
```

**実行方法：**
1. SQL Editorで新しいクエリを作成
2. 上記のSQLをコピー＆ペースト
3. 「Run」ボタンをクリック
4. ✅ "Success. No rows returned" と表示されればOK

---

### ステップ4: デフォルト設定データの挿入

#### SQL 3: デフォルト設定の挿入

```sql
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
```

**実行方法：**
1. SQL Editorで新しいクエリを作成
2. 上記のSQLをコピー＆ペースト
3. 「Run」ボタンをクリック
4. ✅ "Success. 13 rows" と表示されればOK（既に存在する場合は0 rows）

---

## ✅ 確認方法

### テーブルが作成されたか確認

SQL Editorで以下を実行：

```sql
-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_sessions', 'system_settings')
ORDER BY table_name;
```

**期待される結果：**
```
payment_sessions
system_settings
```

### データが挿入されたか確認

```sql
-- システム設定を確認
SELECT setting_key, category, is_enabled, description
FROM system_settings
ORDER BY category, setting_key;
```

**期待される結果：** 13行のデータが表示される

---

## 🎉 完了！

以下の機能が使えるようになりました：

1. **管理画面 → システム設定**
   - 各機能のオン/オフ切り替え
   - カテゴリ別の設定管理

2. **決済機能**
   - 決済セッションの保存
   - 決済ステータスの管理

3. **チャット機能制御**
   - 設定で無効にするとチャットボタンが非表示

---

## ⚠️ トラブルシューティング

### エラー: "relation already exists"
→ テーブルが既に存在します。`DROP TABLE`で削除するか、そのまま続けてOK

### エラー: "permission denied"
→ 管理者権限でログインしているか確認

### データが表示されない
→ RLSポリシーの確認、またはService Roleで接続

---

## 📞 サポート

問題が発生した場合は、エラーメッセージをお知らせください。

**最終更新**: 2024年1月

