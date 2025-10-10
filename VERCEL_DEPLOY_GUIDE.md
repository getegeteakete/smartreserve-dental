# Vercelデプロイガイド

SmartReserve予約システムをVercelにデプロイする完全ガイドです。

## 🚀 クイックデプロイ（5分で完了）

### 方法1: Vercel CLIを使用（推奨）

#### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

#### 2. Vercelにログイン

```bash
vercel login
```

ブラウザが開くので、GitHubアカウントなどで認証します。

#### 3. プロジェクトをデプロイ

プロジェクトルートで以下を実行：

```bash
vercel
```

質問に答えます：
- **Set up and deploy?** → Y（Enter）
- **Which scope?** → 自分のアカウントを選択
- **Link to existing project?** → N（初回は新規作成）
- **What's your project's name?** → smartreserve（または任意の名前）
- **In which directory is your code located?** → ./（そのままEnter）
- **Want to override the settings?** → N（そのままEnter）

✅ デプロイ開始！数分で完了します。

#### 4. 環境変数の設定

```bash
vercel env add VITE_SUPABASE_URL
```

プロンプトに従って値を入力します：
- **Value:** https://your-project.supabase.co
- **Add to which Environments?** → Production, Preview, Development（すべて選択）

同様に他の環境変数も追加：

```bash
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

#### 5. 環境変数を反映させて再デプロイ

```bash
vercel --prod
```

#### 6. 完了！

デプロイされたURLが表示されます：
```
https://smartreserve-xxxxx.vercel.app
```

---

### 方法2: Vercelダッシュボードから（GUI）

#### 1. GitHubにプッシュ

まず、プロジェクトをGitHubにプッシュします：

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Vercelでインポート

1. [Vercel](https://vercel.com)にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを接続
4. 「Import」をクリック

#### 3. プロジェクト設定

- **Framework Preset:** Vite（自動検出されます）
- **Root Directory:** ./（デフォルト）
- **Build Command:** `npm run build`（自動設定）
- **Output Directory:** `dist`（自動設定）

#### 4. 環境変数を追加

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | https://your-project.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | your-anon-key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | pk_test_or_pk_live_xxxxx |

すべての環境（Production, Preview, Development）にチェックを入れます。

#### 5. デプロイ

「Deploy」をクリック！

数分でデプロイが完了します。

---

## 🔧 必須環境変数

### 基本機能（必須）

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 決済機能を使う場合

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**注意**: 本番環境では `pk_live_` キーを使用してください。

### SMS機能を使う場合（Edge Functions用）

Supabase Edge Functionsの環境変数として設定済みであれば不要です。

---

## 📝 デプロイ前のチェックリスト

### ✅ コードの準備

- [ ] すべての変更をコミット
- [ ] ビルドエラーがないか確認: `npm run build`
- [ ] ローカルで動作確認: `npm run dev`

### ✅ Supabaseの準備

- [ ] Supabaseプロジェクトが作成されている
- [ ] データベースがセットアップされている（`COMPLETE_DATABASE_SETUP.sql`を実行）
- [ ] Edge Functionsがデプロイされている（決済・SMS機能を使う場合）
- [ ] Supabase URLとAPIキーを確認

### ✅ Stripeの準備（決済機能を使う場合）

- [ ] Stripeアカウントが作成されている
- [ ] **本番用**の公開可能キーを取得
- [ ] Webhook URLをVercelのドメインに更新
  - 例: `https://your-app.vercel.app/api/stripe-webhook`

---

## 🔄 更新時のデプロイ

### CLIを使用

```bash
# 変更をコミット
git add .
git commit -m "Update features"

# 本番環境にデプロイ
vercel --prod
```

### GitHubを使用

GitHubにプッシュするだけで自動デプロイされます：

```bash
git push origin main
```

Vercelが自動的に検知してデプロイを開始します。

---

## 🌐 カスタムドメインの設定

### 1. ドメインを追加

Vercelダッシュボード：
1. プロジェクトを選択
2. 「Settings」→「Domains」
3. 「Add Domain」をクリック
4. ドメイン名を入力（例: smartreserve.com）

### 2. DNSレコードを設定

ドメインレジストラで以下のレコードを追加：

**Aレコード:**
```
Type: A
Name: @ または www
Value: 76.76.21.21
```

**CNAMEレコード:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL証明書

Vercelが自動的にLet's EncryptのSSL証明書を発行します（無料）。

---

## 🎯 パフォーマンス最適化

Vercelでは以下が自動的に適用されます：

✅ **自動CDN配信** - 世界中で高速アクセス  
✅ **画像最適化** - 自動的に最適なフォーマットで配信  
✅ **キャッシング** - 静的ファイルの高速配信  
✅ **圧縮** - Gzip/Brotli圧縮  
✅ **HTTP/2** - 最新プロトコル対応  

---

## 🔒 本番環境のセキュリティ

### 環境変数の管理

- ✅ すべてのシークレットキーはVercelの環境変数で管理
- ✅ `.env.local` は`.gitignore`に含める
- ❌ シークレットキーをコードに直接書かない
- ❌ GitHubにシークレットキーをプッシュしない

### Stripeの設定

本番環境では：
- `pk_live_` で始まる公開可能キーを使用
- `sk_live_` で始まるシークレットキーを使用（Edge Functions）
- Webhook署名シークレットを本番用に更新

### Supabaseの設定

- 本番用のプロジェクトを使用
- RLSポリシーを適切に設定
- サービスロールキーは絶対に公開しない

---

## 📊 デプロイの監視

### Vercelダッシュボードで確認できること

- **デプロイステータス**: 成功/失敗
- **ビルドログ**: エラーの詳細
- **パフォーマンス**: ページ読み込み速度
- **アクセス解析**: 訪問者数、ページビュー
- **エラーログ**: ランタイムエラー

### デプロイが失敗した場合

1. Vercelのビルドログを確認
2. ローカルで `npm run build` を実行してエラーを確認
3. 環境変数が正しく設定されているか確認
4. Node.jsのバージョンを確認（`package.json`で指定可能）

---

## 🐛 トラブルシューティング

### ビルドエラー: "Cannot find module"

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
npm run build
```

### 環境変数が反映されない

環境変数を追加・変更した後は再デプロイが必要：
```bash
vercel --prod
```

### ページが真っ白

1. ブラウザのコンソールを確認（F12）
2. Supabaseの接続情報が正しいか確認
3. CORSエラーがないか確認

### 決済機能が動作しない

1. Stripe Webhookエンドポイントを確認
2. WebhookのURLが本番ドメインになっているか確認
3. Webhook署名シークレットが正しいか確認

---

## 💡 ベストプラクティス

### 1. 環境の分離

- **Production**: 本番環境（main/masterブランチ）
- **Preview**: プレビュー環境（feature/developブランチ）
- **Development**: 開発環境（ローカル）

### 2. 自動デプロイの設定

GitHubと連携すれば：
- `main`ブランチへのプッシュ → 本番環境に自動デプロイ
- プルリクエスト → プレビュー環境に自動デプロイ

### 3. ロールバック

何か問題があった場合：
1. Vercelダッシュボードで「Deployments」を選択
2. 以前のデプロイを選択
3. 「Promote to Production」をクリック

---

## 📈 次のステップ

デプロイが完了したら：

1. ✅ **動作確認**
   - すべてのページが表示されるか
   - 予約機能が動作するか
   - 管理画面にログインできるか

2. ✅ **パフォーマンステスト**
   - [PageSpeed Insights](https://pagespeed.web.dev/)でスコアを確認

3. ✅ **SEO設定**
   - メタタグの設定
   - sitemap.xmlの作成
   - robots.txtの確認

4. ✅ **監視設定**
   - エラー監視ツール（Sentry等）の導入
   - アクセス解析（Google Analytics等）の設定

---

## 🆘 サポート

### 公式ドキュメント

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

### よくある質問

**Q: 無料プランで使える？**
A: はい！Vercelの無料プランで十分使えます。

**Q: 独自ドメインは使える？**
A: はい、カスタムドメインを追加できます（無料）。

**Q: Edge Functionsも動く？**
A: Edge FunctionsはSupabase側で動作するため、Vercelのデプロイとは独立しています。

**Q: デプロイに時間がかかる？**
A: 通常2〜5分程度です。

---

## 🎉 デプロイ完了！

デプロイが成功したら、URLをシェアして使い始められます。

**SmartReserve予約システム** - ©合同会社UMA

Vercelで世界中にアプリを配信しましょう！🚀


