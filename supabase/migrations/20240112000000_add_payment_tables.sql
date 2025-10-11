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

