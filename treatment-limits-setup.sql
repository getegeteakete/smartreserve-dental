-- 治療制限機能の設定用SQL

-- 1. treatment_limitsテーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS treatment_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_name text NOT NULL UNIQUE,
  max_reservations_per_slot integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. treatment_limitsテーブルのRLS (Row Level Security) 設定
ALTER TABLE treatment_limits ENABLE ROW LEVEL SECURITY;

-- 3. treatment_limitsテーブルのポリシー設定
DROP POLICY IF EXISTS "Enable read access for all users" ON treatment_limits;
CREATE POLICY "Enable read access for all users" ON treatment_limits FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON treatment_limits;
CREATE POLICY "Enable insert for authenticated users only" ON treatment_limits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON treatment_limits;
CREATE POLICY "Enable update for authenticated users only" ON treatment_limits FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON treatment_limits;
CREATE POLICY "Enable delete for authenticated users only" ON treatment_limits FOR DELETE USING (true);

-- 4. 治療制限取得関数
CREATE OR REPLACE FUNCTION get_treatment_limits()
RETURNS TABLE (
  id uuid,
  treatment_name text,
  max_reservations_per_slot integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tl.id,
    tl.treatment_name,
    tl.max_reservations_per_slot,
    tl.created_at,
    tl.updated_at
  FROM treatment_limits tl
  ORDER BY tl.treatment_name;
END;
$$ LANGUAGE plpgsql;

-- 5. 治療制限の更新/挿入関数 (UPSERT)
CREATE OR REPLACE FUNCTION upsert_treatment_limit(
  p_treatment_name text,
  p_max_reservations integer
)
RETURNS void AS $$
BEGIN
  INSERT INTO treatment_limits (treatment_name, max_reservations_per_slot, updated_at)
  VALUES (p_treatment_name, p_max_reservations, now())
  ON CONFLICT (treatment_name) 
  DO UPDATE SET 
    max_reservations_per_slot = p_max_reservations,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 6. 治療制限削除関数
CREATE OR REPLACE FUNCTION delete_treatment_limit(
  p_treatment_name text
)
RETURNS void AS $$
BEGIN
  DELETE FROM treatment_limits 
  WHERE treatment_name = p_treatment_name;
END;
$$ LANGUAGE plpgsql;

-- 7. 初期データの挿入（デフォルト値として）
INSERT INTO treatment_limits (treatment_name, max_reservations_per_slot) VALUES
  ('初診の方【無料相談】', 1),
  ('初診有料相談【60分】', 1),
  ('精密検査予約【60分】', 1),
  ('ホームホワイトニング【60分】', 1),
  ('オフィスホワイトニング（1回コース）【90分】', 1),
  ('オフィスホワイトニング（2回コース）【90分】', 1),
  ('ダブルホワイトニング【120分】', 1),
  ('PMTC【60分】', 1)
ON CONFLICT (treatment_name) DO NOTHING; 