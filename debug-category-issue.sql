-- 初診カテゴリの詳細状況を調査

-- 1. 「初診」関連の全カテゴリを詳細確認
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at
FROM treatment_categories 
WHERE name ILIKE '%初診%' OR name ILIKE '%相談%'
ORDER BY name, created_at;

-- 2. 各カテゴリに紐づく治療メニューの詳細
SELECT 
  tc.id as category_id,
  tc.name as category_name,
  tc.created_at as category_created,
  t.id as treatment_id,
  t.name as treatment_name,
  t.created_at as treatment_created
FROM treatment_categories tc
LEFT JOIN treatments t ON tc.id = t.category_id
WHERE tc.name ILIKE '%初診%' OR tc.name ILIKE '%相談%'
ORDER BY tc.name, tc.created_at, t.name;

-- 3. 重複を具体的に特定
SELECT 
  name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as category_ids,
  STRING_AGG(created_at::text, ', ') as created_dates
FROM treatment_categories 
WHERE name ILIKE '%初診%' OR name ILIKE '%相談%'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;