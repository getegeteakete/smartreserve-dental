
-- カテゴリーテーブルを作成
CREATE TABLE public.treatment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- treatmentsテーブルを作成（診療メニュー情報を保存）
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fee INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 30,
  category_id UUID REFERENCES public.treatment_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 画像アップロード用のストレージバケットを作成
INSERT INTO storage.buckets (id, name, public) 
VALUES ('treatment-images', 'treatment-images', true);

-- ストレージバケットのポリシーを設定（全てのアクセスを許可）
CREATE POLICY "Allow public access to treatment images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'treatment-images');

-- カテゴリーテーブルにRLSを有効化
ALTER TABLE public.treatment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to treatment categories" ON public.treatment_categories FOR ALL USING (true);

-- treatmentsテーブルにRLSを有効化
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to treatments" ON public.treatments FOR ALL USING (true);

-- 更新時刻の自動更新トリガー
CREATE TRIGGER update_treatment_categories_updated_at 
  BEFORE UPDATE ON public.treatment_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at 
  BEFORE UPDATE ON public.treatments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 既存の診療メニューをカテゴリー付きで移行するためのデータ挿入
INSERT INTO public.treatment_categories (name, description, display_order) VALUES
('初診', '初診相談に関する診療メニュー', 1),
('精密検査', '精密検査に関する診療メニュー', 2),
('ホワイトニング', 'ホワイトニングに関する診療メニュー', 3),
('PMTC', 'プロフェッショナルクリーニングに関する診療メニュー', 4);
