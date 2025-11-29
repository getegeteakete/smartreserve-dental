-- 予約関連のデータベース関数を作成・修正

-- 1. pending状態の予約をキャンセルする関数（改善版）
CREATE OR REPLACE FUNCTION public.cancel_existing_pending_appointments(p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cancelled_count integer;
BEGIN
  -- 既存のpending状態の予約をcancelledに変更
  UPDATE public.appointments 
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE email = p_email 
    AND status = 'pending';
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  
  -- キャンセルした件数を返す
  RETURN cancelled_count;
END;
$$;

-- 2. 予約受付時間スケジュール取得関数（存在しない場合に作成）
CREATE OR REPLACE FUNCTION public.get_booking_time_schedules(
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
  -- booking_time_schedulesテーブルが存在する場合のみクエリ
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_time_schedules') THEN
    RETURN QUERY
    SELECT
      s.id,
      s.year,
      s.month,
      s.day_of_week,
      s.start_time,
      s.end_time,
      s.is_available
    FROM public.booking_time_schedules s
    WHERE s.year = p_year AND s.month = p_month
    ORDER BY s.day_of_week, s.start_time;
  ELSE
    -- テーブルが存在しない場合は空の結果を返す
    RETURN;
  END IF;
END;
$$;

-- 3. 特別予約受付時間スケジュール取得関数（存在しない場合に作成）
CREATE OR REPLACE FUNCTION public.get_special_booking_time_schedules(
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
  -- special_booking_time_schedulesテーブルが存在する場合のみクエリ
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'special_booking_time_schedules') THEN
    RETURN QUERY
    SELECT
      s.id,
      s.specific_date,
      s.start_time,
      s.end_time,
      s.is_available
    FROM public.special_booking_time_schedules s
    WHERE EXTRACT(YEAR FROM s.specific_date::date) = p_year
      AND EXTRACT(MONTH FROM s.specific_date::date) = p_month
    ORDER BY s.specific_date, s.start_time;
  ELSE
    -- テーブルが存在しない場合は空の結果を返す
    RETURN;
  END IF;
END;
$$;

-- 4. 再予約可否チェック関数（改善版）
CREATE OR REPLACE FUNCTION public.check_rebooking_eligibility(p_email text)
RETURNS TABLE(
  can_rebook boolean,
  pending_count integer,
  confirmed_count integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_count_val INTEGER;
  confirmed_count_val INTEGER;
BEGIN
  -- pending状態の予約数を取得
  SELECT COUNT(*) INTO pending_count_val
  FROM public.appointments
  WHERE email = p_email AND status = 'pending';
  
  -- confirmed状態の予約数を取得
  SELECT COUNT(*) INTO confirmed_count_val
  FROM public.appointments
  WHERE email = p_email AND status = 'confirmed';
  
  -- 再予約可否の判定（pending予約があっても自動キャンセルするので常にtrue）
  RETURN QUERY SELECT 
    true::boolean,
    pending_count_val,
    confirmed_count_val,
    CASE 
      WHEN pending_count_val > 0 THEN 
        '既存の申込み中予約があります。新しい予約を行うと既存の申込みは自動的にキャンセルされます。'::text
      ELSE 
        '新しい予約を申込みいただけます。'::text
    END;
END;
$$;

