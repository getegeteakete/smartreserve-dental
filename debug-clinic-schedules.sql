-- 月曜日（day_of_week = 1）の診療時間設定を確認
SELECT 
  year, 
  month, 
  day_of_week, 
  start_time, 
  end_time, 
  is_available,
  CASE 
    WHEN day_of_week = 0 THEN '日曜日'
    WHEN day_of_week = 1 THEN '月曜日'
    WHEN day_of_week = 2 THEN '火曜日'
    WHEN day_of_week = 3 THEN '水曜日'
    WHEN day_of_week = 4 THEN '木曜日'
    WHEN day_of_week = 5 THEN '金曜日'
    WHEN day_of_week = 6 THEN '土曜日'
  END as 曜日名
FROM clinic_schedules 
WHERE year = 2024 AND month = 8 AND day_of_week = 1  -- 8月の月曜日設定
ORDER BY start_time;

-- 8月25日の特別スケジュール設定もチェック
SELECT 
  specific_date,
  start_time,
  end_time,
  is_available
FROM special_clinic_schedules 
WHERE specific_date = '2024-08-25';

-- 予約受付時間設定もチェック
SELECT 
  year,
  month,
  day_of_week,
  start_time,
  end_time,
  is_available,
  CASE 
    WHEN day_of_week = 0 THEN '日曜日'
    WHEN day_of_week = 1 THEN '月曜日'
    WHEN day_of_week = 2 THEN '火曜日'
    WHEN day_of_week = 3 THEN '水曜日'
    WHEN day_of_week = 4 THEN '木曜日'
    WHEN day_of_week = 5 THEN '金曜日'
    WHEN day_of_week = 6 THEN '土曜日'
  END as 曜日名
FROM booking_time_schedules 
WHERE year = 2024 AND month = 8 AND day_of_week = 1  -- 8月の月曜日設定
ORDER BY start_time;

-- 8月25日の特別予約受付時間設定もチェック
SELECT 
  specific_date,
  start_time,
  end_time,
  is_available
FROM special_booking_time_schedules 
WHERE specific_date = '2024-08-25';