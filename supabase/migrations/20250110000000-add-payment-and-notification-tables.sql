-- 決済情報テーブル
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    amount INTEGER NOT NULL, -- 金額（円）
    currency TEXT DEFAULT 'jpy',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded
    payment_method_type TEXT, -- card, etc
    receipt_url TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予約リマインダー設定テーブル
CREATE TABLE IF NOT EXISTS public.reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    reminder_type TEXT NOT NULL, -- email, sms, both
    days_before INTEGER NOT NULL, -- 何日前にリマインダーを送るか
    time_of_day TIME DEFAULT '10:00:00', -- 送信時刻
    message_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 送信済みリマインダー履歴テーブル
CREATE TABLE IF NOT EXISTS public.sent_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    reminder_setting_id UUID REFERENCES public.reminder_settings(id) ON DELETE SET NULL,
    reminder_type TEXT NOT NULL, -- email, sms
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent', -- sent, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS送信履歴テーブル
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    purpose TEXT NOT NULL, -- reminder, notification, confirmation
    twilio_sid TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, delivered, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_sent_reminders_appointment_id ON public.sent_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sent_reminders_sent_at ON public.sent_reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_appointment_id ON public.sms_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON public.sms_logs(created_at);

-- updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_logs_updated_at BEFORE UPDATE ON public.sms_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトのリマインダー設定を挿入
INSERT INTO public.reminder_settings (name, enabled, reminder_type, days_before, time_of_day, message_template)
VALUES 
    ('1日前リマインダー', true, 'both', 1, '10:00:00', 'こんにちは。明日 {date} {time} にご予約があります。お気をつけてお越しください。'),
    ('3日前リマインダー', false, 'email', 3, '10:00:00', '{date} {time} にご予約があります。3日後となりました。')
ON CONFLICT DO NOTHING;

-- RLSポリシーの設定
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能（service_roleでの操作を想定）
CREATE POLICY "Enable read access for service role" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for service role" ON public.payments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for service role" ON public.reminder_settings FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.reminder_settings FOR ALL USING (true);

CREATE POLICY "Enable read access for service role" ON public.sent_reminders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.sent_reminders FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for service role" ON public.sms_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON public.sms_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for service role" ON public.sms_logs FOR UPDATE USING (true);



