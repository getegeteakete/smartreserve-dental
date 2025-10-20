-- メール管理テーブルの作成

-- 受信メール管理テーブル
CREATE TABLE IF NOT EXISTS public.received_emails (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    from_email TEXT NOT NULL,
    from_name TEXT,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('appointment_request', 'appointment_inquiry', 'general_inquiry', 'cancellation_request', 'modification_request')),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    ai_suggested_response TEXT, -- AI提案レスポンス
    ai_extracted_intent TEXT, -- AI抽出された意図
    ai_extracted_data JSONB, -- AI抽出されたデータ
    staff_notes TEXT, -- スタッフメモ
    assigned_to TEXT, -- 担当者
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 送信済みメール履歴テーブル
CREATE TABLE IF NOT EXISTS public.sent_emails (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    received_email_id UUID REFERENCES public.received_emails(id) ON DELETE SET NULL,
    to_email TEXT NOT NULL,
    to_name TEXT,
    from_email TEXT NOT NULL,
    from_name TEXT,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_reply', 'general_reply', 'cancellation_confirmation')),
    template_used TEXT, -- 使用されたテンプレート名
    ai_generated BOOLEAN DEFAULT false, -- AI生成されたかどうか
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- メールテンプレートテーブル
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_reply', 'general_reply', 'cancellation_confirmation')),
    variables JSONB, -- 使用可能な変数リスト
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_received_emails_appointment_id ON public.received_emails(appointment_id);
CREATE INDEX IF NOT EXISTS idx_received_emails_from_email ON public.received_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_received_emails_status ON public.received_emails(status);
CREATE INDEX IF NOT EXISTS idx_received_emails_email_type ON public.received_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_received_emails_created_at ON public.received_emails(created_at);
CREATE INDEX IF NOT EXISTS idx_received_emails_subject_search ON public.received_emails USING gin(to_tsvector('japanese', subject));
CREATE INDEX IF NOT EXISTS idx_received_emails_content_search ON public.received_emails USING gin(to_tsvector('japanese', content));

CREATE INDEX IF NOT EXISTS idx_sent_emails_appointment_id ON public.sent_emails(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_received_email_id ON public.sent_emails(received_email_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_to_email ON public.sent_emails(to_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON public.sent_emails(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_template_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON public.email_templates(is_active);

-- RLSの有効化
ALTER TABLE public.received_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシーを作成
CREATE POLICY "Allow all access for admin" ON public.received_emails FOR ALL USING (true);
CREATE POLICY "Allow all access for admin" ON public.sent_emails FOR ALL USING (true);
CREATE POLICY "Allow all access for admin" ON public.email_templates FOR ALL USING (true);

-- updated_atの自動更新トリガー
CREATE TRIGGER update_received_emails_updated_at BEFORE UPDATE ON public.received_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトのメールテンプレートを挿入
INSERT INTO public.email_templates (name, subject_template, content_template, template_type, variables) VALUES
('appointment_confirmation_default', '[予約確認] {clinic_name} - {patient_name}様', 
'いつもお世話になっております。{clinic_name}です。

{patient_name}様のご予約を承りました。

【予約内容】
診療内容: {treatment_name}
予約日時: {appointment_date} {appointment_time}
診療時間: {duration}分
料金: ¥{fee}

ご質問がございましたら、お気軽にお問い合わせください。

{clinic_name}
電話: {clinic_phone}
メール: {clinic_email}', 
'appointment_confirmation', 
'{"clinic_name", "patient_name", "treatment_name", "appointment_date", "appointment_time", "duration", "fee", "clinic_phone", "clinic_email"}'),

('appointment_reply_default', 'Re: {original_subject} - {clinic_name}', 
'いつもお世話になっております。{clinic_name}です。

お問い合わせいただいた件につきまして、ご回答いたします。

{aai_response}

今後ともよろしくお願いいたします。

{clinic_name}
電話: {clinic_phone}
メール: {clinic_email}', 
'appointment_reply', 
'{"original_subject", "clinic_name", "ai_response", "clinic_phone", "clinic_email"}');
