# 💳 KOMOJU決済システム セットアップガイド

## 📋 概要

このガイドでは、SmartReserve予約システムにKOMOJU決済を統合する手順を説明します。

KOMOJUは日本市場向けの決済プラットフォームで、以下の決済方法に対応しています：
- 💳 クレジットカード（VISA / Mastercard / JCB / AMEX）
- 🏪 コンビニ決済（セブン-イレブン / ローソン / ファミマ 他）
- 🏦 銀行振込（Pay-easy）

## 🚀 セットアップ手順

### 1. KOMOJUアカウントの作成

1. [KOMOJU公式サイト](https://komoju.com/)にアクセス
2. 「今すぐ始める」をクリックして新規アカウントを作成
3. 必要な情報を入力してアカウントを登録
4. メールアドレスの確認

### 2. APIキーの取得

1. KOMOJUダッシュボードにログイン
2. 左メニューから「設定」→「API設定」を選択
3. 以下のキーを取得：
   - **公開可能キー（Publishable Key）**: `pk_test_xxxxx` または `pk_live_xxxxx`
   - **シークレットキー（Secret Key）**: `sk_test_xxxxx` または `sk_live_xxxxx`

⚠️ **重要**: テスト環境では `pk_test_` と `sk_test_` を、本番環境では `pk_live_` と `sk_live_` を使用してください。

### 3. 環境変数の設定

#### 3-1. フロントエンド環境変数

プロジェクトルートに `.env` ファイルを作成（または既存のファイルに追加）：

```env
# KOMOJU公開可能キー
VITE_KOMOJU_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### 3-2. Supabase Edge Function環境変数

Supabaseダッシュボードで環境変数を設定：

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから「Edge Functions」を選択
4. 「Settings」タブをクリック
5. 以下の環境変数を追加：

```
KOMOJU_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. データベースマイグレーションの実行

決済セッションテーブルを作成するために、マイグレーションを実行：

```bash
# Supabase CLIがインストールされている場合
supabase db push

# または、SQLを直接実行
# supabase/migrations/20240112000000_add_payment_tables.sql の内容を
# SupabaseダッシュボードのSQL Editorで実行
```

### 5. Edge Functionのデプロイ

#### 5-1. create-komoju-session関数のデプロイ

```bash
supabase functions deploy create-komoju-session
```

#### 5-2. komoju-webhook関数のデプロイ

```bash
supabase functions deploy komoju-webhook
```

### 6. Webhookの設定

KOMOJUダッシュボードでWebhookを設定：

1. KOMOJUダッシュボードにログイン
2. 「設定」→「Webhook」を選択
3. 「新しいWebhookを追加」をクリック
4. Webhook URLを入力：
   ```
   https://your-project-ref.supabase.co/functions/v1/komoju-webhook
   ```
5. 以下のイベントを選択：
   - ✅ `payment.captured` - 決済完了
   - ✅ `payment.authorized` - 決済認証完了
   - ✅ `payment.failed` - 決済失敗
   - ✅ `payment.cancelled` - 決済キャンセル
   - ✅ `payment.refunded` - 返金完了
6. 「保存」をクリック

### 7. アプリケーションでの利用

#### 7-1. 予約ページでKOMOJU決済を使用

`src/pages/Booking.tsx` または予約完了後のページで、以下のようにコンポーネントをインポート：

```typescript
import { KomojuPaymentForm } from '@/components/payment/KomojuPaymentForm';

// 使用例
<KomojuPaymentForm
  amount={5000} // 金額（円）
  appointmentId={appointmentId}
  patientName="山田太郎"
  email="yamada@example.com"
  treatmentName="虫歯治療"
  onSuccess={() => {
    // 決済成功時の処理
    navigate('/payment-success');
  }}
  onCancel={() => {
    // キャンセル時の処理
    navigate('/booking');
  }}
/>
```

## 🔧 テスト方法

### テストカード情報

KOMOJUのテスト環境では、以下のテストカードを使用できます：

#### 成功するカード
- **カード番号**: `4111111111111111`
- **有効期限**: 未来の任意の日付（例: 12/25）
- **CVV**: 任意の3桁（例: 123）
- **名義**: 任意の名前

#### 失敗するカード
- **カード番号**: `4000000000000002`
- その他の情報は成功時と同じ

### コンビニ決済のテスト

1. 決済方法で「コンビニ決済」を選択
2. コンビニを選択
3. お支払い番号が表示される
4. テスト環境では実際の支払いは不要
5. KOMOJUダッシュボードから手動で決済を完了させる

## 📊 決済フロー

```
1. ユーザーが予約を作成
   ↓
2. KomojuPaymentFormで決済方法を選択
   ↓
3. create-komoju-session関数がセッションを作成
   ↓
4. KOMOJUウィジェットで決済情報を入力
   ↓
5. 決済処理
   ↓
6. komoju-webhook関数が決済結果を受信
   ↓
7. データベースを更新（予約ステータス、決済ステータス）
   ↓
8. 確認メールを送信
   ↓
9. 決済完了ページへリダイレクト
```

## 🔒 セキュリティ

- ✅ APIキーは環境変数で管理（コミットしない）
- ✅ シークレットキーはサーバーサイドのみで使用
- ✅ Webhook署名の検証（推奨）
- ✅ SSL/TLS暗号化通信
- ✅ RLSポリシーでデータベースアクセスを制限

## 📝 決済ステータス

### payment_sessions.status
- `pending`: 決済待ち
- `completed`: 決済完了
- `failed`: 決済失敗
- `cancelled`: キャンセル
- `refunded`: 返金済み

### appointments.payment_status
- `pending`: 支払い待ち
- `paid`: 支払い済み
- `failed`: 支払い失敗
- `cancelled`: キャンセル
- `refunded`: 返金済み

## 🛠️ トラブルシューティング

### 決済ウィジェットが表示されない

1. ブラウザのコンソールでエラーを確認
2. `VITE_KOMOJU_PUBLISHABLE_KEY` が正しく設定されているか確認
3. KOMOJUスクリプトが正しく読み込まれているか確認

### Webhookが動作しない

1. Webhook URLが正しいか確認
2. KOMOJUダッシュボードでWebhookのログを確認
3. Edge Functionのログを確認：
   ```bash
   supabase functions logs komoju-webhook
   ```

### 決済は成功したが予約が確定されない

1. `komoju-webhook` 関数のログを確認
2. `payment_sessions` テーブルのデータを確認
3. `appointments` テーブルの `payment_status` を確認

## 💰 料金

KOMOJUの料金体系：
- クレジットカード: 3.6% + ¥40
- コンビニ決済: 3.6% + ¥175
- 銀行振込: 3.6% + ¥175

詳細は[KOMOJU料金ページ](https://komoju.com/pricing)を参照してください。

## 📚 参考資料

- [KOMOJU公式ドキュメント](https://docs.komoju.com/)
- [KOMOJU API リファレンス](https://docs.komoju.com/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🆘 サポート

問題が発生した場合：
1. このガイドのトラブルシューティングセクションを確認
2. [KOMOJUサポート](https://komoju.com/support)に問い合わせ
3. 開発チームに連絡

---

**最終更新日**: 2024年1月
**バージョン**: 1.0.0

