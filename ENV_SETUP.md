# 🔧 環境変数設定ガイド

## 必要な環境変数

### フロントエンド（.env）

プロジェクトルートに `.env` ファイルを作成してください：

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# KOMOJU Payment Configuration
VITE_KOMOJU_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Application Configuration
VITE_APP_URL=http://localhost:5173
```

### バックエンド（Supabase Edge Functions）

Supabaseダッシュボード → Edge Functions → Settings で設定：

```env
KOMOJU_SECRET_KEY=sk_test_your_secret_key_here
```

## 取得方法

### Supabase

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. Settings → API から以下を取得：
   - `URL`: VITE_SUPABASE_URL
   - `anon public`: VITE_SUPABASE_ANON_KEY

### KOMOJU

1. [KOMOJU Dashboard](https://komoju.com/admin)にログイン
2. Settings → API から以下を取得：
   - `Publishable Key`: VITE_KOMOJU_PUBLISHABLE_KEY
   - `Secret Key`: KOMOJU_SECRET_KEY

## セキュリティ注意事項

⚠️ **重要**:
- `.env` ファイルは絶対にGitにコミットしないでください
- シークレットキーは絶対にフロントエンドで使用しないでください
- 本番環境ではテストキーではなくライブキーを使用してください

