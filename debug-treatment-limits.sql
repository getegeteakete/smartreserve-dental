-- デバッグ用: treatment_limits関連の設定確認

-- 1. treatment_limitsテーブルの存在確認
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'treatment_limits'
ORDER BY ordinal_position;

-- 2. treatment_limitsテーブルのデータ確認
SELECT * FROM treatment_limits LIMIT 10;

-- 3. 関連するRPC関数の存在確認
SELECT routine_name, routine_type, specific_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%treatment_limit%';

-- 4. treatmentsテーブルの診療メニュー確認
SELECT id, name, fee, duration, category_id, created_at 
FROM treatments 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. 診療メニューに対応する制限設定の関連確認
SELECT 
  t.id as treatment_id,
  t.name as treatment_name,
  tl.id as limit_id,
  tl.treatment_name as limit_treatment_name,
  tl.max_reservations_per_slot
FROM treatments t
LEFT JOIN treatment_limits tl ON t.name = tl.treatment_name
ORDER BY t.name; 