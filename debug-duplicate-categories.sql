-- 初診カテゴリの重複データを調査

-- 1. 全てのtreatment_categoriesテーブルの内容確認
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at
FROM treatment_categories 
ORDER BY name, created_at;

-- 2. 「初診」関連のカテゴリを特定
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at
FROM treatment_categories 
WHERE name ILIKE '%初診%' OR name ILIKE '%相談%'
ORDER BY name, created_at;

-- 3. 各カテゴリに紐づく治療メニューの数をカウント
SELECT 
  tc.id as category_id,
  tc.name as category_name,
  COUNT(t.id) as treatment_count,
  tc.created_at
FROM treatment_categories tc
LEFT JOIN treatments t ON tc.id = t.category_id
WHERE tc.name ILIKE '%初診%' OR tc.name ILIKE '%相談%'
GROUP BY tc.id, tc.name, tc.created_at
ORDER BY tc.name, tc.created_at;

-- 4. 治療メニューと紐づいているカテゴリの詳細
SELECT 
  t.id as treatment_id,
  t.name as treatment_name,
  t.category_id,
  tc.name as category_name,
  t.created_at as treatment_created_at,
  tc.created_at as category_created_at
FROM treatments t
LEFT JOIN treatment_categories tc ON t.category_id = tc.id
WHERE tc.name ILIKE '%初診%' OR tc.name ILIKE '%相談%' OR t.name ILIKE '%初診%' OR t.name ILIKE '%相談%'
ORDER BY tc.name, t.name;