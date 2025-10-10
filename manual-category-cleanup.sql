-- 手動での重複カテゴリ削除（慎重に実行してください）

-- STEP 1: まず現在の状況を確認
-- debug-category-issue.sql を実行して結果を確認してから以下を実行

-- STEP 2: 重複している「初診」カテゴリがある場合の手動削除
-- 注意: 実際のID は debug の結果に基づいて変更してください

-- 例: 「初診」カテゴリのIDが複数ある場合
-- 最古のカテゴリIDを保持し、新しいものを削除

-- まず削除予定のカテゴリに紐づく治療メニューを最古のカテゴリに移行
-- UPDATE treatments 
-- SET category_id = '保持するカテゴリのID'
-- WHERE category_id IN ('削除予定のカテゴリID1', '削除予定のカテゴリID2');

-- 重複カテゴリを削除
-- DELETE FROM treatment_categories 
-- WHERE id IN ('削除予定のカテゴリID1', '削除予定のカテゴリID2');

-- STEP 3: 削除後の確認
-- SELECT * FROM treatment_categories WHERE name ILIKE '%初診%' OR name ILIKE '%相談%';

-- 安全確認用クエリ（実行前に必ず確認）
SELECT 
  'これらのカテゴリが削除対象です' as notice,
  tc.id,
  tc.name,
  tc.created_at,
  COUNT(t.id) as related_treatments
FROM treatment_categories tc
LEFT JOIN treatments t ON tc.id = t.category_id
WHERE tc.name = '初診' -- この名前を実際の重複カテゴリ名に変更
GROUP BY tc.id, tc.name, tc.created_at
ORDER BY tc.created_at;