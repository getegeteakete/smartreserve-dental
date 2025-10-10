# 春空予約システム 仕様書

## 1. システム概要

### 1.1 システム名
春空予約システム（はるそら よやくシステム）

### 1.2 目的
六本松矯正歯科クリニックとよしまの診療予約を効率的に管理し、患者様のオンライン予約受付から管理者の予約管理まで一元的に処理するシステムです。

### 1.3 主要機能
- オンライン予約受付
- 管理者による予約管理
- メール通知システム
- 予約変更・キャンセル機能
- 患者管理機能
- 診療メニュー管理

## 2. システム構成

### 2.1 技術スタック
- **フロントエンド**: React 18.3.1 + TypeScript + Vite
- **UIライブラリ**: shadcn/ui + Radix UI + Tailwind CSS
- **バックエンド**: Supabase（PostgreSQL + Edge Functions）
- **状態管理**: TanStack Query (React Query)
- **ルーティング**: React Router DOM
- **メール送信**: Resend API
- **日付処理**: date-fns
- **フォーム管理**: React Hook Form + Zod

### 2.2 アーキテクチャ
```
[フロントエンド]
    ↓
[Supabase Client]
    ↓
[Supabase Backend]
    ├── PostgreSQL Database
    ├── Edge Functions
    ├── Row Level Security (RLS)
    └── Real-time Subscriptions
```

## 3. ユーザー役割

### 3.1 一般ユーザー（患者様）
- 診療メニューの閲覧
- オンライン予約申込み
- 予約確認・変更・キャンセル
- プライバシーポリシーの確認

### 3.2 管理者
- **認証情報**: `sup@ei-life.co.jp` / `aA793179aa`
- 予約状況の確認・管理
- 予約の確定・変更・キャンセル
- 患者情報の管理
- 診療メニュー・カテゴリの管理
- スケジュール管理
- 予約データのエクスポート

## 4. 主要機能詳細

### 4.1 予約システム

#### 4.1.1 予約受付フロー
1. **診療メニュー選択**
   - カテゴリ別診療メニューの表示
   - 料金・所要時間の確認

2. **患者情報入力**
   - 氏名、電話番号、メールアドレス、年齢
   - 希望日時（最大3つまで選択可能）
   - 備考欄

3. **予約制限チェック**
   - 同一メールアドレスでの予約数制限
   - 診療内容別予約制限
   - 時間重複チェック
   - スパム防止制限

4. **予約確認メール送信**
   - 患者様への確認メール
   - 管理者への通知メール

#### 4.1.2 予約ステータス
- **pending**: 申込み受付済み（管理者確認待ち）
- **confirmed**: 管理者により確定済み
- **cancelled**: キャンセル済み

#### 4.1.3 診療メニュー
**初診カテゴリ**
- 初診の方【無料相談】（30分・無料）
- 初診有料相談【60分】（60分・3,300円）

**検査カテゴリ**
- 精密検査予約【60分】（60分・33,000円）

**PMTC・クリーニングカテゴリ**
- PMTC（プロフェッショナル・メカニカル・トゥース・クリーニング）（60分・8,000円）

**ホワイトニングカテゴリ**
- ホワイトニング各種メニュー

### 4.2 管理者機能

#### 4.2.1 予約管理
- 予約状況一覧表示
- 予約の確定・変更・キャンセル
- 予約詳細情報の編集
- 新規予約の手動登録

#### 4.2.2 患者管理
- 患者情報一覧
- 患者別予約履歴
- 患者情報の編集・削除

#### 4.2.3 診療メニュー管理
- 診療カテゴリの追加・編集・削除
- 診療メニューの追加・編集・削除
- 料金・所要時間の設定
- 予約制限数の設定

#### 4.2.4 スケジュール管理
- 診療時間の設定（曜日別）
- 特別スケジュールの設定（日付指定）
- 休診日の設定

### 4.3 メール通知システム

#### 4.3.1 予約関連メール
- **予約受付確認メール**: 患者様・管理者両方に送信
- **予約確定メール**: 管理者が予約確定時に送信
- **予約変更メール**: 予約内容変更時に送信
- **キャンセルメール**: 予約キャンセル時に送信

#### 4.3.2 リマインダーメール
- **前日リマインダー**: 予約前日の夜に送信
- **当日朝リマインダー**: 予約当日の朝に送信

#### 4.3.3 メール機能
- Resend APIを使用したHTMLメール送信
- 差出人: `六本松矯正歯科クリニックとよしま <info@489.toyoshima-do.com>`
- 予約変更・キャンセル用のトークンリンク付き

### 4.4 予約変更・キャンセル機能

#### 4.4.1 メールリンク経由
- 予約確認メール内のリンクから直接アクセス
- セキュアトークンによる認証
- 24時間有効期限付きトークン

#### 4.4.2 変更・キャンセル制限
- **pending状態**: 患者様自身で変更・キャンセル可能
- **confirmed状態**: 管理者による変更・キャンセルのみ

## 5. データベース設計

### 5.1 主要テーブル

#### 5.1.1 appointments（予約テーブル）
```sql
- id: UUID (PRIMARY KEY)
- patient_name: TEXT (患者名)
- phone: TEXT (電話番号)
- email: TEXT (メールアドレス)
- age: INTEGER (年齢)
- treatment_name: TEXT (診療内容)
- fee: INTEGER (料金)
- status: TEXT (ステータス: pending/confirmed/cancelled)
- confirmed_date: TEXT (確定日付)
- confirmed_time_slot: TEXT (確定時間帯)
- notes: TEXT (備考)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5.1.2 appointment_preferences（希望日時テーブル）
```sql
- id: UUID (PRIMARY KEY)
- appointment_id: UUID (FOREIGN KEY)
- preferred_date: TEXT (希望日付)
- preferred_time_slot: TEXT (希望時間帯)
- priority: INTEGER (優先順位)
```

#### 5.1.3 treatment_categories（診療カテゴリテーブル）
```sql
- id: UUID (PRIMARY KEY)
- name: TEXT (カテゴリ名)
- description: TEXT (説明)
- image_url: TEXT (画像URL)
- display_order: INTEGER (表示順序)
```

#### 5.1.4 treatments（診療メニューテーブル）
```sql
- id: UUID (PRIMARY KEY)
- name: TEXT (診療名)
- description: TEXT (説明)
- fee: INTEGER (料金)
- duration: INTEGER (所要時間)
- category_id: UUID (FOREIGN KEY)
```

#### 5.1.5 clinic_schedules（診療スケジュールテーブル）
```sql
- id: UUID (PRIMARY KEY)
- year: INTEGER (年)
- month: INTEGER (月)
- day_of_week: INTEGER (曜日: 0-6)
- start_time: TEXT (開始時間)
- end_time: TEXT (終了時間)
- is_available: BOOLEAN (診療可能フラグ)
```

#### 5.1.6 treatment_limits（診療制限テーブル）
```sql
- id: UUID (PRIMARY KEY)
- treatment_name: TEXT (診療名)
- max_reservations_per_slot: INTEGER (スロット当たり最大予約数)
```

#### 5.1.7 appointment_tokens（予約トークンテーブル）
```sql
- id: UUID (PRIMARY KEY)
- email: TEXT (メールアドレス)
- appointment_id: UUID (FOREIGN KEY)
- type: TEXT (cancel/rebook)
- token: TEXT (セキュアトークン)
- expires_at: TIMESTAMP (有効期限)
- used: BOOLEAN (使用済みフラグ)
```

### 5.2 データベース関数

#### 5.2.1 予約制限チェック関数
- `check_reservation_limit(p_email)`: 基本予約制限チェック
- `check_treatment_reservation_limit(p_email, p_treatment_name)`: 診療別制限チェック
- `check_appointment_time_conflict()`: 時間重複チェック

#### 5.2.2 予約管理関数
- `cancel_existing_pending_appointments(p_email)`: pending予約の一括キャンセル
- `check_rebooking_eligibility(p_email)`: 再予約可否チェック
- `cancel_appointment_with_reason()`: 理由付きキャンセル

#### 5.2.3 トークン管理関数
- `generate_appointment_token()`: 予約トークン生成
- `validate_appointment_token()`: トークン検証

## 6. セキュリティ

### 6.1 認証・認可
- 管理者認証: ローカルストレージベースの簡易認証
- Row Level Security (RLS): Supabaseのセキュリティポリシー適用
- 予約トークン: UUIDベースのセキュアトークン

### 6.2 データ保護
- 個人情報の暗号化保存
- CORS設定による適切なアクセス制御
- SQLインジェクション対策（Prepared Statements使用）

### 6.3 スパム対策
- 同一メールアドレスからの連続予約制限
- 予約頻度制限
- トークン有効期限による不正アクセス防止

## 7. ページ構成

### 7.1 一般ユーザー向けページ
- `/` - トップページ
- `/treatments` - 診療メニュー一覧
- `/treatment/:id` - 診療メニュー詳細
- `/course/:courseName` - コース詳細
- `/booking` - 予約フォーム
- `/cancel` - 予約キャンセル
- `/rebook` - 予約変更
- `/privacy-policy` - プライバシーポリシー
- `/calendar-embed` - 外部埋め込み用カレンダー

### 7.2 管理者向けページ
- `/admin-login` - 管理者ログイン
- `/admin` - 管理者ダッシュボード（予約状況）
- `/admin/schedule` - スケジュール管理
- `/admin/treatments` - 診療メニュー管理
- `/admin/patients` - 患者管理

## 8. API仕様（Supabase Edge Functions）

### 8.1 メール関連API
- `send-appointment-email` - 予約確認メール送信
- `send-confirmation-email` - 予約確定メール送信
- `send-cancellation-email` - キャンセルメール送信
- `send-appointment-modification-email` - 予約変更メール送信
- `send-reminder-emails` - リマインダーメール送信

### 8.2 外部連携API
- `google-calendar-auth` - Googleカレンダー認証
- `google-calendar-sync` - Googleカレンダー同期
- `sync-business-schedule` - 営業スケジュール同期

### 8.3 データエクスポートAPI
- `export-appointment-status` - 予約状況データエクスポート

## 9. 運用・保守

### 9.1 バックアップ
- Supabase自動バックアップによるデータ保護
- 定期的なデータエクスポートによる二重バックアップ

### 9.2 モニタリング
- Supabase Analytics による性能監視
- エラーログの自動収集
- メール送信状況の監視

### 9.3 メンテナンス
- 定期的なデータベースクリーンアップ
- 期限切れトークンの自動削除
- 古い予約データのアーカイブ

## 10. 今後の拡張予定

### 10.1 機能拡張
- 患者様向けマイページ機能
- SMS通知機能
- オンライン決済機能
- 待ちリスト機能

### 10.2 システム改善
- パフォーマンス最適化
- モバイルアプリ化
- 多言語対応
- API Rate Limiting強化

---

## 付録

### A. 診療時間
- 平日・土曜: 9:00-18:30
- 土曜: 9:00-17:00
- 定休日: 日曜・祝日

### B. 連絡先
- クリニック名: 六本松矯正歯科クリニックとよしま
- 電話番号: 03-1234-5678
- メールアドレス: info@489.toyoshima-do.com

### C. システム管理者
- 管理者ID: sup@ei-life.co.jp
- 開発・保守: 春空開発チーム
