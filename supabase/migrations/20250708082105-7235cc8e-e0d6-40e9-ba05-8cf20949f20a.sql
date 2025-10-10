-- メールリンクベースの再予約・キャンセル機能のためのトークン管理テーブル

CREATE TABLE public.appointment_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  appointment_id uuid REFERENCES appointments(id),
  type text NOT NULL CHECK (type IN ('cancel', 'rebook')),
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS ポリシーの設定
ALTER TABLE public.appointment_tokens ENABLE ROW LEVEL SECURITY;

-- トークン検証用のポリシー（トークン文字列での検索を許可）
CREATE POLICY "Allow token validation" 
ON public.appointment_tokens 
FOR SELECT 
USING (true);

-- 管理者用のポリシー
CREATE POLICY "Allow admin access to tokens" 
ON public.appointment_tokens 
FOR ALL 
USING (true);

-- トークン生成用の関数
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
  token_value text;
BEGIN
  -- UUIDv4トークンを生成
  token_value := gen_random_uuid()::text;
  
  -- トークンをテーブルに挿入
  INSERT INTO public.appointment_tokens (email, appointment_id, type, token)
  VALUES (p_email, p_appointment_id, p_type, token_value);
  
  RETURN token_value;
END;
$$;

-- トークン検証用の関数
CREATE OR REPLACE FUNCTION public.validate_appointment_token(
  p_token text
)
RETURNS TABLE(
  is_valid boolean,
  email text,
  appointment_id uuid,
  type text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- トークンを検索
  SELECT * INTO token_record
  FROM public.appointment_tokens
  WHERE token = p_token;
  
  -- トークンが存在しない場合
  IF token_record IS NULL THEN
    RETURN QUERY SELECT 
      false::boolean,
      null::text,
      null::uuid,
      null::text,
      'トークンが無効です'::text;
    RETURN;
  END IF;
  
  -- 既に使用済みの場合
  IF token_record.used THEN
    RETURN QUERY SELECT 
      false::boolean,
      null::text,
      null::uuid,
      null::text,
      'このリンクは既に使用済みです'::text;
    RETURN;
  END IF;
  
  -- 有効期限切れの場合
  IF token_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      false::boolean,
      null::text,
      null::uuid,
      null::text,
      'このリンクの有効期限が切れています'::text;
    RETURN;
  END IF;
  
  -- 有効なトークンの場合
  RETURN QUERY SELECT 
    true::boolean,
    token_record.email,
    token_record.appointment_id,
    token_record.type,
    null::text;
END;
$$;

-- トークンを使用済みにマークする関数
CREATE OR REPLACE FUNCTION public.mark_token_as_used(
  p_token text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.appointment_tokens
  SET used = true, updated_at = now()
  WHERE token = p_token AND used = false;
  
  RETURN FOUND;
END;
$$;

-- スケジュール管理用のRPC関数を追加

-- 基本スケジュール取得関数
CREATE OR REPLACE FUNCTION public.get_clinic_schedules(
  p_year integer,
  p_month integer
)
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
  SELECT 
    s.id,
    s.year,
    s.month,
    s.day_of_week,
    s.start_time,
    s.end_time,
    s.is_available
  FROM public.clinic_schedules s
  WHERE s.year = p_year AND s.month = p_month
  ORDER BY s.day_of_week, s.start_time;
END;
$$;

-- 基本スケジュール作成関数
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
  new_id uuid;
  existing_id uuid;
BEGIN
  -- 重複チェック
  SELECT id INTO existing_id
  FROM public.clinic_schedules
  WHERE year = p_year 
    AND month = p_month 
    AND day_of_week = p_day_of_week 
    AND start_time = p_start_time 
    AND end_time = p_end_time;
  
  -- 既存のレコードがある場合は更新
  IF existing_id IS NOT NULL THEN
    UPDATE public.clinic_schedules 
    SET is_available = p_is_available, updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;
  
  -- 新規作成
  INSERT INTO public.clinic_schedules (
    year, month, day_of_week, start_time, end_time, is_available
  ) VALUES (
    p_year, p_month, p_day_of_week, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- 基本スケジュール更新関数
CREATE OR REPLACE FUNCTION public.update_clinic_schedule(
  p_id uuid,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.clinic_schedules
  SET is_available = p_is_available, updated_at = now()
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'スケジュールが見つかりません: %', p_id;
  END IF;
END;
$$;

-- 特別スケジュール取得関数
CREATE OR REPLACE FUNCTION public.get_special_clinic_schedules(
  p_year integer,
  p_month integer
)
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
  SELECT 
    s.id,
    s.specific_date,
    s.start_time,
    s.end_time,
    s.is_available
  FROM public.special_clinic_schedules s
  WHERE EXTRACT(YEAR FROM s.specific_date::date) = p_year 
    AND EXTRACT(MONTH FROM s.specific_date::date) = p_month
  ORDER BY s.specific_date, s.start_time;
END;
$$;

-- 特別スケジュール作成関数
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
  new_id uuid;
  existing_id uuid;
BEGIN
  -- 重複チェック
  SELECT id INTO existing_id
  FROM public.special_clinic_schedules
  WHERE specific_date = p_specific_date
    AND start_time = p_start_time 
    AND end_time = p_end_time;
  
  -- 既存のレコードがある場合は更新
  IF existing_id IS NOT NULL THEN
    UPDATE public.special_clinic_schedules 
    SET is_available = p_is_available, updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;
  
  -- 新規作成
  INSERT INTO public.special_clinic_schedules (
    specific_date, start_time, end_time, is_available
  ) VALUES (
    p_specific_date, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- 特別スケジュール更新関数
CREATE OR REPLACE FUNCTION public.update_special_clinic_schedule(
  p_id uuid,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.special_clinic_schedules
  SET is_available = p_is_available, updated_at = now()
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '特別スケジュールが見つかりません: %', p_id;
  END IF;
END;
$$;

-- 特別スケジュール削除関数
CREATE OR REPLACE FUNCTION public.delete_special_clinic_schedule(
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.special_clinic_schedules
  WHERE id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '削除対象の特別スケジュールが見つかりません: %', p_id;
  END IF;
END;
$$;

-- 診療制限取得関数
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
  SELECT 
    tl.id,
    tl.treatment_name,
    tl.max_reservations_per_slot
  FROM public.treatment_limits tl
  ORDER BY tl.treatment_name;
END;
$$;

-- 診療制限作成・更新関数
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
  limit_id uuid;
BEGIN
  -- 既存のレコードを確認
  SELECT id INTO limit_id
  FROM public.treatment_limits
  WHERE treatment_name = p_treatment_name;
  
  -- 既存のレコードがある場合は更新
  IF limit_id IS NOT NULL THEN
    UPDATE public.treatment_limits 
    SET max_reservations_per_slot = p_max_reservations, updated_at = now()
    WHERE id = limit_id;
    RETURN limit_id;
  END IF;
  
  -- 新規作成
  INSERT INTO public.treatment_limits (treatment_name, max_reservations_per_slot)
  VALUES (p_treatment_name, p_max_reservations)
  RETURNING id INTO limit_id;
  
  RETURN limit_id;
END;
$$;

-- 診療制限削除関数
CREATE OR REPLACE FUNCTION public.delete_treatment_limit(
  p_treatment_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.treatment_limits
  WHERE treatment_name = p_treatment_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '削除対象の診療制限が見つかりません: %', p_treatment_name;
  END IF;
END;
$$;