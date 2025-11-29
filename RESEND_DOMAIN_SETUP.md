# Resendでカスタムドメイン（toyoshima-do.com）を設定する手順

Xサーバーのメールアドレス（yoyaku@toyoshima-do.com）を送信元として使用するには、Resendでドメイン認証を行う必要があります。

## 📋 前提条件

- Resendアカウントを作成済み
- Resend APIキーを取得済み
- Xサーバーでドメイン（toyoshima-do.com）を管理している

## 🔧 ドメイン認証の手順

### ステップ1: Resendでドメインを追加

1. [Resend Dashboard](https://resend.com/domains) にログイン
2. 左サイドバーの「**Domains**」をクリック
3. 「**Add Domain**」ボタンをクリック
4. ドメイン名を入力: `toyoshima-do.com`
5. 「**Add Domain**」をクリック

### ステップ2: DNSレコードを設定（Xサーバーで設定）

Resendが表示するDNSレコードを、XサーバーのDNS設定に追加する必要があります。

#### Xサーバーのサーバーパネルでの設定手順

1. **Xサーバーのサーバーパネルにログイン**
   - [https://www.xserver.ne.jp/login_server.php](https://www.xserver.ne.jp/login_server.php)

2. **ドメイン設定を開く**
   - 「ドメイン設定」→「DNSレコード設定」を選択
   - ドメイン `toyoshima-do.com` を選択

3. **Resendが要求するDNSレコードを追加**

   Resendダッシュボードに表示される以下のようなレコードを追加：

   #### SPFレコード（TXT）
   ```
   名前: @
   値: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   ```

   #### DKIMレコード（TXT）
   ```
   名前: resend._domainkey
   値: （Resendが表示する長い文字列）
   TTL: 3600
   ```

   #### DMARCレコード（TXT）（オプション）
   ```
   名前: _dmarc
   値: v=DMARC1; p=none; rua=mailto:dmarc@toyoshima-do.com
   TTL: 3600
   ```

4. **DNSレコードの反映を待つ**
   - DNSレコードの反映には通常10分〜24時間かかります
   - 反映状況はResendダッシュボードで確認できます

### ステップ3: ドメイン認証の確認

1. Resendダッシュボードの「Domains」ページに戻る
2. ドメイン `toyoshima-do.com` のステータスを確認
3. すべてのレコードが「Verified」になれば認証完了

### ステップ4: メールアドレスの確認（オプション）

送信元メールアドレスを確認する場合：

1. Resendダッシュボードで「**Emails**」→「**Verify Email**」を選択
2. `yoyaku@toyoshima-do.com` を入力して確認メールを送信
3. メールボックスで確認メールを受信してリンクをクリック

## ⚙️ システム設定での送信元アドレス変更

ドメイン認証が完了したら、管理画面で送信元メールアドレスを変更します：

1. **管理画面にログイン**
   - `/admin-login` にアクセス
   - ユーザー名: `sup@ei-life.co.jp`
   - パスワード: `pass`

2. **通知設定を開く**
   - 左サイドバーの「通知設定」をクリック
   - 「自動返信メール」タブを選択

3. **患者様向けメール設定を変更**
   - 「患者様向けメール」タブを選択
   - 「送信元メールアドレス」を `yoyaku@toyoshima-do.com` に変更
   - 「送信元名」を適切な名前に変更（例: `六本松矯正歯科クリニックとよしま`）
   - 「患者様向けメール設定を保存」をクリック

4. **管理者向けメール設定を変更**
   - 「管理者向けメール」タブを選択
   - 「送信元メールアドレス」を `yoyaku@toyoshima-do.com` に変更
   - 「送信先メールアドレス」を `yoyaku@toyoshima-do.com` に変更（または他の管理者メールアドレス）
   - 「管理者向けメール設定を保存」をクリック

## 🧪 テスト送信

設定が完了したら、テスト予約を作成してメールが正しく送信されるか確認してください。

## ⚠️ 注意事項

1. **DNSレコードの反映時間**
   - DNSレコードの反映には時間がかかります（通常10分〜24時間）
   - 反映が完了するまで、メール送信は失敗する可能性があります

2. **既存のメール設定との競合**
   - Xサーバーで既にメールサーバーを使用している場合、SPFレコードの設定に注意が必要です
   - 既存のSPFレコードがある場合は、`include:_spf.resend.com` を追加する形で修正してください

3. **メール送信量の制限**
   - Resendの無料プランでは、1日あたり3,000通まで送信可能
   - それ以上が必要な場合は有料プランへのアップグレードが必要です

## 🔍 トラブルシューティング

### DNSレコードが反映されない

1. XサーバーのDNS設定を再確認
2. DNSレコードの反映状況を確認: [https://mxtoolbox.com/](https://mxtoolbox.com/)
3. Resendダッシュボードでエラーメッセージを確認

### メールが送信されない

1. Resendダッシュボードの「Logs」でエラーを確認
2. ドメイン認証が完了しているか確認
3. 送信元メールアドレスが正しく設定されているか確認

### SPFレコードの競合

既存のSPFレコードがある場合、以下のように修正：

```
既存: v=spf1 ip4:xxx.xxx.xxx.xxx ~all
修正後: v=spf1 ip4:xxx.xxx.xxx.xxx include:_spf.resend.com ~all
```

## 📞 サポート

問題が解決しない場合は：
- Resendサポート: [https://resend.com/support](https://resend.com/support)
- Xサーバーサポート: [https://www.xserver.ne.jp/support/](https://www.xserver.ne.jp/support/)

