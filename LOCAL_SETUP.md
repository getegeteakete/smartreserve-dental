# ローカル環境でのセットアップガイド

このガイドでは、SmartReserve予約システムをローカル環境で動作確認する方法を説明します。

## 🚀 クイックスタート（基本機能のみ）

基本的な予約機能は、追加の設定なしですぐに動作します。

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### 3. 動作する機能

✅ **すぐに使える機能:**
- 予約フォーム
- 治療メニュー選択
- カレンダー表示
- 管理画面（ログイン: `sup@ei-life.co.jp` / パスワード: `pass`）
- 予約一覧・管理
- 患者管理
- スケジュール設定

## 💳 決済機能を有効にする（オプション）

決済機能をテストしたい場合は、以下の手順で設定してください。

### 1. Stripeアカウントの作成

1. [Stripe](https://stripe.com/jp)でアカウントを作成（無料）
2. ダッシュボードにログイン
3. 左下の「開発者」メニューをクリック
4. 「APIキー」を選択

### 2. テストキーの取得

「テストモード」がONになっていることを確認し、以下をコピー：
- **公開可能キー** (pk_test_で始まる)
- **シークレットキー** (sk_test_で始まる) ※これはEdge Functionsで使用

### 3. 環境変数の設定

`.env.local` ファイルを開いて、Stripeの公開可能キーを設定：

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
```

### 4. 動作確認

1. 開発サーバーを再起動: `npm run dev`
2. 予約時に決済フォームが表示されます
3. テストカード番号で決済をテスト:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 将来の任意の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）

**注意**: 完全な決済機能を動作させるには、Supabase Edge Functionsのデプロイが必要です（後述）。

## 📱 SMS/メール機能を有効にする（オプション）

SMS送信やメール送信機能を使用する場合は、以下のサービスのアカウントが必要です：

### Twilio（SMS送信）

1. [Twilio](https://www.twilio.com/ja-jp)でアカウントを作成
2. 電話番号を購入（試用版でも可能）
3. Account SIDとAuth Tokenを取得
4. `.env.local`に追加:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
   ```

### Resend（メール送信）

1. [Resend](https://resend.com)でアカウントを作成
2. APIキーを生成
3. `.env.local`に追加:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

## 🌐 完全なデモ環境のセットアップ

すべての機能（決済、SMS、リマインダー自動送信など）を動作させるには、Supabaseのセットアップが必要です。

### 必要な作業

1. **Supabaseプロジェクトの作成**
   - [Supabase](https://supabase.com)でプロジェクトを作成

2. **データベースマイグレーションの実行**
   ```bash
   # Supabase CLIのインストール
   npm install -g supabase
   
   # ログイン
   supabase login
   
   # プロジェクトをリンク
   supabase link --project-ref your-project-ref
   
   # マイグレーション実行
   supabase db push
   ```

3. **Edge Functionsのデプロイ**
   ```bash
   # 決済関連
   supabase functions deploy create-payment-intent
   supabase functions deploy stripe-webhook
   supabase functions deploy send-payment-confirmation-email
   
   # SMS関連
   supabase functions deploy send-sms
   supabase functions deploy send-appointment-reminder-sms
   
   # リマインダー関連
   supabase functions deploy scheduled-reminders
   
   # 既存機能
   supabase functions deploy send-appointment-email
   supabase functions deploy send-confirmation-email
   supabase functions deploy send-cancellation-email
   supabase functions deploy send-reminder-emails
   ```

4. **Supabase Secretsの設定**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
   supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
   supabase secrets set TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
   supabase secrets set RESEND_API_KEY=re_xxxxx
   ```

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

## 🔍 動作確認のポイント

### 基本機能のテスト

1. **予約作成**
   - トップページから「予約する」をクリック
   - 治療メニューを選択
   - 日時と患者情報を入力
   - 予約を送信

2. **管理画面**
   - `/admin-login` にアクセス
   - ユーザー名: `sup@ei-life.co.jp`
   - パスワード: `pass`
   - 予約一覧、カレンダー、患者管理などを確認

3. **スケジュール設定**
   - 管理画面から「スケジュール設定」
   - 営業時間や休診日を設定

### 決済機能のテスト（Stripe設定済みの場合）

1. 決済が必要な治療を選択
2. 決済フォームが表示されることを確認
3. テストカード情報を入力
4. 決済完了ページが表示されることを確認

### SMS/メール機能のテスト（設定済みの場合）

1. 管理画面の「通知・リマインダー設定」にアクセス
2. リマインダー設定を作成
3. テスト送信ボタンで動作確認

## 🐛 トラブルシューティング

### ポート5173が既に使用されている

```bash
# 別のポートで起動
npm run dev -- --port 3000
```

### モジュールが見つからないエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

### ブラウザに何も表示されない

1. ブラウザのコンソールを確認（F12キー）
2. エラーメッセージを確認
3. 開発サーバーのログを確認

### Supabaseへの接続エラー

1. `.env.local` の設定を確認
2. VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が正しいか確認
3. ネットワーク接続を確認

## 📦 本番環境へのデプロイ

ローカルでの動作確認後、本番環境にデプロイする場合：

### Vercel

```bash
npm install -g vercel
vercel
```

### Lovable

1. [Lovable](https://lovable.dev/projects/5008901c-8f5a-40b5-b59e-fe7c6be75dab)を開く
2. Share → Publish をクリック

## 💡 ヒント

- **開発中は決済機能なしでOK**: 基本的な予約機能だけなら追加設定不要です
- **Stripeのテストモード**: 本物のお金は動きません。安心してテストできます
- **環境変数の変更後は再起動**: `.env.local` を変更したら、開発サーバーを再起動してください
- **ホットリロード**: ソースコードの変更は自動的にブラウザに反映されます

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. ブラウザのコンソールログ（F12キー → Console）
2. 開発サーバーのターミナル出力
3. [SETUP_GUIDE.md](./SETUP_GUIDE.md)のトラブルシューティングセクション

---

**SmartReserve予約システム** - ©合同会社UMA

基本的な予約機能は今すぐ使えます！決済やSMS機能は必要に応じて追加してください。



