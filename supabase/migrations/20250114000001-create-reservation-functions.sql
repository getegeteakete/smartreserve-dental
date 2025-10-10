-- 予約制限と重複チェック関数の作成

-- 予約制限チェック関数
CREATE OR REPLACE FUNCTION public.check_reservation_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  limit_count integer := 3; -- 基本制限数
  current_count integer;
BEGIN
  -- 現在のpending状態の予約数を取得
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
  limit_count integer := 1; -- デフォルト制限数
BEGIN
  -- 診療内容別の制限を取得
  SELECT COALESCE(max_reservations_per_slot, 1) INTO limit_count
  FROM public.treatment_limits
  WHERE treatment_name = p_treatment_name;
  
  -- 現在の同一診療内容での予約数を取得
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
  
  RETURN conflict_count = 0; -- 重複がない場合はtrue
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
  
  RETURN conflict_count = 0; -- 重複がない場合はtrue
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
  -- 各希望日時をチェック
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
  
  RETURN total_conflicts = 0; -- すべての希望日時で重複がない場合はtrue
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
  -- 現在は何もしない（将来の拡張用）
  -- 必要に応じて予約制限の記録ロジックを実装
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
  -- 現在は何もしない（将来の拡張用）
  -- 必要に応じて古いデータの削除ロジックを実装
  RETURN;
END;
$$; 