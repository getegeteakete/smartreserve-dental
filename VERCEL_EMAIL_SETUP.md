# 📧 Vercelでのメール送信設定ガイド

## ✅ 実装完了

メール送信機能をVercel API Routesに移行しました。Resend APIを使用して、Vercel上で動作します。

## 🔧 設定手順

### 1. 依存関係のインストール

```bash
npm install
```

これで以下のパッケージがインストールされます：
- `resend`: Resend APIクライアント
- `@vercel/node`: Vercel API Routes用の型定義

### 2. Vercel環境変数の設定

VercelダッシュボードまたはCLIで環境変数を設定：

#### Vercelダッシュボードから設定

1. [Vercel Dashboard](https://vercel.com) にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** をクリック
4. 以下の環境変数を追加：

| 名前 | 値 | 環境 |
|---|---|---|
| `RESEND_API_KEY` | `re_あなたのAPIキー` | Production, Preview, Development |

#### Vercel CLIから設定

```bash
vercel env add RESEND_API_KEY
```

プロンプトに従って値を入力します。

### 3. Resend APIキーの取得

1. [Resend Dashboard](https://resend.com/api-keys) にアクセス
2. ログイン
3. 「Create API Key」をクリック
4. 名前を入力（例: SmartReserve）
5. キーをコピー（`re_` で始まる文字列）

### 4. デプロイ

```bash
vercel --prod
```

または、GitHubにプッシュすると自動デプロイされます。

## 📁 ファイル構成

```
api/
  └── send-appointment-email.ts  # Vercel API Route（メール送信）
```

## 🔍 動作確認

### ローカルでのテスト

Vercel CLIを使用してローカルでテスト：

```bash
vercel dev
```

これで `http://localhost:3000/api/send-appointment-email` が利用可能になります。

### 本番環境でのテスト

1. 予約フォームから予約を送信
2. ブラウザのコンソール（F12）でログを確認
3. メールが届くか確認

## 📧 メール設定

### From（差出人）アドレス

固定で `t@489.toyoshima-do.com` を使用します。

### メール送信先

- **患者様**: 予約フォームで入力されたメールアドレス
- **管理者**: `t@489.toyoshima-do.com`

## 🐛 トラブルシューティング

### エラー: "RESEND_API_KEYが環境変数に設定されていません"

**解決方法**:
1. Vercelダッシュボードで環境変数を確認
2. `RESEND_API_KEY` が設定されているか確認
3. デプロイを再実行

### エラー: "404 Not Found"

**解決方法**:
1. `api/send-appointment-email.ts` が存在するか確認
2. Vercelにデプロイされているか確認
3. デプロイログを確認

### メールが届かない

**確認項目**:
1. Resend APIキーが正しいか
2. Resendのドメイン認証が完了しているか（`489.toyoshima-do.com`）
3. スパムフォルダを確認
4. Vercelのログを確認（Functions → Logs）

## 📝 環境変数一覧

### 必須

- `RESEND_API_KEY`: Resend APIキー（`re_` で始まる）

### オプション

- `VITE_API_URL`: APIのベースURL（デフォルト: `/api`）

## 🚀 デプロイ後の確認

1. **Vercelダッシュボードで確認**
   - Functions → `api/send-appointment-email` が表示されているか
   - Logsでエラーがないか確認

2. **ブラウザでテスト**
   - 予約フォームから予約を送信
   - コンソールでエラーがないか確認
   - メールが届くか確認

---

**注意**: メール送信が失敗しても予約は正常に保存されます。メールは後から手動で送信することもできます。

