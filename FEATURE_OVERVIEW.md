# SmartReserve予約システム - 機能概要

©合同会社UMA

## 新規実装機能

このドキュメントでは、SmartReserve予約システムに新しく追加されたデモ機能について説明します。

---

## 🎨 ブランディング

### ロゴとブランド表示

ヘッダー左側に以下が表示されます：
- **SmartReserve予約システム** - メインロゴ
- **©合同会社UMA** - 制作会社名（小さく表示）

実装場所: `src/components/Header.tsx`

---

## 💳 決済機能（Stripe統合）

### 概要
Stripeを利用した安全なオンライン決済機能を実装しました。

### 主な機能
- **決済フォーム**: Stripe Elements UIによる安全なカード情報入力
- **Payment Intent**: サーバーサイドでの決済処理
- **Webhook処理**: 決済完了/失敗の自動検知
- **領収書メール**: 決済完了後の自動メール送信
- **決済履歴**: データベースでの決済情報管理

### 実装ファイル
- フロントエンド:
  - `src/components/payment/PaymentForm.tsx` - 決済フォームコンポーネント
  - `src/pages/PaymentSuccess.tsx` - 決済完了ページ

- Edge Functions:
  - `supabase/functions/create-payment-intent/index.ts` - Payment Intent作成
  - `supabase/functions/stripe-webhook/index.ts` - Webhook処理
  - `supabase/functions/send-payment-confirmation-email/index.ts` - 確認メール送信

- データベース:
  - `payments` テーブル - 決済情報の保存

### 使用方法
1. 予約時に決済が必要な治療を選択
2. `PaymentForm` コンポーネントが表示される
3. カード情報を入力して決済
4. 決済完了後、確認メールが自動送信される
5. `/payment-success` ページにリダイレクト

### 必要な環境変数
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 📱 SMS送信機能（Twilio統合）

### 概要
Twilioを使用したSMS通知機能を実装しました。

### 主な機能
- **SMS送信**: 予約確認、リマインダー、カスタム通知
- **電話番号の自動フォーマット**: 国際番号形式への自動変換
- **送信履歴**: すべてのSMS送信を記録
- **エラーハンドリング**: 送信失敗時のエラー記録

### 実装ファイル
- Edge Functions:
  - `supabase/functions/send-sms/index.ts` - SMS送信処理
  - `supabase/functions/send-appointment-reminder-sms/index.ts` - リマインダーSMS送信

- データベース:
  - `sms_logs` テーブル - SMS送信履歴の保存

### SMS送信タイプ
- **reminder**: 予約リマインダー
- **notification**: 一般通知
- **confirmation**: 予約確認

### 使用方法
```typescript
// Edge Function経由でSMS送信
const response = await fetch(
  `${supabaseUrl}/functions/v1/send-sms`,
  {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber: '+8190XXXXXXXX',
      message: 'ご予約のリマインダーです',
      appointmentId: 'xxx',
      purpose: 'reminder',
    }),
  }
);
```

### 必要な環境変数
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
```

---

## ⏰ 予約リマインダー機能

### 概要
予約日の指定日数前に自動でリマインダーを送信する機能を実装しました。

### 主な機能
- **複数設定対応**: 1日前、3日前など複数のリマインダーを設定可能
- **通知方法選択**: メール/SMS/両方から選択
- **カスタムメッセージ**: テンプレート変数を使用したメッセージカスタマイズ
- **自動送信**: Cronジョブによる自動実行
- **送信履歴管理**: 重複送信防止と履歴確認

### 実装ファイル
- Edge Functions:
  - `supabase/functions/scheduled-reminders/index.ts` - メインの自動送信処理

- データベース:
  - `reminder_settings` テーブル - リマインダー設定
  - `sent_reminders` テーブル - 送信履歴

### テンプレート変数
- `{name}` - 患者名
- `{date}` - 予約日
- `{time}` - 予約時間
- `{treatment}` - 治療名

### Cronジョブ設定例
```sql
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
```

---

## 🔧 管理画面の拡張

### 通知設定管理

新しい管理画面を追加しました：`/admin/notifications`

#### ReminderSettingsManager
リマインダー設定の作成・編集・削除を行うコンポーネント

実装場所: `src/components/admin/ReminderSettingsManager.tsx`

機能:
- リマインダー設定の作成
- 送信タイミング設定（何日前、何時）
- 通知方法選択（メール/SMS/両方）
- メッセージテンプレートのカスタマイズ
- 設定の有効化/無効化

#### NotificationHistoryManager
通知送信履歴の確認と管理を行うコンポーネント

実装場所: `src/components/admin/NotificationHistoryManager.tsx`

機能:
- メール送信履歴の表示
- SMS送信履歴の表示
- 送信ステータスの確認
- 手動リマインダー送信

### 管理画面へのアクセス
1. 管理画面にログイン
2. 「通知・リマインダー設定」ボタンをクリック
3. 2つのタブで設定と履歴を管理

---

## 📊 データベーススキーマ拡張

### 新規テーブル

#### payments
```sql
- id (UUID): 主キー
- appointment_id (UUID): 予約ID
- stripe_payment_intent_id (TEXT): Stripe Payment Intent ID
- stripe_charge_id (TEXT): Stripe Charge ID
- amount (INTEGER): 金額（円）
- currency (TEXT): 通貨（デフォルト: jpy）
- status (TEXT): 決済ステータス
- payment_method_type (TEXT): 決済方法
- receipt_url (TEXT): 領収書URL
- error_message (TEXT): エラーメッセージ
- metadata (JSONB): その他情報
- created_at, updated_at
```

#### reminder_settings
```sql
- id (UUID): 主キー
- name (TEXT): 設定名
- enabled (BOOLEAN): 有効/無効
- reminder_type (TEXT): email/sms/both
- days_before (INTEGER): 何日前
- time_of_day (TIME): 送信時刻
- message_template (TEXT): メッセージテンプレート
- created_at, updated_at
```

#### sent_reminders
```sql
- id (UUID): 主キー
- appointment_id (UUID): 予約ID
- reminder_setting_id (UUID): 設定ID
- reminder_type (TEXT): email/sms
- sent_at (TIMESTAMP): 送信日時
- status (TEXT): 送信ステータス
- error_message (TEXT): エラーメッセージ
- created_at
```

#### sms_logs
```sql
- id (UUID): 主キー
- appointment_id (UUID): 予約ID
- phone_number (TEXT): 電話番号
- message (TEXT): メッセージ内容
- purpose (TEXT): 目的（reminder/notification/confirmation）
- twilio_sid (TEXT): Twilio SID
- status (TEXT): 送信ステータス
- error_message (TEXT): エラーメッセージ
- created_at, updated_at
```

### マイグレーションファイル
`supabase/migrations/20250110000000-add-payment-and-notification-tables.sql`

---

## 🔐 セキュリティとパフォーマンス

### セキュリティ対策
- すべてのシークレットキーはSupabase Secretsで管理
- Stripe Webhook署名の検証
- Row Level Security (RLS) の適用
- CORS設定による適切なアクセス制御

### パフォーマンス最適化
- データベースインデックスの適用
- Edge Functionsによる高速処理
- 重複送信の防止
- エラーハンドリングとリトライ機構

---

## 📝 セットアップ手順まとめ

1. **パッケージのインストール**
   ```bash
   npm install stripe @stripe/stripe-js twilio
   ```

2. **環境変数の設定**
   - `.env` ファイルを作成
   - Stripe、Twilio、Resendの認証情報を設定

3. **データベースマイグレーション**
   ```bash
   supabase db push
   ```

4. **Edge Functionsのデプロイ**
   ```bash
   supabase functions deploy create-payment-intent
   supabase functions deploy stripe-webhook
   supabase functions deploy send-sms
   supabase functions deploy scheduled-reminders
   # ... その他の関数
   ```

5. **Supabase Secretsの設定**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
   supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
   # ... その他のシークレット
   ```

6. **Cronジョブの設定**
   - Supabaseダッシュボードで `pg_cron` を有効化
   - リマインダー送信のスケジュールを設定

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

---

## 🧪 テスト方法

### 決済機能のテスト
1. Stripeテストモードを使用
2. テスト用カード番号: `4242 4242 4242 4242`
3. 有効期限: 将来の任意の日付
4. CVC: 任意の3桁

### SMS機能のテスト
1. Twilioテストアカウントを使用
2. テスト用電話番号で送信
3. Twilioコンソールでログを確認

### リマインダー機能のテスト
1. リマインダー設定で「0日前」を設定
2. 本日の予約を作成
3. 手動で `scheduled-reminders` 関数を実行
4. メール/SMS受信を確認

---

## 📞 サポート

### よくある質問

**Q: 決済が完了しているのに予約ステータスがconfirmedにならない**
A: Webhook設定を確認してください。Stripe WebhookのURLが正しく設定されているか確認が必要です。

**Q: SMSが送信されない**
A: 以下を確認してください：
- Twilio認証情報が正しいか
- 電話番号が国際番号形式（+81）になっているか
- Twilioアカウントに残高があるか

**Q: リマインダーが自動送信されない**
A: Cronジョブが正しく設定されているか確認してください。Supabaseダッシュボードの「Database」→「Cron Jobs」で確認できます。

### トラブルシューティング

詳細なトラブルシューティング手順は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

---

## 🚀 今後の拡張可能性

- LINEメッセージング統合
- 複数言語対応
- AI チャットボットによる予約サポート
- Google Calendar / Outlook Calendar同期
- QRコードチェックインシステム
- ビデオ通話機能（オンライン診療）

---

**SmartReserve予約システム** - ©合同会社UMA



