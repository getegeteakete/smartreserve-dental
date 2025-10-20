-- チャットメッセージテーブルの作成

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL, -- チャットセッションID（同一セッションをグルーピング）
    user_id TEXT, -- ユーザーID（匿名の場合はnull）
    user_email TEXT, -- ユーザーのメールアドレス（識別用）
    user_name TEXT, -- ユーザー名（入力された場合）
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai', 'system', 'staff')), -- メッセージタイプ
    content TEXT NOT NULL, -- メッセージ内容
    metadata JSONB, -- メタデータ（意図、抽出データ、アクションなど）
    is_read BOOLEAN DEFAULT false, -- 管理者が読み取り済みかどうか
    staff_response TEXT, -- スタッフからの返信（スタッフメッセージの場合）
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- チャットセッション情報テーブル
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE, -- セッションID
    user_email TEXT, -- ユーザーのメールアドレス
    user_name TEXT, -- ユーザー名
    user_phone TEXT, -- ユーザーの電話番号
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred_to_staff')), -- セッション状態
    first_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    message_count INTEGER DEFAULT 0, -- メッセージ数
    resolved BOOLEAN DEFAULT false, -- 解決済みかどうか
    staff_notes TEXT, -- スタッフのメモ
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_email ON public.chat_messages(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type ON public.chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_email ON public.chat_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON public.chat_sessions(last_message_at);

-- RLSの有効化
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシーを作成
CREATE POLICY "Allow all access for admin" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all access for admin" ON public.chat_sessions FOR ALL USING (true);

-- updated_atの自動更新トリガー
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- セッションの最新メッセージ時刻とメッセージ数を更新する関数
CREATE OR REPLACE FUNCTION update_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions 
    SET 
        last_message_at = NEW.created_at,
        message_count = (
            SELECT COUNT(*) 
            FROM public.chat_messages 
            WHERE session_id = NEW.session_id
        )
    WHERE session_id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- メッセージが追加された時にセッション統計を更新するトリガー
CREATE TRIGGER update_session_stats_on_message_insert
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_session_stats();
