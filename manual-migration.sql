-- Supabase Manual Migration SQL
-- 手動実行用SQLファイル

-- ===================================
-- 1. テーブル作成
-- ===================================

-- Schedule Management Tables Creation

-- Basic Schedule Table (day-of-week based schedule) - 営業時間
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

-- Booking Time Schedule Table (day-of-week based booking schedule) - 予約受付時間
CREATE TABLE IF NOT EXISTS public.booking_time_schedules (
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

-- Special Schedule Table (specific date schedule) - 特別営業時間
CREATE TABLE IF NOT EXISTS public.special_clinic_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specific_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Special Booking Time Schedule Table (specific date booking schedule) - 特別予約受付時間
CREATE TABLE IF NOT EXISTS public.special_booking_time_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specific_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Treatment Limits Table (reservation limits per treatment type)
CREATE TABLE IF NOT EXISTS public.treatment_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_name TEXT NOT NULL UNIQUE,
  max_reservations_per_slot INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===================================
-- 2. インデックス作成
-- ===================================

-- Index Creation for clinic_schedules
CREATE INDEX IF NOT EXISTS idx_clinic_schedules_year_month
ON public.clinic_schedules(year, month);

CREATE INDEX IF NOT EXISTS idx_clinic_schedules_day_of_week
ON public.clinic_schedules(day_of_week);

-- Index Creation for booking_time_schedules
CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_year_month
ON public.booking_time_schedules(year, month);

CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_day_of_week
ON public.booking_time_schedules(day_of_week);

-- Index Creation for special_clinic_schedules
CREATE INDEX IF NOT EXISTS idx_special_clinic_schedules_date
ON public.special_clinic_schedules(specific_date);

-- Index Creation for special_booking_time_schedules
CREATE INDEX IF NOT EXISTS idx_special_booking_time_schedules_date
ON public.special_booking_time_schedules(specific_date);

-- ===================================
-- 3. RLS (Row Level Security) 設定
-- ===================================

-- Enable RLS
ALTER TABLE public.clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_time_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_booking_time_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_limits ENABLE ROW LEVEL SECURITY;

-- Policy Creation (currently allow all access)
DROP POLICY IF EXISTS "Allow all access to clinic schedules" ON public.clinic_schedules;
CREATE POLICY "Allow all access to clinic schedules"
ON public.clinic_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to booking time schedules" ON public.booking_time_schedules;
CREATE POLICY "Allow all access to booking time schedules"
ON public.booking_time_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to special clinic schedules" ON public.special_clinic_schedules;
CREATE POLICY "Allow all access to special clinic schedules"
ON public.special_clinic_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to special booking time schedules" ON public.special_booking_time_schedules;
CREATE POLICY "Allow all access to special booking time schedules"
ON public.special_booking_time_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to treatment limits" ON public.treatment_limits;
CREATE POLICY "Allow all access to treatment limits"
ON public.treatment_limits FOR ALL USING (true);

-- ===================================
-- 4. 自動更新トリガー設定
-- ===================================

-- Auto-update updated_at trigger for clinic_schedules
DROP TRIGGER IF EXISTS update_clinic_schedules_updated_at ON public.clinic_schedules;
CREATE TRIGGER update_clinic_schedules_updated_at
  BEFORE UPDATE ON public.clinic_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at trigger for booking_time_schedules
DROP TRIGGER IF EXISTS update_booking_time_schedules_updated_at ON public.booking_time_schedules;
CREATE TRIGGER update_booking_time_schedules_updated_at
  BEFORE UPDATE ON public.booking_time_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at trigger for special_clinic_schedules
DROP TRIGGER IF EXISTS update_special_clinic_schedules_updated_at ON public.special_clinic_schedules;
CREATE TRIGGER update_special_clinic_schedules_updated_at
  BEFORE UPDATE ON public.special_clinic_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at trigger for special_booking_time_schedules
DROP TRIGGER IF EXISTS update_special_booking_time_schedules_updated_at ON public.special_booking_time_schedules;
CREATE TRIGGER update_special_booking_time_schedules_updated_at
  BEFORE UPDATE ON public.special_booking_time_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at trigger for treatment_limits
DROP TRIGGER IF EXISTS update_treatment_limits_updated_at ON public.treatment_limits;
CREATE TRIGGER update_treatment_limits_updated_at
  BEFORE UPDATE ON public.treatment_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================
-- 5. RPC関数 - 営業時間管理（clinic_schedules）
-- ===================================

-- Basic Schedule Fetch Function
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

-- Basic Schedule Insert Function (with upsert logic)
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
  -- Check for existing record
  SELECT id INTO existing_id
  FROM public.clinic_schedules
  WHERE year = p_year
    AND month = p_month
    AND day_of_week = p_day_of_week
    AND start_time = p_start_time
    AND end_time = p_end_time;

  -- If exists, update; otherwise, insert
  IF existing_id IS NOT NULL THEN
    UPDATE public.clinic_schedules
    SET is_available = p_is_available, updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;

  -- New record creation
  INSERT INTO public.clinic_schedules (
    year, month, day_of_week, start_time, end_time, is_available
  ) VALUES (
    p_year, p_month, p_day_of_week, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Basic Schedule Update Function
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
    RAISE EXCEPTION 'Schedule not found: %', p_id;
  END IF;
END;
$$;

-- ===================================
-- 6. RPC関数 - 予約受付時間管理（booking_time_schedules）
-- ===================================

-- Booking Time Schedule Fetch Function
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
END;
$$;

-- Booking Time Schedule Insert Function (with upsert logic)
CREATE OR REPLACE FUNCTION public.insert_booking_time_schedule(
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
  -- Check for existing record
  SELECT id INTO existing_id
  FROM public.booking_time_schedules
  WHERE year = p_year
    AND month = p_month
    AND day_of_week = p_day_of_week
    AND start_time = p_start_time
    AND end_time = p_end_time;

  -- If exists, update; otherwise, insert
  IF existing_id IS NOT NULL THEN
    UPDATE public.booking_time_schedules
    SET is_available = p_is_available, updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;

  -- New record creation
  INSERT INTO public.booking_time_schedules (
    year, month, day_of_week, start_time, end_time, is_available
  ) VALUES (
    p_year, p_month, p_day_of_week, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Booking Time Schedule Update Function
CREATE OR REPLACE FUNCTION public.update_booking_time_schedule(
  p_id uuid,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.booking_time_schedules
  SET is_available = p_is_available, updated_at = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking time schedule not found: %', p_id;
  END IF;
END;
$$;

-- ===================================
-- 7. RPC関数 - 特別営業時間管理（special_clinic_schedules）
-- ===================================

-- Special Schedule Fetch Function
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

-- Special Schedule Insert Function
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
BEGIN
  INSERT INTO public.special_clinic_schedules (
    specific_date, start_time, end_time, is_available
  ) VALUES (
    p_specific_date, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Special Schedule Update Function
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
    RAISE EXCEPTION 'Special schedule not found: %', p_id;
  END IF;
END;
$$;

-- Special Schedule Delete Function
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
    RAISE EXCEPTION 'Special schedule not found: %', p_id;
  END IF;
END;
$$;

-- ===================================
-- 8. RPC関数 - 特別予約受付時間管理（special_booking_time_schedules）
-- ===================================

-- Special Booking Time Schedule Fetch Function
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
END;
$$;

-- Special Booking Time Schedule Insert Function
CREATE OR REPLACE FUNCTION public.insert_special_booking_time_schedule(
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
BEGIN
  INSERT INTO public.special_booking_time_schedules (
    specific_date, start_time, end_time, is_available
  ) VALUES (
    p_specific_date, p_start_time, p_end_time, p_is_available
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Special Booking Time Schedule Update Function
CREATE OR REPLACE FUNCTION public.update_special_booking_time_schedule(
  p_id uuid,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.special_booking_time_schedules
  SET is_available = p_is_available, updated_at = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Special booking time schedule not found: %', p_id;
  END IF;
END;
$$;

-- Special Booking Time Schedule Delete Function
CREATE OR REPLACE FUNCTION public.delete_special_booking_time_schedule(
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.special_booking_time_schedules
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Special booking time schedule not found: %', p_id;
  END IF;
END;
$$;

-- ===================================
-- 9. RPC関数 - 診療制限管理（treatment_limits）
-- ===================================

-- Treatment Limits Fetch Function
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

-- Treatment Limits Upsert Function
CREATE OR REPLACE FUNCTION public.upsert_treatment_limit(
  p_treatment_name text,
  p_max_reservations_per_slot integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_id uuid;
BEGIN
  INSERT INTO public.treatment_limits (treatment_name, max_reservations_per_slot)
  VALUES (p_treatment_name, p_max_reservations_per_slot)
  ON CONFLICT (treatment_name)
  DO UPDATE SET
    max_reservations_per_slot = EXCLUDED.max_reservations_per_slot,
    updated_at = now()
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

-- Treatment Limits Delete Function
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
    RAISE EXCEPTION 'Treatment limit not found: %', p_treatment_name;
  END IF;
END;
$$;

-- ===================================
-- 10. RPC関数 - 予約制限・衝突チェック
-- ===================================

-- Reservation Limit Check Function
CREATE OR REPLACE FUNCTION public.check_reservation_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  limit_count integer := 3; -- Basic limit
  current_count integer;
BEGIN
  -- Get current pending reservations count
  SELECT COUNT(*) INTO current_count
  FROM public.appointments
  WHERE email = p_email AND status = 'pending';

  RETURN current_count < limit_count;
END;
$$;

-- Treatment-specific Reservation Limit Check Function
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
  limit_count integer := 1; -- Default limit
BEGIN
  -- Get treatment-specific limit
  SELECT COALESCE(max_reservations_per_slot, 1) INTO limit_count
  FROM public.treatment_limits
  WHERE treatment_name = p_treatment_name;

  -- Get current reservations for the same treatment
  SELECT COUNT(*) INTO current_count
  FROM public.appointments
  WHERE email = p_email
    AND treatment_name = p_treatment_name
    AND status IN ('pending', 'confirmed');

  RETURN current_count < limit_count;
END;
$$;

-- Appointment Time Conflict Check Function
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

  RETURN conflict_count = 0; -- true if no conflict
END;
$$;

-- Confirmed Time Conflict Check Function
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

  RETURN conflict_count = 0; -- true if no conflict
END;
$$;

-- Preferred Dates Conflict Check Function
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
  -- Check each preferred date
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

  RETURN total_conflicts = 0; -- true if no conflict in any preferred date
END;
$$;

-- Record Reservation Limit Function (placeholder)
CREATE OR REPLACE FUNCTION public.record_reservation_limit(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Currently does nothing (for future extension)
  RETURN;
END;
$$;

-- Cleanup Old Reservation Limits Function (placeholder)
CREATE OR REPLACE FUNCTION public.cleanup_old_reservation_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Currently does nothing (for future extension)
  RETURN;
END;
$$; 