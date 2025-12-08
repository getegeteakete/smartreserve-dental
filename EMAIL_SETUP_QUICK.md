# 📧 メール送信設定 - クイックガイド

## 現在の状況

メール送信に失敗している場合、以下のいずれかが原因です：

1. **Edge Functionがデプロイされていない**
2. **RESEND_API_KEYが設定されていない**
3. **ネットワーク接続エラー**

## 🚀 解決方法

### ステップ1: Supabase CLIでログイン

```powershell
npx supabase login
```

### ステップ2: プロジェクトをリンク

```powershell
npx supabase link --project-ref pzdrgwlqznnswztimryc
```

### ステップ3: Edge Functionをデプロイ

```powershell
npx supabase functions deploy send-appointment-email
```

### ステップ4: RESEND_API_KEYを設定

1. [Resend Dashboard](https://resend.com/api-keys) にアクセス
2. APIキーを取得（`re_` で始まる文字列）
3. 以下のコマンドで設定：

```powershell
npx supabase secrets set RESEND_API_KEY=re_あなたのAPIキー
```

### ステップ5: 動作確認

1. ブラウザをリロード
2. 予約を再度試す
3. ブラウザのコンソール（F12）でエラーログを確認

## 🔍 エラーの確認方法

### ブラウザのコンソールで確認

1. F12キーを押して開発者ツールを開く
2. 「Console」タブを選択
3. 予約を送信
4. エラーメッセージを確認

### Supabaseダッシュボードで確認

1. [Supabase Dashboard](https://app.supabase.com/project/pzdrgwlqznnswztimryc) にアクセス
2. 「Edge Functions」→ `send-appointment-email` → 「Logs」タブ
3. エラーログを確認

## 📝 よくあるエラーと対処法

| エラーメッセージ | 原因 | 解決方法 |
|---|---|---|
| `Function not found` | Edge Function未デプロイ | ステップ3を実行 |
| `RESEND_API_KEY` | APIキー未設定 | ステップ4を実行 |
| `CORS policy` | CORS設定エラー | Edge Functionを再デプロイ |
| `Network error` | ネットワークエラー | 接続を確認 |

## ✅ チェックリスト

- [ ] Supabase CLIでログイン済み
- [ ] プロジェクトをリンク済み（`pzdrgwlqznnswztimryc`）
- [ ] Edge Function `send-appointment-email` をデプロイ済み
- [ ] RESEND_API_KEYをSecretsに設定済み
- [ ] ブラウザをリロード済み
- [ ] 予約を再度試した

---

**注意**: メール送信が失敗しても予約は正常に保存されます。メールは後から手動で送信することもできます。

