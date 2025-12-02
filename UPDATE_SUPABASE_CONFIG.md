# 📝 Supabase設定更新手順

新しいSupabaseプロジェクトに切り替える際に更新が必要なファイルの一覧です。

## 🔧 更新が必要なファイル

### 1. `src/integrations/supabase/client.ts`

**現在の設定:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vnwnevhakhgbbxxlmutx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZud25ldmhha2hnYmJ4eGxtdXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODExMzEsImV4cCI6MjA3NTY1NzEzMX0.hqpohfHtthILwY9wSRwoPQI9h_wnfaJ_ZSosZzkUW-8";
```

**更新後:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://新しいプロジェクトID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "新しいanon_public_key";
```

---

### 2. `.env.local` (ローカル開発用)

**作成または更新:**
```env
# 新しいSupabaseプロジェクトの情報
VITE_SUPABASE_URL=https://新しいプロジェクトID.supabase.co
VITE_SUPABASE_ANON_KEY=新しいanon_public_key

# アプリケーション設定
VITE_APP_URL=http://localhost:5173
```

---

### 3. Vercel環境変数 (本番環境用)

Vercelダッシュボードで以下を更新:

| 変数名 | 値 |
|---|---|
| `VITE_SUPABASE_URL` | `https://新しいプロジェクトID.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `新しいanon_public_key` |

---

## 📋 更新チェックリスト

- [ ] `src/integrations/supabase/client.ts` を更新
- [ ] `.env.local` を作成/更新
- [ ] ローカルで動作確認 (`npm run dev`)
- [ ] Vercelの環境変数を更新
- [ ] Vercelで再デプロイ
- [ ] 本番環境で動作確認

---

## 🔍 確認方法

### ローカル環境

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
# コンソール（F12）でエラーがないか確認
```

### 本番環境

1. Vercelで再デプロイ
2. 本番URLにアクセス
3. 予約を試す
4. エラーがないか確認

---

## ⚠️ 注意事項

1. **環境変数の優先順位**
   - `.env.local` の値が優先されます
   - `.env.local` がない場合、コード内のデフォルト値が使用されます

2. **本番環境とローカル環境**
   - ローカル: `.env.local` を使用
   - 本番: Vercelの環境変数を使用

3. **セキュリティ**
   - `.env.local` は `.gitignore` に含まれています
   - Gitにコミットされません
   - Service Role Keyはコードに含めないでください

---

**更新日**: 2025年1月

