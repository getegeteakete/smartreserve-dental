# メール送信のクイックセットアップ

Resend APIキーは既に提供済みです。以下の手順で設定を完了してください。

## ✅ 必要な設定

### ステップ1: SupabaseのSecretsに設定

以下のコマンドを実行してください：

```bash
# 1. Supabase CLIでログイン（まだの場合）
supabase login

# 2. プロジェクトをリンク（まだの場合）
supabase link --project-ref vnwnevhakhgbbxxlmutx

# 3. Resend APIキーを設定（既に提供済みのキーを使用）
supabase secrets set RESEND_API_KEY=re_あなたのResendAPIキー

# 4. Supabase URLを設定
supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co

# 5. Supabase Service Role Keyを設定
# （Supabaseダッシュボード → Settings → API → service_role のキーをコピー）
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey
```

### ステップ2: Edge Functionをデプロイ

```bash
supabase functions deploy send-appointment-email
```

### ステップ3: 送信元メールアドレスの設定（オプション）

管理画面で送信元メールアドレスを確認・変更できます：

1. 管理画面にログイン（`sup@ei-life.co.jp` / `pass`）
2. 「通知設定」→「自動返信メール」タブ
3. 送信元メールアドレスが `t@489.toyoshima-do.com` になっているか確認
4. 必要に応じて変更して保存

## 📧 メール送信元アドレス

現在の設定：
- **送信元メールアドレス**: `t@489.toyoshima-do.com`
- **送信先メールアドレス（管理者向け）**: `t@489.toyoshima-do.com`

## ⚠️ 重要事項

### Xサーバーのメールアドレス（t@489.toyoshima-do.com）を使用する場合

Resendでドメイン認証が必要です：

1. [Resend Dashboard](https://resend.com/domains) で `489.toyoshima-do.com` または `toyoshima-do.com` を認証
2. DNSレコードをXサーバーに追加
3. 認証完了を待つ（通常10分〜24時間）

詳細は `RESEND_DOMAIN_SETUP.md` を参照してください。

### ドメイン認証が完了するまで

ドメイン認証が完了するまで、Resendのデフォルトドメイン（`onboarding@resend.dev` など）から送信されます。

または、ドメイン認証をスキップして、Resendのデフォルトドメインを使用することもできます。

## 🧪 テスト

設定完了後、予約をテストしてメールが正しく送信されるか確認してください。

1. 予約フォームからテスト予約を作成
2. メールが送信されるか確認
3. ブラウザのコンソール（F12）でエラーメッセージを確認

## 🔍 トラブルシューティング

メールが送信されない場合：

1. **SupabaseのSecretsを確認**
   - Edge Functions → Secrets で `RESEND_API_KEY` が設定されているか確認

2. **Edge Functionがデプロイされているか確認**
   - Edge Functions → `send-appointment-email` が存在するか確認

3. **ブラウザのコンソールでエラーを確認**
   - F12キー → Consoleタブでエラーメッセージを確認

詳細は `EMAIL_TROUBLESHOOTING.md` を参照してください。

