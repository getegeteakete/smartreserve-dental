-- サンプルデータの投入
-- Supabase SQL Editorで実行してください

-- 治療カテゴリーの追加
INSERT INTO treatment_categories (name, description, display_order, image_url) VALUES
('一般歯科', '虫歯治療、抜歯など一般的な歯科治療を行います', 1, '/lovable-uploads/23dd7cf2-1136-4319-a747-b59ff65618a9.png'),
('矯正歯科', '歯並びや噛み合わせの矯正治療を行います', 2, '/lovable-uploads/4a11c586-8857-452a-8081-344311c5cdb6.png'),
('審美歯科', 'ホワイトニング、セラミック治療など見た目を美しくする治療', 3, '/lovable-uploads/70893a9e-d0ea-49bd-ba4b-f6b20d984c28.png'),
('予防歯科', '定期検診、クリーニングなど予防を重視した治療', 4, '/lovable-uploads/87d8b2fd-ead0-49b4-bb0e-89abad0f0380.png')
ON CONFLICT DO NOTHING;

-- 治療メニューの追加
INSERT INTO treatments (name, description, duration, fee, category_id) VALUES
-- 一般歯科
('虫歯治療', '一般的な虫歯の治療を行います。早期発見・早期治療が大切です。', 30, 3000, (SELECT id FROM treatment_categories WHERE name = '一般歯科' LIMIT 1)),
('歯周病治療', '歯周病の検査と治療を行います。定期的なメンテナンスが重要です。', 45, 4000, (SELECT id FROM treatment_categories WHERE name = '一般歯科' LIMIT 1)),
('抜歯', '親知らずや治療困難な歯の抜歯を行います。', 30, 5000, (SELECT id FROM treatment_categories WHERE name = '一般歯科' LIMIT 1)),
('根管治療', '歯の根の治療を行います。精密な治療が必要です。', 60, 8000, (SELECT id FROM treatment_categories WHERE name = '一般歯科' LIMIT 1)),

-- 矯正歯科
('矯正相談', '歯並びや噛み合わせについてのご相談を承ります。', 30, 0, (SELECT id FROM treatment_categories WHERE name = '矯正歯科' LIMIT 1)),
('ワイヤー矯正', '従来型のワイヤーを使用した矯正治療です。', 30, 800000, (SELECT id FROM treatment_categories WHERE name = '矯正歯科' LIMIT 1)),
('マウスピース矯正', '透明なマウスピースを使用した目立たない矯正治療です。', 30, 900000, (SELECT id FROM treatment_categories WHERE name = '矯正歯科' LIMIT 1)),
('部分矯正', '前歯など部分的な矯正治療を行います。', 30, 300000, (SELECT id FROM treatment_categories WHERE name = '矯正歯科' LIMIT 1)),

-- 審美歯科
('ホワイトニング', '歯を白く美しくするホワイトニング治療です。', 60, 30000, (SELECT id FROM treatment_categories WHERE name = '審美歯科' LIMIT 1)),
('セラミック治療', '自然な白さと強度を兼ね備えたセラミックの詰め物・被せ物です。', 45, 80000, (SELECT id FROM treatment_categories WHERE name = '審美歯科' LIMIT 1)),
('ラミネートベニア', '歯の表面に薄いセラミックを貼り付けて美しく仕上げます。', 60, 100000, (SELECT id FROM treatment_categories WHERE name = '審美歯科' LIMIT 1)),

-- 予防歯科
('定期検診', '定期的な歯のチェックアップを行います。', 30, 2000, (SELECT id FROM treatment_categories WHERE name = '予防歯科' LIMIT 1)),
('クリーニング', '専門的な歯のクリーニングで歯石や着色を除去します。', 45, 3000, (SELECT id FROM treatment_categories WHERE name = '予防歯科' LIMIT 1)),
('フッ素塗布', '虫歯予防のためのフッ素塗布を行います。', 15, 1000, (SELECT id FROM treatment_categories WHERE name = '予防歯科' LIMIT 1)),
('歯磨き指導', '正しい歯磨き方法を丁寧に指導いたします。', 30, 1500, (SELECT id FROM treatment_categories WHERE name = '予防歯科' LIMIT 1))
ON CONFLICT DO NOTHING;

-- スケジュール設定のサンプル（2025年1月）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) VALUES
(2025, 1, 1, '09:00', '18:00', true),  -- 月曜日
(2025, 1, 2, '09:00', '18:00', true),  -- 火曜日
(2025, 1, 3, '09:00', '18:00', true),  -- 水曜日
(2025, 1, 4, '09:00', '18:00', true),  -- 木曜日
(2025, 1, 5, '09:00', '18:00', true),  -- 金曜日
(2025, 1, 6, '09:00', '13:00', true),  -- 土曜日（午前のみ）
(2025, 1, 0, '09:00', '18:00', false)  -- 日曜日（休診）
ON CONFLICT DO NOTHING;

-- 完了メッセージ
SELECT 'サンプルデータの投入が完了しました！' as message;

