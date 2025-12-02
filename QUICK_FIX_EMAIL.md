# 🚨 メール送信エラー 緊急修正ガイド

## 現在のエラー

```
CORS policy: Response to preflight request doesn't pass access control check
Failed to send a request to the Edge Function
```

このエラーは、**Edge Functionがデプロイされていない**ことが原因です。

## ✅ 解決方法（3ステップ）

### ステップ1: Supabase CLIにログイン

ターミナル（PowerShellまたはコマンドプロンプト）を開いて、以下を実行：

```bash
npx supabase login
```

ブラウザが開くので、Supabaseアカウントでログインして認証を完了してください。

### ステップ2: プロジェクトをリンク

```bash
npx supabase link --project-ref vnwnevhakhgbbxxlmutx
```

**重要**: エラーメッセージから、プロジェクトIDは `vnwnevhakhgbbxxlmutx` です。
もし異なる場合は、Supabaseダッシュボードで確認してください。

### ステップ3: Edge Functionをデプロイ

```bash
npx supabase functions deploy send-appointment-email
```

デプロイが完了すると、以下のようなメッセージが表示されます：

```
✓ Function deployed successfully
```

## 🔑 重要: RESEND_API_KEYの設定

デプロイ後、Resend APIキーを設定する必要があります：

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**注意**: `re_xxxxxxxxxxxxx` を実際のResend APIキーに置き換えてください。

## 📋 確認方法

1. Supabaseダッシュボードにアクセス
2. 左サイドバーの **Edge Functions** をクリック
3. `send-appointment-email` が表示されていることを確認

## 🐛 トラブルシューティング

### エラー: "Access token not provided"

→ ステップ1のログインを再度実行してください。

### エラー: "Project not found"

→ プロジェクトIDが正しいか確認してください。Supabaseダッシュボードで確認できます。

### デプロイ後もエラーが続く場合

1. ブラウザを完全にリロード（Ctrl+Shift+R または Cmd+Shift+R）
2. ブラウザのキャッシュをクリア
3. 再度予約を試す

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. SupabaseダッシュボードでEdge Functionがデプロイされているか
2. RESEND_API_KEYが正しく設定されているか
3. ブラウザのコンソール（F12）でエラーメッセージを確認

---

**デプロイが完了したら、ブラウザをリロードして再度予約を試してください！**

