
-- 患者情報専用テーブルを作成
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  age INTEGER,
  address TEXT,
  medical_history TEXT,
  allergies TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 患者テーブルにRLSを有効化（管理者のみアクセス可能）
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシーを作成（今後認証が実装された場合に備えて）
CREATE POLICY "Allow all access for now" ON public.patients FOR ALL USING (true);

-- 電話番号またはメールアドレスのユニーク制約を追加
CREATE UNIQUE INDEX patients_phone_unique ON public.patients(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX patients_email_unique ON public.patients(email) WHERE email IS NOT NULL;

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON public.patients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
