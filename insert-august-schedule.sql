-- 2024年8月のデフォルトスケジュールを登録

-- 月曜日（午後のみ診療）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES (2024, 8, 1, '15:00:00', '19:00:00', true);

-- 火曜日（午前・午後）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES 
(2024, 8, 2, '10:00:00', '13:30:00', true),
(2024, 8, 2, '15:00:00', '19:00:00', true);

-- 水曜日（午前・午後）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES 
(2024, 8, 3, '10:00:00', '13:30:00', true),
(2024, 8, 3, '15:00:00', '19:00:00', true);

-- 木曜日（休診）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES (2024, 8, 4, '00:00:00', '00:00:00', false);

-- 金曜日（午前・午後）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES 
(2024, 8, 5, '10:00:00', '13:30:00', true),
(2024, 8, 5, '15:00:00', '19:00:00', true);

-- 土曜日（午前・午後、時間短縮）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES 
(2024, 8, 6, '09:00:00', '12:30:00', true),
(2024, 8, 6, '14:00:00', '17:30:00', true);

-- 日曜日（基本休診）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available) 
VALUES (2024, 8, 0, '00:00:00', '00:00:00', false);