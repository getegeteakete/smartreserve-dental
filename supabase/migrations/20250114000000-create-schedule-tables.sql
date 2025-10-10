-- スケジュール管理テーブルの作成

-- 基本スケジュールテーブル（曜日ベースのスケジュール）
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

-- 特別スケジュールテーブル（日付指定のスケジュール）
CREATE TABLE IF NOT EXISTS public.special_clinic_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specific_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 診療制限テーブル（診療内容別の予約数制限）
CREATE TABLE IF NOT EXISTS public.treatment_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_name TEXT NOT NULL UNIQUE,
  max_reservations_per_slot INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_clinic_schedules_year_month 
ON public.clinic_schedules(year, month);

CREATE INDEX IF NOT EXISTS idx_clinic_schedules_day_of_week 
ON public.clinic_schedules(day_of_week);

CREATE INDEX IF NOT EXISTS idx_special_clinic_schedules_date 
ON public.special_clinic_schedules(specific_date);

-- RLSの有効化
ALTER TABLE public.clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_limits ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成（現在は全アクセス許可）
CREATE POLICY "Allow all access to clinic schedules" 
ON public.clinic_schedules FOR ALL USING (true);

CREATE POLICY "Allow all access to special clinic schedules" 
ON public.special_clinic_schedules FOR ALL USING (true);

CREATE POLICY "Allow all access to treatment limits" 
ON public.treatment_limits FOR ALL USING (true);

-- 更新時刻の自動更新トリガー
CREATE TRIGGER update_clinic_schedules_updated_at 
  BEFORE UPDATE ON public.clinic_schedules 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_clinic_schedules_updated_at 
  BEFORE UPDATE ON public.special_clinic_schedules 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_limits_updated_at 
  BEFORE UPDATE ON public.treatment_limits 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 