# XサーバーSMTP設定手順

Xサーバーのメールアドレス（t@489.toyoshima-do.com）を使用してメールを送信するための設定手順です。

## 📋 提供された情報

- **メールアドレス**: t@489.toyoshima-do.com
- **パスワード**: aA793179bygh
- **SMTPサーバー**: sv15030.xserver.jp
- **ポート**: 587 (STARTTLS) または 465 (SSL)

## 🎯 推奨方法: Resendを使用

Xサーバーのメールアドレスを送信元として使用するには、**Resendでドメイン認証**を行う方法が最も簡単です。

### ステップ1: Resendでドメイン認証

1. [Resend Dashboard](https://resend.com/domains) にログイン
2. 「Domains」→「Add Domain」をクリック
3. ドメイン名を入力: `489.toyoshima-do.com` または `toyoshima-do.com`
4. Resendが表示するDNSレコードをXサーバーのDNS設定に追加
5. 認証完了を待つ（通常10分〜24時間）

詳細は `RESEND_DOMAIN_SETUP.md` を参照してください。

### ステップ2: Resend APIキーを設定

1. [Resend Dashboard](https://resend.com/api-keys) でAPIキーを作成
2. SupabaseのSecretsに設定：

```bash
supabase secrets set RESEND_API_KEY=re_あなたのAPIキー
supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
```

### ステップ3: Edge Functionをデプロイ

```bash
supabase functions deploy send-appointment-email
```

### ステップ4: 管理画面で送信元アドレスを設定

1. 管理画面にログイン（`sup@ei-life.co.jp` / `pass`）
2. 「通知設定」→「自動返信メール」タブ
3. 「患者様向けメール」タブで「送信元メールアドレス」を `t@489.toyoshima-do.com` に変更
4. 「管理者向けメール」タブで「送信元メールアドレス」を `t@489.toyoshima-do.com` に変更
5. 保存

## ⚠️ 注意事項

- **パスワードの取り扱い**: パスワード（aA793179bygh）は機密情報です。コードに直接書かず、SupabaseのSecretsに保存してください
- **ドメイン認証**: Resendでドメイン認証が完了するまで、メール送信は失敗する可能性があります
- **現在の実装**: 現在のシステムはResendを使用してメールを送信します。XサーバーのSMTPを直接使用するには、追加の実装が必要です

## 🔄 現在の設定

システムのデフォルト送信元メールアドレスは `t@489.toyoshima-do.com` に設定されています。

Resendでドメイン認証を行えば、このメールアドレスからメールを送信できます。

