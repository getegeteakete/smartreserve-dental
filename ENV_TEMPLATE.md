# 環境変数設定テンプレート

## 使い方

1. プロジェクトルートに `.env` ファイルを作成
2. 以下の内容をコピーして、各値を実際の値に置き換えてください

## 環境変数テンプレート

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration (決済機能)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Twilio Configuration (SMS送信機能)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+81-your-phone-number

# Resend Configuration (メール送信機能)
RESEND_API_KEY=your-resend-api-key

# Supabase Service Role Key (Edge Functions用)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## 各環境変数の説明

### Supabase Configuration

- **VITE_SUPABASE_URL**: SupabaseプロジェクトのURL
  - 取得方法: Supabaseダッシュボード → Settings → API
  - 例: `https://xxxxx.supabase.co`

- **VITE_SUPABASE_ANON_KEY**: Supabaseの匿名キー
  - 取得方法: Supabaseダッシュボード → Settings → API
  - 公開しても安全なキー

- **SUPABASE_SERVICE_ROLE_KEY**: Supabaseのサービスロールキー
  - 取得方法: Supabaseダッシュボード → Settings → API
  - **重要**: このキーは絶対に公開しないでください

### Stripe Configuration

- **VITE_STRIPE_PUBLISHABLE_KEY**: Stripeの公開可能キー
  - 取得方法: Stripeダッシュボード → Developers → API keys
  - 例: `pk_test_xxxxx` (テスト環境) または `pk_live_xxxxx` (本番環境)

- **STRIPE_SECRET_KEY**: Stripeのシークレットキー
  - 取得方法: Stripeダッシュボード → Developers → API keys
  - 例: `sk_test_xxxxx` (テスト環境) または `sk_live_xxxxx` (本番環境)
  - **重要**: このキーは絶対に公開しないでください

- **STRIPE_WEBHOOK_SECRET**: Stripe Webhookの署名シークレット
  - 取得方法: Stripeダッシュボード → Developers → Webhooks → エンドポイントを追加後に表示
  - 例: `whsec_xxxxx`

### Twilio Configuration

- **TWILIO_ACCOUNT_SID**: TwilioアカウントのSID
  - 取得方法: Twilioコンソール → Account Info
  - 例: `ACxxxxx`

- **TWILIO_AUTH_TOKEN**: Twilioの認証トークン
  - 取得方法: Twilioコンソール → Account Info
  - **重要**: このトークンは絶対に公開しないでください

- **TWILIO_PHONE_NUMBER**: Twilioで購入した電話番号
  - 取得方法: Twilioコンソール → Phone Numbers
  - 形式: `+81xxxxxxxxxx` (国際番号形式)

### Resend Configuration

- **RESEND_API_KEY**: ResendのAPIキー
  - 取得方法: Resendダッシュボード → API Keys
  - 例: `re_xxxxx`
  - **重要**: このキーは絶対に公開しないでください

## セキュリティ上の注意

1. `.env` ファイルは `.gitignore` に含まれていることを確認してください
2. シークレットキーやトークンは絶対にGitにコミットしないでください
3. 本番環境では必ず本番用のキーを使用してください
4. 定期的にキーをローテーション（更新）してください

## Vercelへのデプロイ時

Vercelにデプロイする場合は、以下のコマンドで環境変数を設定：

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# ... その他の環境変数
```

または、Vercelダッシュボードから直接設定できます：
Project Settings → Environment Variables



