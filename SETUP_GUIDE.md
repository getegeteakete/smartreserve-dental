# SmartReserve予約システム - セットアップガイド

## 概要

SmartReserveは、歯科医院向けの完全統合型予約管理システムです。以下の機能を提供します：

- 📅 予約管理システム
- 💳 Stripe決済統合
- 📧 メール自動送信
- 📱 SMS通知（Twilio）
- ⏰ 予約リマインダー自動送信
- 👥 患者管理
- 📊 予約状況の可視化

## 必要な環境

- Node.js 18.x 以上
- npm または bun
- Supabase アカウント
- Stripe アカウント（決済機能を使用する場合）
- Twilio アカウント（SMS機能を使用する場合）
- Resend アカウント（メール送信機能を使用する場合）

## セットアップ手順

### 1. リポジトリのクローンとパッケージインストール

\`\`\`bash
git clone [your-repository-url]
cd dental
npm install
\`\`\`

### 2. Supabaseプロジェクトのセットアップ

#### 2.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーをメモ

#### 2.2 データベースマイグレーションの実行

\`\`\`bash
# Supabase CLIのインストール
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# マイグレーションの実行
supabase db push
\`\`\`

マイグレーションファイル：
- \`supabase/migrations/20250110000000-add-payment-and-notification-tables.sql\`
- その他の既存マイグレーション

#### 2.3 Edge Functionsのデプロイ

\`\`\`bash
# 決済機能
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy send-payment-confirmation-email

# SMS送信機能
supabase functions deploy send-sms
supabase functions deploy send-appointment-reminder-sms

# リマインダー機能
supabase functions deploy scheduled-reminders

# 既存の機能
supabase functions deploy send-appointment-email
supabase functions deploy send-confirmation-email
supabase functions deploy send-cancellation-email
supabase functions deploy send-reminder-emails
\`\`\`

#### 2.4 Edge Functionsの環境変数設定

\`\`\`bash
# Stripe設定
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio設定
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+81xxxxxxxxxx

# Resend設定
supabase secrets set RESEND_API_KEY=re_xxxxx

# Supabase設定
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 3. Stripe設定（決済機能）

#### 3.1 Stripeアカウントの作成

1. [Stripe](https://stripe.com)でアカウントを作成
2. ダッシュボードから「開発者」→「APIキー」を選択
3. 公開可能キーとシークレットキーをメモ

#### 3.2 Webhookの設定

1. Stripeダッシュボードで「開発者」→「Webhook」を選択
2. 新しいエンドポイントを追加:
   - URL: \`https://your-project.supabase.co/functions/v1/stripe-webhook\`
   - イベント: \`payment_intent.succeeded\`, \`payment_intent.payment_failed\`, \`charge.refunded\`
3. Webhook署名シークレットをメモ

### 4. Twilio設定（SMS機能）

#### 4.1 Twilioアカウントの作成

1. [Twilio](https://www.twilio.com)でアカウントを作成
2. 電話番号を購入（日本の番号推奨）
3. ダッシュボードからAccount SIDとAuth Tokenをメモ

#### 4.2 日本向けSMS設定

1. Twilioコンソールで「Messaging」→「Services」を選択
2. 新しいMessaging Serviceを作成
3. 送信者の電話番号を追加

### 5. Resend設定（メール送信）

#### 5.1 Resendアカウントの作成

1. [Resend](https://resend.com)でアカウントを作成
2. ドメインを認証（推奨）
3. APIキーを生成してメモ

### 6. 環境変数の設定

プロジェクトルートに\`.env\`ファイルを作成：

\`\`\`bash
# .env.exampleをコピー
cp .env.example .env
\`\`\`

\`.env\`ファイルを編集して、各サービスの認証情報を設定：

\`\`\`env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+81xxxxxxxxxx

# Resend Configuration
RESEND_API_KEY=re_xxxxx

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 7. リマインダー自動送信の設定

予約リマインダーを自動送信するには、Supabase Cronジョブを設定します：

1. Supabaseダッシュボードで「Database」→「Extensions」を選択
2. \`pg_cron\`拡張を有効化
3. 以下のSQLを実行：

\`\`\`sql
-- 毎日10:00にリマインダーを送信
SELECT cron.schedule(
  'send-daily-reminders',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/scheduled-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-service-role-key"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
\`\`\`

### 8. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで \`http://localhost:5173\` にアクセス

### 9. 本番環境へのデプロイ

#### Vercelへのデプロイ

\`\`\`bash
# Vercel CLIのインストール
npm install -g vercel

# デプロイ
vercel

# 環境変数の設定
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
\`\`\`

## 管理者アカウント

デフォルトの管理者アカウント：
- ユーザー名: \`sup@ei-life.co.jp\`
- パスワード: \`pass\`

**重要**: 本番環境では必ずパスワードを変更してください。

## 機能の使い方

### 決済機能

1. 予約時に決済が必要な治療を選択
2. PaymentFormコンポーネントが自動的に表示
3. Stripe Elements UIでカード情報を入力
4. 決済完了後、確認メールが自動送信

### SMS通知

1. 管理画面で「通知・リマインダー設定」を選択
2. リマインダー設定で「SMS」または「メール＆SMS」を選択
3. メッセージテンプレートを編集
4. 設定を有効化

### リマインダー自動送信

1. リマインダー設定で送信タイミングを設定（例: 1日前、10:00）
2. メッセージテンプレートをカスタマイズ
3. 設定を有効化
4. Cronジョブが自動的に対象の予約にリマインダーを送信

## トラブルシューティング

### Stripe Webhookが動作しない

1. Webhook URLが正しいか確認
2. Webhook署名シークレットが正しく設定されているか確認
3. Supabase Edge Functionsのログを確認: \`supabase functions logs stripe-webhook\`

### SMSが送信されない

1. Twilio認証情報が正しいか確認
2. 電話番号のフォーマットが正しいか確認（+81形式）
3. Twilioアカウントの残高を確認
4. Edge Functionsのログを確認: \`supabase functions logs send-sms\`

### リマインダーが送信されない

1. Cronジョブが正しく設定されているか確認
2. リマインダー設定が有効になっているか確認
3. 対象の予約のステータスが\`confirmed\`になっているか確認
4. Edge Functionsのログを確認: \`supabase functions logs scheduled-reminders\`

## サポート

問題が発生した場合は、以下をご確認ください：

1. Supabase Edge Functionsのログ
2. ブラウザのコンソールログ
3. ネットワークタブでAPIリクエストの状態

## ライセンス

©合同会社UMA

---

**SmartReserve予約システム** - 歯科医院向けオールインワン予約管理ソリューション



