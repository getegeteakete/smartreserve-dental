-- ===================================
-- 予約受付時間管理用のRPC関数（改良版）
-- ===================================

-- Booking Time Schedule Update Function (improved version)
CREATE OR REPLACE FUNCTION public.update_booking_time_schedule(
  p_id uuid,
  p_start_time text,
  p_end_time text,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.booking_time_schedules
  SET 
    start_time = p_start_time,
    end_time = p_end_time,
    is_available = p_is_available,
    updated_at = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking time schedule not found: %', p_id;
  END IF;
END;
$$;

-- Special Booking Time Schedule Update Function (improved version)
CREATE OR REPLACE FUNCTION public.update_special_booking_time_schedule(
  p_id uuid,
  p_start_time text,
  p_end_time text,
  p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.special_booking_time_schedules
  SET 
    start_time = p_start_time,
    end_time = p_end_time,
    is_available = p_is_available,
    updated_at = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Special booking time schedule not found: %', p_id;
  END IF;
END;
$$;




