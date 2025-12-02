# 📦 Supabase Edge Function デプロイガイド

このガイドでは、`send-appointment-email` Edge FunctionをSupabaseにデプロイする手順を詳しく説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [Supabase CLIのインストール](#supabase-cliのインストール)
3. [Supabase CLIへのログイン](#supabase-cliへのログイン)
4. [プロジェクトのリンク](#プロジェクトのリンク)
5. [Edge Functionのデプロイ](#edge-functionのデプロイ)
6. [環境変数（Secrets）の設定](#環境変数secretsの設定)
7. [デプロイの確認](#デプロイの確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

デプロイを開始する前に、以下が準備されていることを確認してください：

- ✅ Supabaseプロジェクトが作成されている
- ✅ SupabaseプロジェクトのURLとAPIキーを取得済み
- ✅ Resend APIキーを取得済み（メール送信機能用）
- ✅ ターミナル（コマンドプロンプト）が使用できる

---

## Supabase CLIのインストール

### 方法1: npmを使用（推奨）

```bash
npm install -g supabase
```

### 方法2: npxを使用（グローバルインストール不要）

npxを使用すると、グローバルにインストールせずにコマンドを実行できます：

```bash
# この方法では、コマンドの前に npx を付けます
npx supabase --version
```

**Windowsの場合の注意点:**
- PowerShellまたはコマンドプロンプトを使用してください
- 管理者権限が必要な場合があります

### インストールの確認

インストールが成功したか確認します：

```bash
supabase --version
```

または

```bash
npx supabase --version
```

バージョン番号が表示されれば成功です。

---

## Supabase CLIへのログイン

### ステップ1: ログインコマンドの実行

ターミナルで以下のコマンドを実行します：

```bash
supabase login
```

または

```bash
npx supabase login
```

### ステップ2: ブラウザで認証

1. コマンドを実行すると、ブラウザが自動的に開きます
2. ブラウザが開かない場合は、表示されたURLをコピーしてブラウザで開いてください
3. Supabaseのアカウントでログインします
4. 「Authorize」ボタンをクリックして認証を完了します

### ステップ3: ログインの確認

ターミナルに以下のようなメッセージが表示されれば成功です：

```
✅ Logged in as: your-email@example.com
```

---

## プロジェクトのリンク

### ステップ1: プロジェクトIDの確認

`supabase/config.toml` ファイルを開いて、プロジェクトIDを確認します：

```toml
project_id = "ebuweyxsblraqhesdmvd"
```

または、Supabaseダッシュボードで確認：
1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択
3. Settings → General → Reference ID を確認

### ステップ2: プロジェクトをリンク

プロジェクトルートディレクトリ（`smartreserve-dental2`）で以下のコマンドを実行：

```bash
supabase link --project-ref ebuweyxsblraqhesdmvd
```

または

```bash
npx supabase link --project-ref ebuweyxsblraqhesdmvd
```

**注意**: `ebuweyxsblraqhesdmvd` は実際のプロジェクトIDに置き換えてください。

### ステップ3: リンクの確認

以下のようなメッセージが表示されれば成功です：

```
✅ Linked to project ebuweyxsblraqhesdmvd
```

---

## Edge Functionのデプロイ

### ステップ1: デプロイコマンドの実行

プロジェクトルートディレクトリで以下のコマンドを実行：

```bash
supabase functions deploy send-appointment-email
```

または

```bash
npx supabase functions deploy send-appointment-email
```

### ステップ2: デプロイの進行状況

デプロイ中は、以下のようなメッセージが表示されます：

```
Deploying function send-appointment-email...
✓ Function deployed successfully
```

### ステップ3: デプロイ完了の確認

デプロイが完了すると、以下のような情報が表示されます：

```
Function URL: https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/send-appointment-email
```

---

## 環境変数（Secrets）の設定

Edge Functionで使用する環境変数（Secrets）を設定します。

### ステップ1: Resend APIキーの設定

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

または

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**重要**: `re_xxxxxxxxxxxxx` を実際のResend APIキーに置き換えてください。

### ステップ2: 設定の確認

設定したSecretsを確認するには：

```bash
supabase secrets list
```

または

```bash
npx supabase secrets list
```

### その他のSecrets（必要に応じて）

他の機能を使用する場合は、以下のSecretsも設定してください：

```bash
# Stripe（決済機能用）
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio（SMS送信機能用）
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
```

---

## デプロイの確認

### 方法1: Supabaseダッシュボードで確認

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択
3. 左サイドバーの **Edge Functions** をクリック
4. `send-appointment-email` が表示されていることを確認
5. 関数名をクリックして、詳細を確認

### 方法2: ブラウザで動作確認

1. アプリケーションを起動: `npm run dev`
2. 予約フォームから予約を送信
3. ブラウザのコンソール（F12キー）でエラーがないか確認
4. メールが正常に送信されることを確認

### 方法3: ログの確認

Edge Functionのログを確認するには：

```bash
supabase functions logs send-appointment-email
```

または

```bash
npx supabase functions logs send-appointment-email
```

---

## トラブルシューティング

### エラー1: "Access token not provided"

**原因**: Supabase CLIにログインしていない

**解決方法**:
```bash
supabase login
```

### エラー2: "Project not found"

**原因**: プロジェクトIDが間違っている、またはプロジェクトにアクセス権限がない

**解決方法**:
1. `supabase/config.toml` の `project_id` を確認
2. Supabaseダッシュボードでプロジェクトが存在するか確認
3. 再度 `supabase link` を実行

### エラー3: "Function not found"

**原因**: Edge Functionのファイルが存在しない、またはパスが間違っている

**解決方法**:
1. `supabase/functions/send-appointment-email/index.ts` が存在するか確認
2. プロジェクトルートディレクトリでコマンドを実行しているか確認

### エラー4: "CORS policy error"

**原因**: Edge FunctionのCORS設定が正しくない

**解決方法**:
1. `supabase/functions/send-appointment-email/index.ts` を確認
2. CORSヘッダーが正しく設定されているか確認
3. Edge Functionを再デプロイ

### エラー5: "RESEND_API_KEY is not set"

**原因**: Resend APIキーがSecretsに設定されていない

**解決方法**:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### エラー6: デプロイは成功したが、メールが送信されない

**確認事項**:
1. Resend APIキーが正しく設定されているか
2. Resendでドメイン認証が完了しているか（`RESEND_DOMAIN_SETUP.md` を参照）
3. Edge Functionのログを確認してエラーがないか確認

---

## よくある質問（FAQ）

### Q1: 複数のEdge Functionを一度にデプロイできますか？

A: いいえ、1つずつデプロイする必要があります。ただし、スクリプトを作成して一括デプロイすることもできます：

```bash
# deploy-all.sh (Linux/Mac)
#!/bin/bash
supabase functions deploy send-appointment-email
supabase functions deploy send-confirmation-email
supabase functions deploy send-cancellation-email
# ... 他の関数も追加
```

### Q2: デプロイ後、すぐに反映されますか？

A: はい、通常は数秒で反映されます。ただし、場合によっては1-2分かかることもあります。

### Q3: ローカルでEdge Functionをテストできますか？

A: はい、Supabase CLIを使用してローカルでテストできます：

```bash
supabase functions serve send-appointment-email
```

### Q4: デプロイしたEdge Functionを削除するには？

A: Supabaseダッシュボードから削除するか、以下のコマンドで削除できます：

```bash
supabase functions delete send-appointment-email
```

---

## 次のステップ

Edge Functionのデプロイが完了したら：

1. ✅ メール送信機能のテスト
2. ✅ ブラウザのコンソールでエラーがないか確認
3. ✅ 実際の予約フォームから予約を送信して動作確認
4. ✅ 必要に応じて他のEdge Functionもデプロイ

---

## 参考資料

- [Supabase Edge Functions 公式ドキュメント](https://supabase.com/docs/guides/functions)
- [Resend API ドキュメント](https://resend.com/docs)
- [CORS設定ガイド](./RESEND_DOMAIN_SETUP.md)

---

**問題が解決しない場合は、ブラウザのコンソールログとEdge Functionのログを確認して、エラーメッセージを記録してください。**




