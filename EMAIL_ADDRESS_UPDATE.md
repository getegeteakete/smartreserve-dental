# メールアドレス統一設定完了

## 📧 変更内容

すべてのメール送信機能のアドレスを `t@489.toyoshima-do.com` に統一しました。

### 変更したファイル

1. **supabase/functions/send-confirmation-email/index.ts**
   - 患者様への確定メール: `t@489.toyoshima-do.com`
   - 管理者への通知メール: `t@489.toyoshima-do.com`

2. **supabase/functions/send-cancellation-email/index.ts**
   - 患者様へのキャンセル確認メール: `t@489.toyoshima-do.com`
   - 管理者へのキャンセル通知メール: `t@489.toyoshima-do.com`

3. **supabase/functions/send-reminder-emails/index.ts**
   - リマインダーメール: `t@489.toyoshima-do.com`

4. **supabase/functions/send-appointment-modification-email/index.ts**
   - 患者様への修正確認メール: `t@489.toyoshima-do.com`
   - 管理者への修正通知メール: `t@489.toyoshima-do.com`

5. **supabase/functions/send-appointment-email/emailService.ts**
   - デフォルトメールアドレス: `t@489.toyoshima-do.com`

## 🔧 メールサーバー設定情報

### 受信設定
- **受信サーバー (IMAP/POP)**: `sv15030.xserver.jp`
- **メールアドレス**: `t@489.toyoshima-do.com`

### 送信設定
- **送信サーバー (SMTP)**: `sv15030.xserver.jp`
- **メールアドレス**: `t@489.toyoshima-do.com`
- **パスワード**: `aA793179bygh`

## ✅ Vercel環境変数設定

Vercelには既に設定済みとのことですが、以下の環境変数が正しく設定されているか確認してください：

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## 📝 次のステップ

### 1. Edge Functionsの再デプロイ

変更を反映するため、以下のコマンドでEdge Functionsを再デプロイしてください：

```bash
# すべてのメール関連関数を再デプロイ
npx supabase functions deploy send-confirmation-email
npx supabase functions deploy send-cancellation-email
npx supabase functions deploy send-reminder-emails
npx supabase functions deploy send-appointment-modification-email
npx supabase functions deploy send-appointment-email
```

### 2. Resendドメイン設定の確認

Resendダッシュボードで、`t@489.toyoshima-do.com` のドメイン (`489.toyoshima-do.com`) が認証されているか確認してください。

#### 確認手順：
1. [Resend Dashboard](https://resend.com/domains) にアクセス
2. `489.toyoshima-do.com` ドメインが「Verified」になっているか確認
3. 未認証の場合は、DNSレコードを設定してください

### 3. テスト送信

デプロイ後、以下の機能でメール送信をテストしてください：

- [ ] 新規予約受付メール
- [ ] 予約確定メール
- [ ] 予約キャンセルメール
- [ ] 予約修正メール
- [ ] リマインダーメール

## 🔍 トラブルシューティング

### メールが届かない場合

1. **Resendのログを確認**
   - Resendダッシュボードで送信ログを確認
   - エラーメッセージを確認

2. **ドメイン認証を確認**
   - `489.toyoshima-do.com` が正しく認証されているか確認
   - DNSレコードが正しく設定されているか確認

3. **Supabase Secretsを確認**
   ```bash
   npx supabase secrets list
   ```
   - `RESEND_API_KEY` が正しく設定されているか確認

4. **Edge Functionsのログを確認**
   - Supabaseダッシュボード → Edge Functions → Logs
   - エラーメッセージを確認

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Resendダッシュボードの送信ログ
2. Supabase Edge Functionsのログ
3. ブラウザのコンソールログ（F12キー）

---

**更新日**: 2025年1月
**担当**: AI Assistant


