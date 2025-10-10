-- 同じIDで複数エントリがある「初診」カテゴリの修正

-- STEP 1: 現在の状況確認
SELECT 
  category_id,
  category_name,
  COUNT(*) as entry_count
FROM (
  SELECT 
    tc.id as category_id,
    tc.name as category_name
  FROM treatment_categories tc
  WHERE tc.name = '初診'
) grouped
GROUP BY category_id, category_name;

-- STEP 2: 重複エントリを削除（最初の1つだけ残す）
-- PostgreSQLの重複削除クエリ
DELETE FROM treatment_categories
WHERE id = '269c1acb-e42b-40a2-afa4-1abaf498fe4f'
AND name = '初診'
AND ctid NOT IN (
  SELECT MIN(ctid)
  FROM treatment_categories
  WHERE id = '269c1acb-e42b-40a2-afa4-1abaf498fe4f'
  AND name = '初診'
);

-- STEP 3: 削除後の確認
SELECT 
  id,
  name,
  created_at,
  COUNT(*) OVER (PARTITION BY id, name) as count
FROM treatment_categories 
WHERE name = '初診'
ORDER BY created_at;

-- STEP 4: 関連する治療メニューの確認
SELECT 
  t.id as treatment_id,
  t.name as treatment_name,
  t.category_id,
  tc.name as category_name
FROM treatments t
LEFT JOIN treatment_categories tc ON t.category_id = tc.id
WHERE tc.name = '初診' OR t.name ILIKE '%初診%' OR t.name ILIKE '%相談%'
ORDER BY t.name;