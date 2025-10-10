-- より安全な修正方法：新しいカテゴリを作成して移行

-- STEP 1: 新しい「初診」カテゴリを作成
INSERT INTO treatment_categories (name, description)
VALUES ('初診', '初診関連の診療メニュー');

-- STEP 2: 新しく作成されたカテゴリのIDを確認
SELECT id, name, created_at 
FROM treatment_categories 
WHERE name = '初診' 
ORDER BY created_at DESC 
LIMIT 1;

-- STEP 3: 治療メニューを新しいカテゴリに移行
-- 注意: 新しいカテゴリIDを上記の結果から取得して以下に入力してください
-- UPDATE treatments 
-- SET category_id = '新しいカテゴリのID'
-- WHERE category_id = '269c1acb-e42b-40a2-afa4-1abaf498fe4f';

-- STEP 4: 古い重複カテゴリを削除
-- DELETE FROM treatment_categories 
-- WHERE id = '269c1acb-e42b-40a2-afa4-1abaf498fe4f';

-- STEP 5: 最終確認
-- SELECT 
--   tc.id,
--   tc.name,
--   COUNT(t.id) as treatment_count
-- FROM treatment_categories tc
-- LEFT JOIN treatments t ON tc.id = t.category_id
-- WHERE tc.name = '初診'
-- GROUP BY tc.id, tc.name;