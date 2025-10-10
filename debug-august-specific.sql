-- 8月のスケジュール状況を詳しく調査

-- 1. 8月の全スケジュール確認
SELECT 
  'clinic_schedules' as table_name,
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
WHERE year = 2024 AND month = 8
ORDER BY day_of_week, start_time;

-- 2. 8月25日の特別設定確認
SELECT 
  'special_clinic_schedules' as table_name,
  specific_date,
  start_time,
  end_time,
  is_available
FROM special_clinic_schedules 
WHERE specific_date = '2024-08-25';

-- 3. 8月の予約受付時間設定確認
SELECT 
  'booking_time_schedules' as table_name,
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
WHERE year = 2024 AND month = 8
ORDER BY day_of_week, start_time;

-- 4. 8月25日の特別予約受付時間設定確認
SELECT 
  'special_booking_time_schedules' as table_name,
  specific_date,
  start_time,
  end_time,
  is_available
FROM special_booking_time_schedules 
WHERE specific_date = '2024-08-25';

-- 5. 9月の月曜日設定と比較
SELECT 
  'clinic_schedules_september' as table_name,
  year, 
  month, 
  day_of_week, 
  start_time, 
  end_time, 
  is_available
FROM clinic_schedules 
WHERE year = 2024 AND month = 9 AND day_of_week = 1
ORDER BY start_time;