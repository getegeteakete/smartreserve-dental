# メール送信失敗の修正手順

## 🔍 ステップ1: エラーメッセージの確認

1. **ブラウザでF12キーを押して開発者ツールを開く**
2. **「Console」タブを選択**
3. **予約を送信する**
4. **コンソールに表示されるエラーメッセージを確認**

エラーメッセージの例：
- `Function not found` → Edge Functionがデプロイされていない
- `RESEND_API_KEYが設定されていません` → SecretsにAPIキーが設定されていない
- `404` → Edge Functionが見つからない

## 🛠️ ステップ2: 設定の確認と修正

### A. Edge Functionがデプロイされていない場合

```bash
# Supabase CLIでログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref vnwnevhakhgbbxxlmutx

# Edge Functionをデプロイ
supabase functions deploy send-appointment-email
```

### B. RESEND_API_KEYが設定されていない場合

```bash
# Resend APIキーを設定（既に提供済みのキーを使用）
supabase secrets set RESEND_API_KEY=re_あなたのResendAPIキー

# その他の必要なSecretsも設定
supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
```

### C. Supabaseダッシュボードで確認

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクト `vnwnevhakhgbbxxlmutx` を選択
3. 「Edge Functions」→「Secrets」で以下を確認：
   - `RESEND_API_KEY` が設定されているか
   - `SUPABASE_URL` が設定されているか
   - `SUPABASE_SERVICE_ROLE_KEY` が設定されているか
4. 「Edge Functions」で `send-appointment-email` が存在するか確認

## 📝 クイックチェックリスト

- [ ] Supabase CLIでログイン済み
- [ ] プロジェクトをリンク済み
- [ ] Resend APIキーをSecretsに設定済み
- [ ] SUPABASE_URLをSecretsに設定済み
- [ ] SUPABASE_SERVICE_ROLE_KEYをSecretsに設定済み
- [ ] Edge Function `send-appointment-email` をデプロイ済み
- [ ] ブラウザのコンソールでエラーメッセージを確認済み

## 🧪 テスト方法

1. 上記の設定を完了
2. ブラウザのコンソールを開く（F12）
3. 予約を送信
4. コンソールに `✅ メール送信成功` が表示されるか確認

