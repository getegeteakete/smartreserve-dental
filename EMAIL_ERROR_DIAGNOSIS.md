# 📧 メール送信エラー診断ガイド

## 🔍 エラーの原因を特定する

### ステップ1: ブラウザのコンソールログを確認

1. ブラウザで予約画面を開く
2. F12キーを押して開発者ツールを開く
3. 「Console」タブを選択
4. 予約を試みる
5. 表示されるエラーメッセージを確認

### よくあるエラーメッセージと対処法

#### ❌ エラー1: "Function not found" または "404"

**原因**: Edge Functionがデプロイされていない

**解決方法**:
```bash
# Edge Functionをデプロイ
npx supabase login
npx supabase link --project-ref vnwnevhakhgbbxxlmutx
npx supabase functions deploy send-appointment-email
```

#### ❌ エラー2: "CORS policy" または "preflight request"

**原因**: Edge FunctionのCORS設定が不足

**解決方法**: Edge Functionが正しくデプロイされているか確認

#### ❌ エラー3: "RESEND_API_KEY" または "API key not found"

**原因**: Resend APIキーが設定されていない

**解決方法**:
```bash
# Supabase Secretsに設定
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### ❌ エラー4: "Domain not verified" または "Email sending failed"

**原因**: Resendのドメイン認証が完了していない

**解決方法**: DNSレコードを設定（後述）

---

## 🔧 クイック診断チェックリスト

### ✅ チェック1: Edge Functionのデプロイ確認

1. [Supabaseダッシュボード](https://app.supabase.com/) にアクセス
2. プロジェクト `vnwnevhakhgbbxxlmutx` を選択
3. 左サイドバーの「Edge Functions」をクリック
4. `send-appointment-email` が表示されているか確認

**表示されていない場合**:
```bash
npx supabase functions deploy send-appointment-email
```

### ✅ チェック2: RESEND_API_KEYの設定確認

```bash
# Secretsを確認
npx supabase secrets list
```

**RESEND_API_KEYが表示されない場合**:
```bash
# 設定する
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Resend APIキーの取得方法**:
1. [Resend Dashboard](https://resend.com/api-keys) にアクセス
2. 「Create API Key」をクリック
3. キーをコピー

### ✅ チェック3: Resendドメイン認証の確認

1. [Resend Domains](https://resend.com/domains) にアクセス
2. `489.toyoshima-do.com` が「Verified」になっているか確認

**未認証の場合**: DNSレコードを設定（下記参照）

---

## 🌐 DNSレコード設定（Xserver）

### 必須設定

Resendからメールを送信するには、以下のDNSレコードが必要です。

#### 1. DKIM設定
```
種別: TXT
ホスト名: resend._domainkey.489
内容: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkX5KKwO7CV+emB7+UNxT175wmJU3HgeC2Mt04RMD3jUo4kb128Io2sLc+JTzQsCZ7cvQrDcYbXm3ZHsO23SjgqR7bxWnY3gALjbZJJqLZupCqhn6tUKWrycEJ7jPqWxPG0sjJuCyfD4gHJTaf51HqHCniD/dHy6ERRLIG6DTzfwIDAQAB
優先度: 0
```

#### 2. MX設定
```
種別: MX
ホスト名: send.489
内容: feedback-smtp.ap-northeast-1.amazonses.com
優先度: 10
```

#### 3. SPF設定
```
種別: TXT
ホスト名: send.489
内容: v=spf1 include:amazonses.com ~all
優先度: 0
```

#### 4. DMARC設定（推奨）
```
種別: TXT
ホスト名: _dmarc
内容: v=DMARC1; p=none;
優先度: 0
```

### Xserverでの設定手順

1. Xserverのサーバーパネルにログイン
2. 「DNSレコード設定」をクリック
3. `489.toyoshima-do.com` を選択
4. 「DNSレコード追加」タブを選択
5. 上記の各レコードを1つずつ追加
6. 「確認画面へ進む」→「追加する」

**反映時間**: 数分〜48時間（通常1〜2時間）

---

## 🧪 テスト方法

### 1. Edge Functionの直接テスト

Supabaseダッシュボードで:
1. Edge Functions → `send-appointment-email` を選択
2. 「Invoke」タブを選択
3. テストデータを入力して実行

### 2. 予約フォームでのテスト

1. 予約フォームに入力
2. ブラウザのコンソール（F12）を開く
3. 予約を送信
4. コンソールに表示されるログを確認

---

## 📝 エラーログの見方

### コンソールログの例

```
📧 予約申し込みメール送信開始: {patientEmail: "test@example.com", ...}
❌ メール送信エラー: {message: "Function not found"}
```

### Supabase Edge Functionsのログ確認

1. Supabaseダッシュボード → Edge Functions
2. `send-appointment-email` を選択
3. 「Logs」タブを選択
4. エラーメッセージを確認

---

## 🚨 緊急対応: メール送信を一時的に無効化

メール送信エラーで予約ができない場合、一時的にメール送信をスキップすることができます。

**注意**: この方法は緊急時のみ使用してください。メールは送信されません。

### 方法

`src/hooks/booking/useBookingFormSubmit.ts` の172行目付近:

```typescript
// 一時的にコメントアウト
// await sendAppointmentEmail(formData, selectedTreatment, selectedTreatmentData, fee, preferredDates, appointmentData.id);
console.log("メール送信をスキップ（一時的）");
emailSent = false;
```

---

## 📞 サポート

### 確認すべき項目

1. ✅ Edge Functionがデプロイされているか
2. ✅ RESEND_API_KEYが設定されているか
3. ✅ Resendドメインが認証されているか
4. ✅ DNSレコードが正しく設定されているか
5. ✅ ブラウザのコンソールログにエラーが表示されているか

### 次のステップ

上記をすべて確認しても解決しない場合:

1. ブラウザのコンソールログのスクリーンショット
2. Supabase Edge Functionsのログのスクリーンショット
3. 表示されるエラーメッセージの全文

を用意してください。

---

**更新日**: 2025年1月


