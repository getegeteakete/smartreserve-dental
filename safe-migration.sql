-- Safe Supabase Migration SQL
-- 安全実行用SQLファイル（DROP操作なし）

-- ===================================
-- 1. 新しいテーブル作成
-- ===================================

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

-- ===================================
-- 2. インデックス作成
-- ===================================

-- Index Creation for booking_time_schedules
CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_year_month
ON public.booking_time_schedules(year, month);

CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_day_of_week
ON public.booking_time_schedules(day_of_week);

-- Index Creation for special_booking_time_schedules
CREATE INDEX IF NOT EXISTS idx_special_booking_time_schedules_date
ON public.special_booking_time_schedules(specific_date);

-- ===================================
-- 3. RLS (Row Level Security) 設定
-- ===================================

-- Enable RLS
ALTER TABLE public.booking_time_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_booking_time_schedules ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 4. RPC関数 - 予約受付時間管理（booking_time_schedules）
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
-- 5. RPC関数 - 特別予約受付時間管理（special_booking_time_schedules）
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