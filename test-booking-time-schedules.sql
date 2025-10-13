-- ===================================
-- 予約受付時間設定のテストとセットアップ
-- ===================================

-- ステップ1: テーブルが存在するか確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'booking_time_schedules'
) AS booking_time_schedules_exists;

-- ステップ2: テーブルが存在しない場合は作成
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

CREATE TABLE IF NOT EXISTS public.special_booking_time_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specific_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ステップ3: RLSを有効化
ALTER TABLE public.booking_time_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_booking_time_schedules ENABLE ROW LEVEL SECURITY;

-- ステップ4: ポリシーを作成（全アクセス許可）
DROP POLICY IF EXISTS "Allow all access to booking time schedules" ON public.booking_time_schedules;
CREATE POLICY "Allow all access to booking time schedules"
ON public.booking_time_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to special booking time schedules" ON public.special_booking_time_schedules;
CREATE POLICY "Allow all access to special booking time schedules"
ON public.special_booking_time_schedules FOR ALL USING (true);

-- ステップ5: インデックス作成
CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_year_month
ON public.booking_time_schedules(year, month);

CREATE INDEX IF NOT EXISTS idx_booking_time_schedules_day_of_week
ON public.booking_time_schedules(day_of_week);

CREATE INDEX IF NOT EXISTS idx_special_booking_time_schedules_date
ON public.special_booking_time_schedules(specific_date);

-- ステップ6: サンプルデータを挿入（2025年10月の例）
-- 月曜日: 午前10:00-13:00、午後15:00-19:00
INSERT INTO public.booking_time_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES 
  (2025, 10, 1, '10:00:00', '13:00:00', true),
  (2025, 10, 1, '15:00:00', '19:00:00', true)
ON CONFLICT DO NOTHING;

-- 火曜日: 午前10:00-13:00、午後15:00-19:00
INSERT INTO public.booking_time_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES 
  (2025, 10, 2, '10:00:00', '13:00:00', true),
  (2025, 10, 2, '15:00:00', '19:00:00', true)
ON CONFLICT DO NOTHING;

-- 水曜日: 午前10:00-13:00、午後15:00-19:00
INSERT INTO public.booking_time_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES 
  (2025, 10, 3, '10:00:00', '13:00:00', true),
  (2025, 10, 3, '15:00:00', '19:00:00', true)
ON CONFLICT DO NOTHING;

-- 金曜日: 午前10:00-13:00、午後15:00-19:00
INSERT INTO public.booking_time_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES 
  (2025, 10, 5, '10:00:00', '13:00:00', true),
  (2025, 10, 5, '15:00:00', '19:00:00', true)
ON CONFLICT DO NOTHING;

-- 土曜日: 午前9:00-12:30
INSERT INTO public.booking_time_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES 
  (2025, 10, 6, '09:00:00', '12:30:00', true)
ON CONFLICT DO NOTHING;

-- ステップ7: データ確認
SELECT 
  id,
  year,
  month,
  CASE day_of_week
    WHEN 0 THEN '日曜日'
    WHEN 1 THEN '月曜日'
    WHEN 2 THEN '火曜日'
    WHEN 3 THEN '水曜日'
    WHEN 4 THEN '木曜日'
    WHEN 5 THEN '金曜日'
    WHEN 6 THEN '土曜日'
  END as day_name,
  start_time,
  end_time,
  is_available,
  created_at
FROM public.booking_time_schedules
WHERE year = 2025 AND month = 10
ORDER BY day_of_week, start_time;

