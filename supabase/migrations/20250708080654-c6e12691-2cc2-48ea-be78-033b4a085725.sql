-- キャンセル／再予約対応のためのデータベース関数を追加

-- 1. pending状態の予約を無効化する関数
CREATE OR REPLACE FUNCTION public.cancel_existing_pending_appointments(p_email text)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cancelled_count INTEGER;
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

-- 2. 再予約可能かどうかをチェックする関数
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
  
  -- 再予約可否の判定
  IF pending_count_val > 0 THEN
    RETURN QUERY SELECT 
      false::boolean,
      pending_count_val,
      confirmed_count_val,
      '既存の申込み中予約があります。新しい予約を行うと既存の申込みは自動的にキャンセルされます。'::text;
  ELSE
    RETURN QUERY SELECT 
      true::boolean,
      pending_count_val,
      confirmed_count_val,
      '新しい予約を申込みいただけます。'::text;
  END IF;
END;
$$;

-- 3. キャンセル理由付きでキャンセルする関数
CREATE OR REPLACE FUNCTION public.cancel_appointment_with_reason(
  p_appointment_id uuid,
  p_cancel_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  appointment_status text;
BEGIN
  -- 予約の現在のステータスを確認
  SELECT status INTO appointment_status
  FROM public.appointments
  WHERE id = p_appointment_id;
  
  -- 予約が存在しない場合
  IF appointment_status IS NULL THEN
    RAISE EXCEPTION '指定された予約が見つかりません';
  END IF;
  
  -- confirmed状態の予約はキャンセル不可
  IF appointment_status = 'confirmed' THEN
    RAISE EXCEPTION '確定済みの予約はキャンセルできません。管理者にお問い合わせください。';
  END IF;
  
  -- 予約をキャンセル状態に更新（キャンセル理由をnotesに追記）
  UPDATE public.appointments
  SET 
    status = 'cancelled',
    notes = CASE 
      WHEN notes IS NULL OR notes = '' THEN 
        CONCAT('キャンセル理由: ', COALESCE(p_cancel_reason, '理由の記載なし'))
      ELSE 
        CONCAT(notes, ' | キャンセル理由: ', COALESCE(p_cancel_reason, '理由の記載なし'))
    END,
    updated_at = now()
  WHERE id = p_appointment_id;
  
  RETURN true;
END;
$$;