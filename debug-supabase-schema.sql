-- Supabaseスキーマ確認用デバッグSQL
-- これをSupabaseのSQL Editorで実行して現在の状態を確認してください

-- 1. 現在存在するテーブル一覧を確認
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. clinic_schedulesテーブルが存在するかチェック
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'clinic_schedules'
) AS clinic_schedules_exists;

-- 3. special_clinic_schedulesテーブルが存在するかチェック
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'special_clinic_schedules'
) AS special_clinic_schedules_exists;

-- 4. treatment_limitsテーブルが存在するかチェック
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'treatment_limits'
) AS treatment_limits_exists;

-- 5. 現在存在するRPC関数一覧を確認
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%clinic%' 
ORDER BY routine_name;

-- 6. スケジュール関連の関数が存在するかチェック
SELECT 
  EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_clinic_schedules') AS get_clinic_schedules_exists,
  EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'insert_clinic_schedule') AS insert_clinic_schedules_exists,
  EXISTS (SELECT FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_clinic_schedule') AS update_clinic_schedules_exists; 