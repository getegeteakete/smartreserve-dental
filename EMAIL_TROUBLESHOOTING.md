# メール送信失敗のトラブルシューティングガイド

予約送信時に「予約申し込み完了（メール送信失敗）」と表示される場合の対処法です。

## 🔍 ステップ1: エラーメッセージの確認

まず、ブラウザのコンソールでエラーメッセージを確認してください。

1. **ブラウザでF12キーを押して開発者ツールを開く**
2. **「Console」タブを選択**
3. **予約を送信する**
4. **コンソールに表示されるエラーメッセージを確認**

エラーメッセージの種類によって対処法が異なります。

## 📋 よくある原因と対処法

### 原因1: Edge Functionがデプロイされていない

**エラーメッセージ例:**
- `Function not found`
- `404`
- `メール送信機能が設定されていません`

**対処法:**

1. **Supabase CLIでログイン**
   ```bash
   supabase login
   ```

2. **プロジェクトをリンク**
   ```bash
   supabase link --project-ref vnwnevhakhgbbxxlmutx
   ```

3. **Edge Functionをデプロイ**
   ```bash
   supabase functions deploy send-appointment-email
   ```

4. **デプロイが成功したか確認**
   - Supabaseダッシュボード → Edge Functions → `send-appointment-email` が表示されているか確認

---

### 原因2: RESEND_API_KEYが設定されていない

**エラーメッセージ例:**
- `RESEND_API_KEYが設定されていません`
- `メール送信の設定が完了していません`

**対処法:**

1. **ResendでAPIキーを作成**
   - [Resend Dashboard](https://resend.com/api-keys) にアクセス
   - 「Create API Key」をクリック
   - APIキーをコピー（`re_` で始まる文字列）

2. **SupabaseのSecretsに設定**

   **方法A: Supabase CLIを使用（推奨）**
   ```bash
   supabase secrets set RESEND_API_KEY=re_あなたのAPIキー
   ```

   **方法B: Supabaseダッシュボードから設定**
   - Supabaseダッシュボード → Edge Functions → Secrets
   - 「Add new secret」をクリック
   - Name: `RESEND_API_KEY`
   - Value: `re_あなたのAPIキー`
   - 「Save」をクリック

3. **その他の必要なSecretsも設定**
   ```bash
   supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
   ```

---

### 原因3: ドメイン認証が完了していない（yoyaku@toyoshima-do.comを使用する場合）

**エラーメッセージ例:**
- `Domain not verified`
- `Unauthorized sender`

**対処法:**

1. **Resendでドメイン認証を行う**
   - 詳細は `RESEND_DOMAIN_SETUP.md` を参照
   - `toyoshima-do.com` をResendで認証する必要があります

2. **一時的にResendのデフォルトドメインを使用**
   - ドメイン認証が完了するまで、`onboarding@resend.dev` などのデフォルトドメインを使用
   - 管理画面で送信元アドレスを変更可能

---

### 原因4: Edge Functionのエラー

**エラーメッセージ例:**
- `Internal Server Error`
- `500`

**対処法:**

1. **Supabaseダッシュボードでログを確認**
   - Supabaseダッシュボード → Edge Functions → `send-appointment-email`
   - 「Logs」タブでエラーログを確認

2. **Edge Functionを再デプロイ**
   ```bash
   supabase functions deploy send-appointment-email
   ```

---

## ✅ チェックリスト

メール送信を有効にするために、以下を確認してください：

- [ ] Resendアカウントを作成済み
- [ ] Resend APIキーを取得済み
- [ ] SupabaseのSecretsに `RESEND_API_KEY` を設定済み
- [ ] SupabaseのSecretsに `SUPABASE_URL` を設定済み
- [ ] SupabaseのSecretsに `SUPABASE_SERVICE_ROLE_KEY` を設定済み
- [ ] Edge Function `send-appointment-email` をデプロイ済み
- [ ] カスタムドメイン（yoyaku@toyoshima-do.com）を使用する場合、ドメイン認証が完了している

## 🧪 テスト方法

1. **ブラウザのコンソールを開く（F12）**
2. **予約を送信する**
3. **コンソールに表示されるログを確認**
   - `📧 予約申し込みメール送信開始` が表示されるか
   - `📧 メール送信レスポンス` の内容を確認
   - エラーメッセージがあれば内容を確認

4. **Supabaseダッシュボードでログを確認**
   - Edge Functions → `send-appointment-email` → Logs
   - エラーログがないか確認

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. **ブラウザのコンソールログ**（F12 → Console）
2. **Supabase Edge Functionsのログ**（ダッシュボード → Edge Functions → Logs）
3. **Resendダッシュボードのログ**（[Resend Dashboard](https://resend.com/emails) → Logs）

エラーメッセージの内容を共有していただければ、より具体的な対処法を提案できます。

