# メール送信設定の確認手順

メール送信が失敗する場合、以下の手順で確認してください。

## 🔍 確認項目

### 1. SupabaseのSecrets設定を確認

Supabaseダッシュボードで確認：

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクト `vnwnevhakhgbbxxlmutx` を選択
3. 左サイドバーの「Edge Functions」→「Secrets」を開く
4. 以下のSecretsが設定されているか確認：
   - ✅ `RESEND_API_KEY` = `re_...`（Resend APIキー）
   - ✅ `SUPABASE_URL` = `https://vnwnevhakhgbbxxlmutx.supabase.co`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = `...`（Service Role Key）

### 2. Edge Functionがデプロイされているか確認

1. Supabaseダッシュボード → 「Edge Functions」
2. `send-appointment-email` が存在するか確認
3. 存在しない場合はデプロイが必要：

```bash
supabase functions deploy send-appointment-email
```

### 3. ブラウザのコンソールでエラーを確認

1. ブラウザでF12キーを押して開発者ツールを開く
2. 「Console」タブを選択
3. 予約を送信する
4. コンソールに表示されるエラーメッセージを確認

エラーメッセージの例：
- `Function not found` → Edge Functionがデプロイされていない
- `RESEND_API_KEYが設定されていません` → SecretsにAPIキーが設定されていない
- `404` → Edge Functionが見つからない

### 4. Supabase Edge Functionsのログを確認

1. Supabaseダッシュボード → 「Edge Functions」→ `send-appointment-email`
2. 「Logs」タブを開く
3. エラーログを確認

## 🛠️ 解決方法

### 問題1: Edge Functionがデプロイされていない

```bash
# Supabase CLIでログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref vnwnevhakhgbbxxlmutx

# Edge Functionをデプロイ
supabase functions deploy send-appointment-email
```

### 問題2: RESEND_API_KEYが設定されていない

```bash
# Resend APIキーを設定（既に提供済みのキーを使用）
supabase secrets set RESEND_API_KEY=re_あなたのResendAPIキー
```

### 問題3: その他のSecretsが設定されていない

```bash
# Supabase URLを設定
supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co

# Supabase Service Role Keyを設定
# （Supabaseダッシュボード → Settings → API → service_role のキーをコピー）
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
```

## 📝 チェックリスト

- [ ] Resend APIキーがSupabaseのSecretsに設定されている
- [ ] SUPABASE_URLがSupabaseのSecretsに設定されている
- [ ] SUPABASE_SERVICE_ROLE_KEYがSupabaseのSecretsに設定されている
- [ ] Edge Function `send-appointment-email` がデプロイされている
- [ ] ブラウザのコンソールでエラーメッセージを確認した
- [ ] Supabase Edge Functionsのログでエラーを確認した

## 🧪 テスト方法

1. ブラウザのコンソールを開く（F12）
2. 「Console」タブを選択
3. 予約を送信する
4. コンソールに表示されるログを確認：
   - `📧 予約申し込みメール送信開始` が表示されるか
   - `📧 メール送信レスポンス` の内容を確認
   - エラーメッセージがあれば内容を確認

## 📞 サポート

問題が解決しない場合は、以下を共有してください：

1. ブラウザのコンソールログ（F12 → Console）
2. Supabase Edge Functionsのログ（ダッシュボード → Edge Functions → Logs）
3. エラーメッセージの全文

