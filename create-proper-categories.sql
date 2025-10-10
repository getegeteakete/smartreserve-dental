-- 適切なカテゴリ構造を作成

-- STEP 1: 有料相談カテゴリを作成
INSERT INTO treatment_categories (name, description)
VALUES ('有料相談', '有料での初診相談メニュー');

-- STEP 2: 無料相談カテゴリを作成  
INSERT INTO treatment_categories (name, description)
VALUES ('無料相談', '無料での初診相談メニュー');

-- STEP 3: 新しく作成されたカテゴリIDを確認
SELECT id, name, description, created_at 
FROM treatment_categories 
WHERE name IN ('有料相談', '無料相談')
ORDER BY name;

-- STEP 4: 治療メニューを適切なカテゴリに移行
-- 有料相談メニューを移行（実際のカテゴリIDに置き換えてください）
-- UPDATE treatments 
-- SET category_id = '有料相談のカテゴリID'
-- WHERE name ILIKE '%有料%';

-- 無料相談メニューを移行（実際のカテゴリIDに置き換えてください）  
-- UPDATE treatments
-- SET category_id = '無料相談のカテゴリID'
-- WHERE name ILIKE '%新患%' OR name ILIKE '%既患%';

-- STEP 5: 古い「初診」カテゴリを削除
-- DELETE FROM treatment_categories 
-- WHERE id = '269c1acb-e42b-40a2-afa4-1abaf498fe4f';

-- STEP 6: 最終確認
-- SELECT 
--   tc.name as category_name,
--   t.name as treatment_name,
--   tc.id as category_id
-- FROM treatment_categories tc
-- LEFT JOIN treatments t ON tc.id = t.category_id
-- WHERE tc.name IN ('有料相談', '無料相談')
-- ORDER BY tc.name, t.name;