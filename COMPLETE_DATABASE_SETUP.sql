-- ============================================
-- SmartReserve予約システム - 完全データベースセットアップ
-- ©合同会社UMA
-- ============================================
-- 
-- このファイルには、SmartReserve予約システムに必要な
-- すべてのテーブル、関数、トリガー、ポリシーが含まれています。
--
-- 使い方:
-- 1. 新しいSupabaseプロジェクトを作成
-- 2. SQL Editorでこのファイル全体を実行
-- 3. すべてのテーブルと関数が作成されます
--
-- ============================================

-- ============================================
-- 共通関数: updated_atの自動更新
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 患者情報テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
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

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS patients_phone_unique ON public.patients(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS patients_email_unique ON public.patients(email) WHERE email IS NOT NULL;

-- RLSとポリシー
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.patients FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON public.patients 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 治療カテゴリーテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.treatment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLSとポリシー
ALTER TABLE public.treatment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to treatment categories" ON public.treatment_categories FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_treatment_categories_updated_at ON public.treatment_categories;
CREATE TRIGGER update_treatment_categories_updated_at 
  BEFORE UPDATE ON public.treatment_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 治療メニューテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  fee INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.treatment_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLSとポリシー
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to treatments" ON public.treatments FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at 
  BEFORE UPDATE ON public.treatments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 予約ステータス enum
-- ============================================
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 予約テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  age INTEGER,
  appointment_date TEXT NOT NULL,
  confirmed_date TEXT,
  confirmed_time_slot TEXT,
  treatment_name TEXT,
  fee INTEGER,
  notes TEXT,
  status appointment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_appointments_email ON public.appointments(email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(confirmed_date);

-- RLSとポリシー
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to appointments" ON public.appointments FOR ALL USING (true);

-- ============================================
-- 予約希望日時テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointment_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  preferred_date TEXT NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  preference_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLSとポリシー
ALTER TABLE public.appointment_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to appointment preferences" ON public.appointment_preferences FOR ALL USING (true);

-- ============================================
-- 予約トークンテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointment_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_appointment_tokens_token ON public.appointment_tokens(token);

-- RLSとポリシー
ALTER TABLE public.appointment_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to appointment tokens" ON public.appointment_tokens FOR ALL USING (true);

-- ============================================
-- クリニックスケジュールテーブル（曜日ベース）
-- ============================================
CREATE TABLE IF NOT EXISTS public.clinic_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_clinic_schedules_year_month ON public.clinic_schedules(year, month);
CREATE INDEX IF NOT EXISTS idx_clinic_schedules_day_of_week ON public.clinic_schedules(day_of_week);

-- RLSとポリシー
ALTER TABLE public.clinic_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to clinic schedules" ON public.clinic_schedules FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_clinic_schedules_updated_at ON public.clinic_schedules;
CREATE TRIGGER update_clinic_schedules_updated_at 
  BEFORE UPDATE ON public.clinic_schedules 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 特別スケジュールテーブル（日付指定）
-- ============================================
CREATE TABLE IF NOT EXISTS public.special_clinic_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specific_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_special_clinic_schedules_date ON public.special_clinic_schedules(specific_date);

-- RLSとポリシー
ALTER TABLE public.special_clinic_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to special clinic schedules" ON public.special_clinic_schedules FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_special_clinic_schedules_updated_at ON public.special_clinic_schedules;
CREATE TRIGGER update_special_clinic_schedules_updated_at 
  BEFORE UPDATE ON public.special_clinic_schedules 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 治療制限テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.treatment_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_name TEXT NOT NULL UNIQUE,
  max_reservations_per_slot INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLSとポリシー
ALTER TABLE public.treatment_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to treatment limits" ON public.treatment_limits FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_treatment_limits_updated_at ON public.treatment_limits;
CREATE TRIGGER update_treatment_limits_updated_at 
  BEFORE UPDATE ON public.treatment_limits 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 予約制限テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.reservation_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  last_reservation_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reservation_limits_email ON public.reservation_limits(email);

-- RLSとポリシー
ALTER TABLE public.reservation_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to reservation limits" ON public.reservation_limits FOR ALL USING (true);

-- ============================================
-- プロフィールテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLSとポリシー
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);

-- ============================================
-- 決済情報テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method_type TEXT,
  receipt_url TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- RLSとポリシー
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for service role" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for service role" ON public.payments FOR UPDATE USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- リマインダー設定テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  reminder_type TEXT NOT NULL,
  days_before INTEGER NOT NULL,
  time_of_day TIME DEFAULT '10:00:00',
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSとポリシー
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for service role" ON public.reminder_settings FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.reminder_settings FOR ALL USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_reminder_settings_updated_at ON public.reminder_settings;
CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトのリマインダー設定を挿入
INSERT INTO public.reminder_settings (name, enabled, reminder_type, days_before, time_of_day, message_template)
VALUES 
    ('1日前リマインダー', true, 'both', 1, '10:00:00', 'こんにちは。明日 {date} {time} にご予約があります。お気をつけてお越しください。'),
    ('3日前リマインダー', false, 'email', 3, '10:00:00', '{date} {time} にご予約があります。3日後となりました。')
ON CONFLICT DO NOTHING;

-- ============================================
-- 送信済みリマインダー履歴テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.sent_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_setting_id UUID REFERENCES public.reminder_settings(id) ON DELETE SET NULL,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sent_reminders_appointment_id ON public.sent_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sent_reminders_sent_at ON public.sent_reminders(sent_at);

-- RLSとポリシー
ALTER TABLE public.sent_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for service role" ON public.sent_reminders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.sent_reminders FOR INSERT WITH CHECK (true);

-- ============================================
-- SMS送信履歴テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  purpose TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment_id ON public.sms_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON public.sms_logs(created_at);

-- RLSとポリシー
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for service role" ON public.sms_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.sms_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for service role" ON public.sms_logs FOR UPDATE USING (true);

-- トリガー
DROP TRIGGER IF EXISTS update_sms_logs_updated_at ON public.sms_logs;
CREATE TRIGGER update_sms_logs_updated_at BEFORE UPDATE ON public.sms_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- データベース関数
-- ============================================

-- 予約制限チェック関数
CREATE OR REPLACE FUNCTION public.check_reservation_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  limit_count integer := 3;
  current_count integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.appointments
  WHERE email = p_email AND status = 'pending';
  
  RETURN current_count < limit_count;
END;
$$;

-- 診療内容別予約制限チェック関数
CREATE OR REPLACE FUNCTION public.check_treatment_reservation_limit(
  p_email text,
  p_treatment_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  limit_count integer := 1;
BEGIN
  SELECT COALESCE(max_reservations_per_slot, 1) INTO limit_count
  FROM public.treatment_limits
  WHERE treatment_name = p_treatment_name;
  
  SELECT COUNT(*) INTO current_count
  FROM public.appointments
  WHERE email = p_email 
    AND treatment_name = p_treatment_name 
    AND status IN ('pending', 'confirmed');
  
  RETURN current_count < limit_count;
END;
$$;

-- 予約時間重複チェック関数
CREATE OR REPLACE FUNCTION public.check_appointment_time_conflict(
  p_email text,
  p_confirmed_date text,
  p_confirmed_time_slot text,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conflict_count integer;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE email = p_email
    AND confirmed_date = p_confirmed_date
    AND confirmed_time_slot = p_confirmed_time_slot
    AND status IN ('pending', 'confirmed')
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id);
  
  RETURN conflict_count = 0;
END;
$$;

-- 確定済み予約との時間重複チェック関数
CREATE OR REPLACE FUNCTION public.check_confirmed_time_conflict(
  p_email text,
  p_date text,
  p_time_slot text,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conflict_count integer;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE email = p_email
    AND confirmed_date = p_date
    AND confirmed_time_slot = p_time_slot
    AND status = 'confirmed'
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id);
  
  RETURN conflict_count = 0;
END;
$$;

-- 希望日時重複チェック関数
CREATE OR REPLACE FUNCTION public.check_preferred_dates_conflict(
  p_email text,
  p_preferred_dates jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pref_date record;
  conflict_count integer;
  total_conflicts integer := 0;
BEGIN
  FOR pref_date IN 
    SELECT 
      (value->>'date')::text as date_val,
      (value->>'timeSlot')::text as time_slot
    FROM jsonb_array_elements(p_preferred_dates) 
  LOOP
    SELECT COUNT(*) INTO conflict_count
    FROM public.appointments
    WHERE email = p_email
      AND confirmed_date = pref_date.date_val
      AND confirmed_time_slot = pref_date.time_slot
      AND status IN ('pending', 'confirmed');
    
    total_conflicts := total_conflicts + conflict_count;
  END LOOP;
  
  RETURN total_conflicts = 0;
END;
$$;

-- 予約キャンセル関数
CREATE OR REPLACE FUNCTION public.cancel_appointment_with_reason(
  p_appointment_id uuid,
  p_cancel_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.appointments
  SET status = 'cancelled'
  WHERE id = p_appointment_id;
  
  RETURN FOUND;
END;
$$;

-- pending状態の予約をキャンセル
CREATE OR REPLACE FUNCTION public.cancel_existing_pending_appointments(p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cancelled_count integer;
BEGIN
  UPDATE public.appointments
  SET status = 'cancelled'
  WHERE email = p_email AND status = 'pending'
  RETURNING COUNT(*) INTO cancelled_count;
  
  RETURN COALESCE(cancelled_count, 0);
END;
$$;

-- 再予約可否チェック
CREATE OR REPLACE FUNCTION public.check_rebooking_eligibility(p_email text)
RETURNS TABLE(can_rebook boolean, pending_count integer, confirmed_count integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pending_count integer;
  v_confirmed_count integer;
  v_can_rebook boolean;
  v_message text;
BEGIN
  SELECT COUNT(*) INTO v_pending_count
  FROM public.appointments
  WHERE email = p_email AND status = 'pending';
  
  SELECT COUNT(*) INTO v_confirmed_count
  FROM public.appointments
  WHERE email = p_email AND status = 'confirmed';
  
  IF v_confirmed_count > 0 THEN
    v_can_rebook := false;
    v_message := '既に確定済みの予約があります';
  ELSIF v_pending_count >= 3 THEN
    v_can_rebook := false;
    v_message := '保留中の予約が3件あります';
  ELSE
    v_can_rebook := true;
    v_message := '再予約可能';
  END IF;
  
  RETURN QUERY SELECT v_can_rebook, v_pending_count, v_confirmed_count, v_message;
END;
$$;

-- 予約制限記録関数
CREATE OR REPLACE FUNCTION public.record_reservation_limit(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN;
END;
$$;

-- 古い予約制限データのクリーンアップ関数
CREATE OR REPLACE FUNCTION public.cleanup_old_reservation_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN;
END;
$$;

-- 予約トークン生成関数
CREATE OR REPLACE FUNCTION public.generate_appointment_token(
  p_email text,
  p_appointment_id uuid,
  p_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token text;
BEGIN
  v_token := encode(gen_random_bytes(32), 'base64');
  
  INSERT INTO public.appointment_tokens (appointment_id, token, type, email)
  VALUES (p_appointment_id, v_token, p_type, p_email);
  
  RETURN v_token;
END;
$$;

-- 予約トークン検証関数
CREATE OR REPLACE FUNCTION public.validate_appointment_token(p_token text)
RETURNS TABLE(is_valid boolean, email text, appointment_id uuid, type text, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token_record record;
  v_is_valid boolean;
  v_error_message text;
BEGIN
  SELECT * INTO v_token_record
  FROM public.appointment_tokens
  WHERE token = p_token;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::text, NULL::uuid, ''::text, 'トークンが見つかりません'::text;
    RETURN;
  END IF;
  
  IF v_token_record.used THEN
    RETURN QUERY SELECT false, ''::text, NULL::uuid, ''::text, 'トークンは既に使用済みです'::text;
    RETURN;
  END IF;
  
  IF v_token_record.expires_at < now() THEN
    RETURN QUERY SELECT false, ''::text, NULL::uuid, ''::text, 'トークンの有効期限が切れています'::text;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, v_token_record.email, v_token_record.appointment_id, v_token_record.type, ''::text;
END;
$$;

-- トークン使用済みマーク
CREATE OR REPLACE FUNCTION public.mark_token_as_used(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.appointment_tokens
  SET used = true
  WHERE token = p_token;
  
  RETURN FOUND;
END;
$$;

-- クリニックスケジュール取得
CREATE OR REPLACE FUNCTION public.get_clinic_schedules(p_year integer, p_month integer)
RETURNS TABLE(
  id uuid,
  year integer,
  month integer,
  day_of_week integer,
  start_time text,
  end_time text,
  is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT cs.id, cs.year, cs.month, cs.day_of_week, cs.start_time, cs.end_time, cs.is_available
  FROM public.clinic_schedules cs
  WHERE cs.year = p_year AND cs.month = p_month;
END;
$$;

-- 特別スケジュール取得
CREATE OR REPLACE FUNCTION public.get_special_clinic_schedules(p_year integer, p_month integer)
RETURNS TABLE(
  id uuid,
  specific_date text,
  start_time text,
  end_time text,
  is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT scs.id, scs.specific_date, scs.start_time, scs.end_time, scs.is_available
  FROM public.special_clinic_schedules scs
  WHERE scs.specific_date LIKE (p_year || '-' || lpad(p_month::text, 2, '0') || '%');
END;
$$;

-- スケジュール挿入
CREATE OR REPLACE FUNCTION public.insert_clinic_schedule(
  p_year integer,
  p_month integer,
  p_day_of_week integer,
  p_start_time text,
  p_end_time text,
  p_is_available boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.clinic_schedules (year, month, day_of_week, start_time, end_time, is_available)
  VALUES (p_year, p_month, p_day_of_week, p_start_time, p_end_time, p_is_available)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- 特別スケジュール挿入
CREATE OR REPLACE FUNCTION public.insert_special_clinic_schedule(
  p_specific_date text,
  p_start_time text,
  p_end_time text,
  p_is_available boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.special_clinic_schedules (specific_date, start_time, end_time, is_available)
  VALUES (p_specific_date, p_start_time, p_end_time, p_is_available)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- スケジュール更新
CREATE OR REPLACE FUNCTION public.update_clinic_schedule(p_id uuid, p_is_available boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.clinic_schedules
  SET is_available = p_is_available
  WHERE id = p_id;
END;
$$;

-- 特別スケジュール更新
CREATE OR REPLACE FUNCTION public.update_special_clinic_schedule(p_id uuid, p_is_available boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.special_clinic_schedules
  SET is_available = p_is_available
  WHERE id = p_id;
END;
$$;

-- 特別スケジュール削除
CREATE OR REPLACE FUNCTION public.delete_special_clinic_schedule(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.special_clinic_schedules WHERE id = p_id;
END;
$$;

-- 治療制限取得
CREATE OR REPLACE FUNCTION public.get_treatment_limits()
RETURNS TABLE(
  id uuid,
  treatment_name text,
  max_reservations_per_slot integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT tl.id, tl.treatment_name, tl.max_reservations_per_slot
  FROM public.treatment_limits tl;
END;
$$;

-- 治療制限のupsert
CREATE OR REPLACE FUNCTION public.upsert_treatment_limit(
  p_treatment_name text,
  p_max_reservations integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.treatment_limits (treatment_name, max_reservations_per_slot)
  VALUES (p_treatment_name, p_max_reservations)
  ON CONFLICT (treatment_name) 
  DO UPDATE SET max_reservations_per_slot = p_max_reservations
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- ============================================
-- セットアップ完了
-- ============================================
-- すべてのテーブル、関数、トリガー、ポリシーが作成されました。
-- SmartReserve予約システムの準備が完了しました！
-- 
-- 次のステップ:
-- 1. Edge Functionsをデプロイ
-- 2. 環境変数を設定
-- 3. アプリケーションを起動
-- 
-- 詳細は SETUP_GUIDE.md を参照してください。


