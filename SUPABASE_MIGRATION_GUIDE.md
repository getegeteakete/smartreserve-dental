# 🔄 Supabaseプロジェクト移行ガイド

このガイドでは、現在のシステムを新しいSupabaseプロジェクトに移行する手順を説明します。

## 📋 事前準備

### 必要な情報

移行前に以下の情報を用意してください：

- [ ] 新しいSupabaseプロジェクトのURL
- [ ] 新しいSupabaseプロジェクトのAnon Key
- [ ] 新しいSupabaseプロジェクトのService Role Key
- [ ] 新しいSupabaseプロジェクトのProject ID（ref）
- [ ] Resend APIキー（既存のものを使用可能）

---

## ステップ1: 新しいSupabaseプロジェクトを作成

### 1-1. Supabaseでプロジェクトを作成

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. 「New Project」をクリック
3. 以下を入力:
   - **Name**: `smartreserve-dental-new`（任意）
   - **Database Password**: 強固なパスワードを設定（メモする）
   - **Region**: `Northeast Asia (Tokyo)` 推奨
4. 「Create new project」をクリック
5. プロジェクトの作成完了を待つ（2-3分）

### 1-2. プロジェクト情報を取得

プロジェクト作成後、以下の情報を取得してメモしてください：

1. **Settings** → **API** を開く
2. 以下をコピー:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **Project API keys** → **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Project API keys** → **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Settings** → **General** を開く
4. **Reference ID** をコピー: `xxxxxxxxxx`

---

## ステップ2: ローカル環境の設定を更新

### 2-1. 環境変数ファイルを作成

プロジェクトルートに `.env.local` ファイルを作成（または編集）:

```env
# 新しいSupabaseプロジェクトの情報
VITE_SUPABASE_URL=https://新しいプロジェクトID.supabase.co
VITE_SUPABASE_ANON_KEY=新しいanon_public_key

# アプリケーション設定
VITE_APP_URL=http://localhost:5173

# オプション: 決済機能を使用する場合
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# VITE_KOMOJU_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 2-2. コード内のハードコード値を更新

`src/integrations/supabase/client.ts` を編集:

**変更前:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vnwnevhakhgbbxxlmutx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**変更後:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://新しいプロジェクトID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "新しいanon_public_key";
```

---

## ステップ3: データベースのセットアップ

### 方法A: Supabase CLIを使用（推奨）

```bash
# 1. Supabase CLIにログイン
npx supabase login

# 2. 新しいプロジェクトにリンク
npx supabase link --project-ref 新しいプロジェクトID

# 3. マイグレーションを実行
npx supabase db push
```

### 方法B: SQL Editorで手動実行

Supabaseダッシュボードで:

1. **SQL Editor** を開く
2. 「New query」をクリック
3. `COMPLETE_DATABASE_SETUP.sql` の内容をコピー＆ペースト
4. 「Run」をクリック

または、`supabase/migrations/` フォルダ内の各SQLファイルを順番に実行:
- `20240101000000_initial_schema.sql`
- `20240102000000_add_features.sql`
- など（作成日時順）

---

## ステップ4: Edge Functionsをデプロイ

### 4-1. すべてのEdge Functionsをデプロイ

```bash
# メール送信関連
npx supabase functions deploy send-appointment-email
npx supabase functions deploy send-confirmation-email
npx supabase functions deploy send-cancellation-email
npx supabase functions deploy send-reminder-emails
npx supabase functions deploy send-appointment-modification-email
npx supabase functions deploy send-payment-confirmation-email

# その他の機能
npx supabase functions deploy scheduled-reminders
npx supabase functions deploy send-sms
npx supabase functions deploy send-appointment-reminder-sms

# 決済関連（使用する場合）
npx supabase functions deploy create-payment-intent
npx supabase functions deploy stripe-webhook
npx supabase functions deploy create-komoju-session
npx supabase functions deploy komoju-webhook

# Google Calendar連携（使用する場合）
npx supabase functions deploy google-calendar-sync
npx supabase functions deploy google-calendar-auth
```

### 4-2. デプロイの確認

Supabaseダッシュボードで:
1. **Edge Functions** を開く
2. デプロイされた関数が表示されているか確認
3. 各関数のステータスが「Active」になっているか確認

---

## ステップ5: Supabase Secretsを設定

### 5-1. 必須のSecrets

```bash
# Resend APIキー（メール送信に必須）
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 5-2. オプションのSecrets

```bash
# Stripe（決済機能を使用する場合）
npx supabase secrets set STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Twilio（SMS送信を使用する場合）
npx supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
npx supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
npx supabase secrets set TWILIO_PHONE_NUMBER=+81xxxxxxxxxx

# KOMOJU（日本の決済を使用する場合）
npx supabase secrets set KOMOJU_SECRET_KEY=sk_xxxxxxxxxxxxx
```

### 5-3. Secretsの確認

```bash
# 設定されているSecretsを確認
npx supabase secrets list
```

---

## ステップ6: Vercelの環境変数を更新

### 6-1. Vercelダッシュボードで設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** を開く
4. 以下の変数を更新または追加:

| 変数名 | 値 | 環境 |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://新しいプロジェクトID.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `新しいanon_public_key` | Production, Preview, Development |

5. 「Save」をクリック

### 6-2. 再デプロイ

環境変数を更新後、再デプロイが必要です:

1. **Deployments** タブを開く
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択

または、Gitにプッシュすると自動的に再デプロイされます。

---

## ステップ7: デフォルトデータの投入

### 7-1. アプリを起動

```bash
npm run dev
```

### 7-2. 自動データ投入

アプリを起動すると、以下が自動的に作成されます:
- デフォルトの診療メニュー
- デフォルトのカテゴリー
- デフォルトのスケジュール

### 7-3. 手動でデータを投入する場合

Supabase SQL Editorで `sample-data-insert.sql` を実行

---

## ステップ8: 動作確認

### 8-1. ローカル環境での確認

```bash
npm run dev
```

1. http://localhost:5173 にアクセス
2. 以下を確認:
   - [ ] トップページが表示される
   - [ ] 診療メニューが表示される
   - [ ] 予約フォームが動作する
   - [ ] 予約を作成できる
   - [ ] メールが送信される（ブラウザのコンソールで確認）

### 8-2. 管理画面の確認

1. http://localhost:5173/admin-login にアクセス
2. ログイン:
   - **ユーザー名**: `sup@ei-life.co.jp`
   - **パスワード**: `pass`
3. 以下を確認:
   - [ ] 予約一覧が表示される
   - [ ] 患者管理が動作する
   - [ ] スケジュール設定が動作する

### 8-3. 本番環境での確認

Vercelにデプロイ後:
1. 本番URLにアクセス
2. 同様の動作確認を実施

---

## ステップ9: Resendドメイン設定（メール送信に必須）

### 9-1. Resendでドメインを追加

1. [Resend Domains](https://resend.com/domains) にアクセス
2. 「Add Domain」をクリック
3. `489.toyoshima-do.com` を入力
4. DNSレコードが表示される

### 9-2. XserverでDNSレコードを設定

Xserverサーバーパネルで:

1. **DNSレコード設定** を開く
2. `489.toyoshima-do.com` を選択
3. 以下のレコードを追加:

#### DKIM
```
種別: TXT
ホスト名: resend._domainkey.489
内容: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkX5KKwO7CV+emB7+UNxT175wmJU3HgeC2Mt04RMD3jUo4kb128Io2sLc+JTzQsCZ7cvQrDcYbXm3ZHsO23SjgqR7bxWnY3gALjbZJJqLZupCqhn6tUKWrycEJ7jPqWxPG0sjJuCyfD4gHJTaf51HqHCniD/dHy6ERRLIG6DTzfwIDAQAB
優先度: 0
```

#### MX
```
種別: MX
ホスト名: send.489
内容: feedback-smtp.ap-northeast-1.amazonses.com
優先度: 10
```

#### SPF
```
種別: TXT
ホスト名: send.489
内容: v=spf1 include:amazonses.com ~all
優先度: 0
```

#### DMARC（推奨）
```
種別: TXT
ホスト名: _dmarc
内容: v=DMARC1; p=none;
優先度: 0
```

### 9-3. ドメイン認証の確認

1. DNSレコード設定後、1〜2時間待つ
2. Resendダッシュボードで `489.toyoshima-do.com` が「Verified」になっているか確認

---

## ステップ10: 旧プロジェクトからのデータ移行（必要な場合）

### 10-1. データのエクスポート

旧Supabaseプロジェクトで:

```bash
# 予約データをエクスポート
npx supabase db dump -f backup.sql --data-only

# または特定のテーブルのみ
npx supabase db dump -f appointments.sql --data-only -t appointments
npx supabase db dump -f patients.sql --data-only -t patients
```

### 10-2. データのインポート

新Supabaseプロジェクトで:

```bash
# SQLファイルをインポート
npx supabase db push --file backup.sql
```

または、Supabase SQL Editorで手動実行

---

## 📝 移行チェックリスト

### 事前準備
- [ ] 新しいSupabaseプロジェクトを作成
- [ ] プロジェクト情報（URL、Keys、ID）を取得
- [ ] Resend APIキーを確認

### ローカル環境
- [ ] `.env.local` を作成・更新
- [ ] `src/integrations/supabase/client.ts` を更新
- [ ] ローカルで動作確認

### Supabase設定
- [ ] データベースマイグレーションを実行
- [ ] Edge Functionsをデプロイ
- [ ] Supabase Secretsを設定
- [ ] デフォルトデータを投入

### 本番環境
- [ ] Vercelの環境変数を更新
- [ ] Vercelで再デプロイ
- [ ] 本番環境で動作確認

### メール設定
- [ ] ResendでドメインをVerify
- [ ] XserverでDNSレコードを設定
- [ ] メール送信をテスト

### データ移行（必要な場合）
- [ ] 旧プロジェクトからデータをエクスポート
- [ ] 新プロジェクトにデータをインポート
- [ ] データの整合性を確認

---

## 🔧 トラブルシューティング

### マイグレーションが失敗する

```bash
# マイグレーションをリセット
npx supabase db reset

# 再度実行
npx supabase db push
```

### Edge Functionのデプロイが失敗する

```bash
# ログイン状態を確認
npx supabase status

# 再ログイン
npx supabase login

# プロジェクトを再リンク
npx supabase link --project-ref 新しいプロジェクトID

# 再デプロイ
npx supabase functions deploy 関数名
```

### メールが送信されない

1. Edge Functionがデプロイされているか確認
2. RESEND_API_KEYが設定されているか確認
3. Resendドメインが認証されているか確認
4. DNSレコードが正しく設定されているか確認

### 予約が作成できない

1. ブラウザのコンソール（F12）でエラーを確認
2. Supabase Edge Functionsのログを確認
3. データベースのテーブルが正しく作成されているか確認

---

## 📞 サポート

問題が発生した場合は、以下を確認してください:

1. ブラウザのコンソールログ（F12キー → Console）
2. Supabase Edge Functionsのログ
3. Vercelのデプロイログ

---

**作成日**: 2025年1月
**対象システム**: SmartReserve予約システム

