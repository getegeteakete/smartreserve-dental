# ⚙️ システム設定機能 ガイド

## 📋 概要

SmartReserve予約システムでは、管理画面から各種機能のオン/オフを簡単に切り替えることができます。

## 🎯 設定可能な機能

### 1. 💳 決済機能（KOMOJU）
- **決済機能の有効/無効**
- **利用可能な決済方法**
  - クレジットカード決済
  - コンビニ決済
  - 銀行振込（Pay-easy）

### 2. 💬 AIチャット機能
- **チャット機能の有効/無効**
- **自動応答の有効/無効**
- **営業時間のみ有効にするか**
- **スタッフ接続機能の有効/無効**

### 3. 📱 SMS通知機能
- **SMS通知の有効/無効**
- **リマインダー送信タイミング**
  - 24時間前
  - 2時間前
  - 30分前

### 4. 📧 メール通知機能
- **メール通知の有効/無効**
- **確認メール**
- **リマインダーメール**
- **キャンセル通知メール**

### 5. 📅 予約システム設定
- **予約承認の必須/任意**
- **リピーター自動承認**
- **キャンセルポリシー**
  - キャンセル可否
  - 何時間前まで可能か
  - 返金対応の有無

### 6. 🏢 一般設定
- **医院名**
- **連絡先情報**
- **営業時間**

## 🚀 アクセス方法

1. 管理者としてログイン
2. 管理画面のトップページから「システム設定」ボタンをクリック
3. タブで機能カテゴリーを選択
4. スイッチで各機能をオン/オフ

## 💡 各機能の詳細

### 決済機能

#### 有効にする前の準備
1. KOMOJUアカウントの作成
2. APIキーの取得と設定
3. Webhookの設定
4. データベースマイグレーション

詳細は `KOMOJU_SETUP_GUIDE.md` を参照してください。

#### 決済機能を無効にすると
- 予約フローで決済ステップがスキップされます
- 予約は即座に確定（または承認待ち）になります

### チャット機能

#### 有効にすると
- トップページの右下にチャットボタンが表示されます
- ユーザーはAIアシスタント「さくら」と会話できます
- 自然言語で予約を作成できます

#### 無効にすると
- チャットボタンが非表示になります
- ユーザーは通常の予約フォームのみ使用可能です

#### 設定項目
- **自動応答**: AIによる自動応答を有効にするか
- **営業時間のみ有効**: 営業時間外はチャットを無効にするか
- **スタッフ接続**: スタッフとの直接チャット機能を有効にするか

### SMS通知機能

#### 有効にする前の準備
1. SMSプロバイダー（Twilio等）のアカウント作成
2. APIキーの設定
3. 送信元電話番号の取得

#### SMS通知を無効にすると
- SMSリマインダーが送信されなくなります
- メール通知のみが送信されます

#### 料金について
SMS送信には別途料金が発生します。プロバイダーの料金体系を確認してください。

### メール通知機能

#### 有効/無効の切り替え
- **確認メール**: 予約受付時の確認メール
- **リマインダーメール**: 予約前日・当日のリマインダー
- **キャンセル通知**: キャンセル時の通知メール

## 🔒 セキュリティ

### アクセス制限
- システム設定の変更は管理者のみ可能
- データベースレベルでRLSポリシーが適用されています

### 設定の保存
- 全ての設定はリアルタイムでデータベースに保存されます
- 変更履歴は `updated_at` カラムで管理されます

## 📊 データベース構造

### system_settings テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| setting_key | TEXT | 設定のキー（一意） |
| setting_value | JSONB | 設定値（JSON形式） |
| description | TEXT | 設定の説明 |
| category | TEXT | カテゴリ（payment/chat/notification/booking/general） |
| is_enabled | BOOLEAN | 有効/無効フラグ |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

## 🛠️ 開発者向け情報

### 設定値の取得方法

```typescript
import { useSystemSettings } from '@/hooks/useSystemSettings';

// コンポーネント内で使用
const { isFeatureEnabled, getSettingValue } = useSystemSettings();

// 機能が有効かチェック
if (isFeatureEnabled('payment_enabled')) {
  // 決済機能を表示
}

// 設定値を取得
const paymentConfig = getSettingValue('payment_enabled', {});
```

### 専用hooks

```typescript
// 決済設定
import { usePaymentSettings } from '@/hooks/useSystemSettings';
const { isPaymentEnabled, paymentConfig } = usePaymentSettings();

// チャット設定
import { useChatSettings } from '@/hooks/useSystemSettings';
const { isChatEnabled, chatConfig } = useChatSettings();

// SMS設定
import { useSMSSettings } from '@/hooks/useSystemSettings';
const { isSMSEnabled, smsConfig } = useSMSSettings();
```

### 新しい設定の追加方法

1. データベースに設定を追加：
```sql
INSERT INTO system_settings (setting_key, setting_value, description, category, is_enabled)
VALUES (
  'new_feature_enabled',
  '{"enabled": true, "option1": "value1"}'::jsonb,
  '新機能の説明',
  'general',
  true
);
```

2. コンポーネントで使用：
```typescript
const { isFeatureEnabled } = useSystemSettings();
if (isFeatureEnabled('new_feature_enabled')) {
  // 新機能を表示
}
```

## 🎨 UI/UX

### 設定画面の構成
- **タブナビゲーション**: カテゴリ別に整理
- **スイッチコントロール**: 直感的なオン/オフ切り替え
- **階層構造**: 親設定と子設定の関係を視覚化
- **説明テキスト**: 各設定の役割を明確に表示

### レスポンシブデザイン
- PC、タブレット、スマートフォンに対応
- モバイルでは2カラムのタブレイアウト

## 📝 ベストプラクティス

### 設定変更時の注意
1. **段階的な有効化**: まずテスト環境で確認
2. **ユーザーへの通知**: 機能変更時は事前に告知
3. **バックアップ**: 重要な変更前にデータベースをバックアップ

### トラブルシューティング
- 設定が反映されない → ブラウザのキャッシュをクリア
- データベースエラー → マイグレーションが実行されているか確認
- 機能が表示されない → RLSポリシーを確認

## 🔄 今後の拡張予定

- 設定変更履歴の表示
- ロールバック機能
- 設定のエクスポート/インポート
- A/Bテスト機能
- 機能利用状況の分析

---

**最終更新日**: 2024年1月  
**バージョン**: 1.0.0

