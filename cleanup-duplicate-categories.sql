-- 重複カテゴリのクリーンアップ（実行前に必ずバックアップを取ること）

-- 手順1: まず現在の状況を確認（上記のdebug-duplicate-categories.sqlを実行）

-- 手順2: 重複カテゴリを特定し、最古のもの以外を削除
-- （この操作は慎重に行ってください - まずはSELECTで確認）

-- 重複している「初診」カテゴリがある場合の削除例
-- 注意: 実際のIDは調査結果に基づいて変更してください

-- 例: 「初診」カテゴリが複数ある場合、最新のものを削除
-- DELETE FROM treatment_categories 
-- WHERE name = '初診' 
-- AND id NOT IN (
--   SELECT MIN(id) 
--   FROM treatment_categories 
--   WHERE name = '初診'
-- );

-- 手順3: 治療メニューの category_id を正しいカテゴリIDに統一
-- 例: 治療メニューが間違ったカテゴリIDを参照している場合
-- UPDATE treatments 
-- SET category_id = (正しいカテゴリID)
-- WHERE category_id IN (削除予定の重複カテゴリID);

-- 手順4: 孤立した治療メニュー（存在しないcategory_idを参照）をクリーンアップ
-- UPDATE treatments 
-- SET category_id = NULL 
-- WHERE category_id NOT IN (SELECT id FROM treatment_categories);

-- 安全な確認クエリ（削除前に実行推奨）
-- 孤立した治療メニューの確認
SELECT 
  t.id,
  t.name,
  t.category_id,
  'ORPHANED' as status
FROM treatments t
LEFT JOIN treatment_categories tc ON t.category_id = tc.id
WHERE t.category_id IS NOT NULL AND tc.id IS NULL;