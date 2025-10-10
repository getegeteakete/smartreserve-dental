# SmartReserve予約システム

歯科医院向けオールインワン予約管理システム

©合同会社UMA

## 主な機能

- 📅 **予約管理**: オンライン予約受付・管理
- 💳 **決済機能**: Stripe統合による安全なオンライン決済
- 📧 **メール通知**: 予約確認・キャンセル・リマインダーの自動送信
- 📱 **SMS通知**: Twilio統合によるSMS通知
- ⏰ **自動リマインダー**: 予約日前の自動リマインダー送信
- 👥 **患者管理**: 患者情報の一元管理
- 📊 **予約状況の可視化**: カレンダービューで予約状況を確認
- 🔒 **セキュアな認証**: 管理者・患者それぞれの認証システム

## デモサイト

デモサイトのURLは、Vercelなどにデプロイ後に追加してください。

## 開発方法

ローカル環境で開発する場合：

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 技術スタック

### フロントエンド
- Vite
- TypeScript
- React 18
- shadcn-ui
- Tailwind CSS
- React Query (TanStack Query)
- React Router
- date-fns

### バックエンド・インフラ
- Supabase (Database, Authentication, Edge Functions)
- PostgreSQL
- Supabase Realtime

### 外部サービス統合
- **Stripe**: オンライン決済処理
- **Twilio**: SMS送信
- **Resend**: メール送信
- **Google Calendar API**: カレンダー同期（オプション）

## セットアップ

詳細なセットアップ手順は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

### クイックスタート

1. **リポジトリのクローン**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   
   [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) を参照して `.env` ファイルを作成してください。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 環境変数

必要な環境変数については [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) を参照してください。

主な環境変数：
- `VITE_SUPABASE_URL`: SupabaseプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名キー
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe公開可能キー
- `TWILIO_ACCOUNT_SID`: Twilio アカウントSID
- `TWILIO_AUTH_TOKEN`: Twilio認証トークン
- `RESEND_API_KEY`: Resend APIキー

## 管理者ログイン

デフォルトの管理者アカウント：
- **ユーザー名**: `sup@ei-life.co.jp`
- **パスワード**: `pass`

⚠️ **重要**: 本番環境では必ずパスワードを変更してください。

## デプロイ

### Vercelでのデプロイ

```bash
npm install -g vercel
vercel
```

環境変数は Vercel ダッシュボードまたは CLI で設定してください。

## カスタムドメインの設定

Vercelでデプロイした場合：
Project > Settings > Domains → Add Domain

詳細は [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md) を参照してください。

## プロジェクト構造

```
dental/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── admin/          # 管理画面コンポーネント
│   │   ├── payment/        # 決済関連コンポーネント
│   │   └── ui/             # UIコンポーネント(shadcn-ui)
│   ├── pages/              # ページコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── integrations/       # 外部サービス統合
│   │   └── supabase/       # Supabase設定
│   └── utils/              # ユーティリティ関数
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # データベースマイグレーション
├── public/                 # 静的ファイル
└── docs/                   # ドキュメント
```

## 機能詳細

### 決済機能
- Stripe Elements統合
- リアルタイム決済状態の更新
- 自動領収書メール送信
- 返金処理対応

### SMS通知
- 予約確認SMS
- リマインダーSMS
- カスタマイズ可能なメッセージテンプレート
- 送信履歴の管理

### 予約リマインダー
- 指定日数前の自動送信
- メール/SMS/両方から選択可能
- 複数の設定を同時運用可能
- Cronジョブによる自動実行

### 管理機能
- 予約一覧・カレンダー表示
- 患者情報管理
- 診療メニュー管理
- スケジュール設定
- 通知設定・履歴確認

## トラブルシューティング

問題が発生した場合は、[SETUP_GUIDE.md](./SETUP_GUIDE.md) のトラブルシューティングセクションを参照してください。

## ライセンス

©合同会社UMA

---

**SmartReserve予約システム** - ©合同会社UMA
