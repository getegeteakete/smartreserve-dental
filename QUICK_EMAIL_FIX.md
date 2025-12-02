# 🚨 予約メール送信エラー - クイック修正ガイド

## 最も可能性の高い原因と解決方法

### 原因1: Edge Functionが未デプロイ（最も可能性が高い）

#### 解決方法

PowerShellまたはコマンドプロンプトで以下を実行:

```bash
# 1. Supabaseにログイン
npx supabase login

# 2. プロジェクトをリンク
npx supabase link --project-ref vnwnevhakhgbbxxlmutx

# 3. Edge Functionをデプロイ
npx supabase functions deploy send-appointment-email

# 4. RESEND_API_KEYを設定（まだの場合）
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**注意**: `re_xxxxxxxxxxxxx` を実際のResend APIキーに置き換えてください。

---

### 原因2: Resend APIキーが未設定

#### Resend APIキーの取得

1. [Resend Dashboard](https://resend.com/api-keys) にアクセス
2. ログイン
3. 「Create API Key」をクリック
4. 名前を入力（例: SmartReserve）
5. キーをコピー（`re_` で始まる文字列）

#### APIキーの設定

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

### 原因3: Resendドメインが未認証

#### 確認方法

1. [Resend Domains](https://resend.com/domains) にアクセス
2. `489.toyoshima-do.com` のステータスを確認

#### 未認証の場合: DNSレコードを設定

**Xserverサーバーパネルで以下を設定**:

##### 1. DKIM
- 種別: `TXT`
- ホスト名: `resend._domainkey.489`
- 内容: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkX5KKwO7CV+emB7+UNxT175wmJU3HgeC2Mt04RMD3jUo4kb128Io2sLc+JTzQsCZ7cvQrDcYbXm3ZHsO23SjgqR7bxWnY3gALjbZJJqLZupCqhn6tUKWrycEJ7jPqWxPG0sjJuCyfD4gHJTaf51HqHCniD/dHy6ERRLIG6DTzfwIDAQAB`

##### 2. MX
- 種別: `MX`
- ホスト名: `send.489`
- 内容: `feedback-smtp.ap-northeast-1.amazonses.com`
- 優先度: `10`

##### 3. SPF
- 種別: `TXT`
- ホスト名: `send.489`
- 内容: `v=spf1 include:amazonses.com ~all`

**反映時間**: 1〜2時間（最大48時間）

---

## 📋 チェックリスト

実行した項目にチェックを入れてください:

- [ ] Edge Functionをデプロイした
- [ ] RESEND_API_KEYを設定した
- [ ] Resendドメインが認証されている（または DNSレコードを設定した）
- [ ] ブラウザをリロードして再度予約を試した

---

## 🧪 動作確認

### 1. Edge Functionの確認

[Supabaseダッシュボード](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/functions) で:
- `send-appointment-email` が表示されているか確認

### 2. 予約テスト

1. 予約フォームに入力
2. F12キーでコンソールを開く
3. 予約を送信
4. エラーが表示されないか確認

---

## ⚠️ それでも解決しない場合

### エラーログを確認

#### ブラウザのコンソール
1. F12キーを押す
2. 「Console」タブを選択
3. 赤いエラーメッセージを確認

#### Supabase Edge Functionsのログ
1. [Supabaseダッシュボード](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/functions/send-appointment-email/logs)
2. 「Logs」タブでエラーを確認

### よくあるエラーメッセージ

| エラーメッセージ | 原因 | 解決方法 |
|---|---|---|
| "Function not found" | Edge Function未デプロイ | 上記の「原因1」を実行 |
| "RESEND_API_KEY" | APIキー未設定 | 上記の「原因2」を実行 |
| "Domain not verified" | ドメイン未認証 | 上記の「原因3」を実行 |
| "CORS policy" | CORS設定エラー | Edge Functionを再デプロイ |

---

## 🆘 緊急連絡先

問題が解決しない場合は、以下の情報を用意してください:

1. ブラウザのコンソールログ（スクリーンショット）
2. 表示されるエラーメッセージ
3. 実行したコマンドとその結果

---

**更新日**: 2025年1月


