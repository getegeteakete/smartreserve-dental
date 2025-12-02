# Xサーバーメール設定ガイド

Xサーバーのメールアドレス（t@489.toyoshima-do.com）を送信元として使用する方法です。

## 📋 提供された情報

- **メールアドレス**: t@489.toyoshima-do.com
- **パスワード**: aA793179bygh
- **SMTPサーバー**: sv15030.xserver.jp
- **ポート**: 587 (STARTTLS) または 465 (SSL)

## 🔧 設定方法

### 方法1: Resendを使用（推奨）

Xサーバーのメールアドレスを送信元として使用するには、Resendでドメイン認証が必要です。

#### ステップ1: Resendでドメイン認証

1. [Resend Dashboard](https://resend.com/domains) にログイン
2. 「Domains」→「Add Domain」をクリック
3. ドメイン名を入力: `489.toyoshima-do.com` または `toyoshima-do.com`
4. Resendが表示するDNSレコードをXサーバーのDNS設定に追加
5. 認証完了を待つ（通常10分〜24時間）

詳細は `RESEND_DOMAIN_SETUP.md` を参照してください。

#### ステップ2: 送信元メールアドレスを設定

管理画面で送信元メールアドレスを `t@489.toyoshima-do.com` に設定：

1. 管理画面にログイン（`sup@ei-life.co.jp` / `pass`）
2. 「通知設定」→「自動返信メール」タブ
3. 「患者様向けメール」タブで「送信元メールアドレス」を `t@489.toyoshima-do.com` に変更
4. 「管理者向けメール」タブで「送信元メールアドレス」を `t@489.toyoshima-do.com` に変更
5. 保存

### 方法2: XサーバーのSMTPを直接使用（上級者向け）

XサーバーのSMTPを直接使用する場合は、適切なSMTPライブラリが必要です。

#### 必要な設定

SupabaseのSecretsに以下を設定：

```bash
supabase secrets set SMTP_HOST=sv15030.xserver.jp
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=t@489.toyoshima-do.com
supabase secrets set SMTP_PASSWORD=aA793179bygh
supabase secrets set USE_SMTP=true
```

#### 注意事項

- DenoでSMTPを直接実装するには、適切なライブラリ（例: `deno_smtp`）が必要です
- TLS/SSL接続の処理が複雑なため、実装には追加の作業が必要です
- 現在の実装では、Resendを使用する方法を推奨します

## ⚙️ 現在の実装

現在のシステムは **Resend** を使用してメールを送信します。

### Resendの設定

1. **Resend APIキーを作成**
   - [Resend Dashboard](https://resend.com/api-keys) でAPIキーを作成

2. **SupabaseのSecretsに設定**
   ```bash
   supabase secrets set RESEND_API_KEY=re_あなたのAPIキー
   supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
   ```

3. **Edge Functionをデプロイ**
   ```bash
   supabase functions deploy send-appointment-email
   ```

4. **ドメイン認証（Xサーバーのメールアドレスを使用する場合）**
   - `489.toyoshima-do.com` または `toyoshima-do.com` をResendで認証
   - 詳細は `RESEND_DOMAIN_SETUP.md` を参照

## 🎯 推奨設定

### 送信元メールアドレス

- **患者様向け**: `t@489.toyoshima-do.com`
- **管理者向け**: `t@489.toyoshima-do.com`

### 送信先メールアドレス

- **管理者向けメールの送信先**: `t@489.toyoshima-do.com` または他の管理者メールアドレス

## 📝 設定手順まとめ

1. ✅ Resendアカウントを作成
2. ✅ Resend APIキーを取得
3. ✅ SupabaseのSecretsに `RESEND_API_KEY` を設定
4. ✅ Edge Functionをデプロイ
5. ✅ ドメイン認証（Xサーバーのメールアドレスを使用する場合）
6. ✅ 管理画面で送信元メールアドレスを `t@489.toyoshima-do.com` に設定

## 🔍 トラブルシューティング

### メールが送信されない

1. Resend APIキーが正しく設定されているか確認
2. Edge Functionがデプロイされているか確認
3. ドメイン認証が完了しているか確認（カスタムドメインを使用する場合）

### ドメイン認証が完了しない

1. XサーバーのDNS設定を確認
2. DNSレコードの反映を待つ（通常10分〜24時間）
3. Resendダッシュボードでエラーメッセージを確認

詳細は `EMAIL_TROUBLESHOOTING.md` を参照してください。

