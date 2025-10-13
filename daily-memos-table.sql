-- daily_memos テーブルの作成
-- 日別メモ機能用のテーブル

CREATE TABLE IF NOT EXISTS daily_memos (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_daily_memos_date ON daily_memos(date);

-- RLS (Row Level Security) の設定
ALTER TABLE daily_memos ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書き可能なポリシー
CREATE POLICY "daily_memos_policy" ON daily_memos
    FOR ALL USING (true);

-- 更新時のトリガー関数
CREATE OR REPLACE FUNCTION update_daily_memos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新時のトリガー
CREATE TRIGGER update_daily_memos_updated_at_trigger
    BEFORE UPDATE ON daily_memos
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_memos_updated_at();

-- サンプルデータ（オプション）
-- INSERT INTO daily_memos (date, memo) VALUES 
-- ('2024-01-01', '新年営業開始'),
-- ('2024-12-25', 'クリスマス休診'),
-- ('2024-12-31', '大晦日短縮営業');

