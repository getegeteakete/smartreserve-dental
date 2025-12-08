# 📧 ローカルでメール送信機能をテストする方法

このガイドでは、Supabase CLIを使ってローカル環境でメール送信機能をテストする方法を説明します。

## 🚀 クイックスタート

### 1. Supabase CLIのインストール

```bash
# npmでインストール（推奨）
npm install -g supabase

# または、npxを使用（インストール不要）
npx supabase --version
```

### 2. ローカルSupabase環境の起動

```bash
# プロジェクトルートで実行
npx supabase start
```

このコマンドで以下が起動します：
- PostgreSQL データベース（ポート: 54322）
- Supabase Studio（http://localhost:54323）
- API Gateway（http://localhost:54321）
- Edge Functions（http://localhost:54321/functions/v1）

### 3. 環境変数の設定

`.env.local` ファイルを作成または編集：

```env
# Supabaseローカル環境
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Resend APIキー（メール送信用）
RESEND_API_KEY=re_あなたのAPIキー

# ローカル開発用の設定
ENVIRONMENT=development
```

**重要**: `VITE_SUPABASE_ANON_KEY` はローカル環境用の固定キーです（`supabase start` で表示されます）。

### 4. Edge Functionのローカル実行設定

ローカルでEdge Functionを実行するには、環境変数を設定する必要があります。

#### Windows (PowerShell)

```powershell
# .env.localから環境変数を読み込む（手動で設定）
$env:RESEND_API_KEY="re_あなたのAPIキー"
$env:SUPABASE_URL="http://localhost:54321"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
```

#### macOS/Linux

```bash
# .env.localから環境変数を読み込む
export RESEND_API_KEY="re_あなたのAPIキー"
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
```

### 5. Edge Functionのローカル実行

```bash
# send-appointment-email関数をローカルで実行
npx supabase functions serve send-appointment-email --env-file .env.local
```

または、すべての関数を同時に実行：

```bash
npx supabase functions serve --env-file .env.local
```

### 6. フロントエンドの起動

別のターミナルで：

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスします。

## 🧪 テスト方法

### 方法1: ブラウザから予約フォームでテスト

1. `http://localhost:5173` にアクセス
2. 予約フォームに入力
3. メールアドレスを入力（実際に受信できるメールアドレス）
4. 予約を送信
5. メールが届くか確認

### 方法2: Edge Functionを直接テスト

Supabase Studioから：

1. `http://localhost:54323` にアクセス
2. 「Edge Functions」を選択
3. `send-appointment-email` を選択
4. 「Invoke」タブを選択
5. 以下のJSONを入力：

```json
{
  "patientName": "テスト太郎",
  "patientEmail": "test@example.com",
  "phone": "090-1234-5678",
  "treatmentName": "初診",
  "fee": 5000,
  "preferredDates": [
    {
      "date": "2025-01-25",
      "timeSlot": "10:00-11:00"
    }
  ],
  "notes": "テスト予約"
}
```

6. 「Invoke」ボタンをクリック
7. レスポンスを確認

### 方法3: curlでテスト

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-appointment-email' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{
    "patientName": "テスト太郎",
    "patientEmail": "test@example.com",
    "phone": "090-1234-5678",
    "treatmentName": "初診",
    "fee": 5000,
    "preferredDates": [
      {
        "date": "2025-01-25",
        "timeSlot": "10:00-11:00"
      }
    ]
  }'
```

## 🔍 ログの確認

### Edge Functionのログ

```bash
# リアルタイムでログを確認
npx supabase functions logs send-appointment-email
```

### Supabase Studioでログを確認

1. `http://localhost:54323` にアクセス
2. 「Edge Functions」→ `send-appointment-email` → 「Logs」タブ

## ⚙️ 環境変数の確認

ローカル環境で使用される環境変数を確認：

```bash
# Supabase CLIで確認
npx supabase status
```

出力例：
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🐛 トラブルシューティング

### 問題1: "RESEND_API_KEYが設定されていません"

**解決方法**:
1. `.env.local` に `RESEND_API_KEY` が設定されているか確認
2. Edge Functionを起動する際に `--env-file .env.local` を指定
3. 環境変数が正しく読み込まれているか確認

```bash
# Windows PowerShell
echo $env:RESEND_API_KEY

# macOS/Linux
echo $RESEND_API_KEY
```

### 問題2: Edge Functionが見つからない

**解決方法**:
```bash
# 関数が存在するか確認
ls supabase/functions/

# 関数を再デプロイ（ローカル）
npx supabase functions serve send-appointment-email --env-file .env.local
```

### 問題3: CORSエラー

**解決方法**:
- Edge FunctionのCORS設定を確認（`index.ts`の`corsHeaders`）
- ブラウザのコンソールでエラーメッセージを確認

### 問題4: メールが届かない

**確認項目**:
1. Resend APIキーが正しいか
2. Resendのドメイン認証が完了しているか（本番環境のみ）
3. メールアドレスが正しい形式か
4. スパムフォルダを確認
5. Edge Functionのログでエラーがないか確認

```bash
# ログを確認
npx supabase functions logs send-appointment-email
```

## 📝 便利なコマンド

### ローカル環境の停止

```bash
npx supabase stop
```

### ローカル環境のリセット

```bash
npx supabase stop
npx supabase start
```

### データベースのリセット

```bash
npx supabase db reset
```

### すべての関数をローカルで実行

```bash
npx supabase functions serve --env-file .env.local
```

## 🎯 次のステップ

ローカルでテストが完了したら：

1. **本番環境にデプロイ**
   ```bash
   npx supabase functions deploy send-appointment-email
   ```

2. **本番環境のSecretsを設定**
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_あなたのAPIキー
   ```

3. **動作確認**
   - 本番環境で予約フォームからテスト
   - メールが届くか確認

---

**注意**: ローカル環境は開発・テスト専用です。本番環境とは別のデータベースを使用します。

