# データベースセットアップガイド

新しいSupabaseプロジェクトでSmartReserve予約システムのデータベースをセットアップする方法を説明します。

## 🚀 クイックセットアップ（5分で完了）

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワードを設定
4. リージョンを選択（日本の場合は「Northeast Asia (Tokyo)」推奨）
5. 「Create new project」をクリック

プロジェクトの作成には1〜2分かかります。

### 2. データベースの初期化

プロジェクトが作成されたら：

1. 左サイドバーの「SQL Editor」をクリック
2. 「New query」をクリック
3. `COMPLETE_DATABASE_SETUP.sql` ファイルの内容をすべてコピー
4. エディタに貼り付け
5. 右下の「Run」ボタンをクリック

✅ **完了！** すべてのテーブルと関数が作成されました。

### 3. 接続情報の取得

1. 左サイドバーの「Project Settings」をクリック
2. 「API」セクションを選択
3. 以下の情報をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` で始まる長いキー

### 4. アプリケーションの設定

プロジェクトルートの `.env.local` ファイルを開いて、接続情報を更新：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. 動作確認

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスして、予約システムが動作することを確認！

## 📋 作成されるもの

### テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| `patients` | 患者情報 |
| `appointments` | 予約情報 |
| `appointment_preferences` | 予約希望日時 |
| `appointment_tokens` | 予約変更・キャンセル用トークン |
| `treatments` | 治療メニュー |
| `treatment_categories` | 治療カテゴリー |
| `treatment_limits` | 治療別予約制限 |
| `clinic_schedules` | クリニックスケジュール（曜日ベース） |
| `special_clinic_schedules` | 特別スケジュール（日付指定） |
| `reservation_limits` | 予約制限管理 |
| `profiles` | ユーザープロフィール |
| `payments` | 決済情報 |
| `reminder_settings` | リマインダー設定 |
| `sent_reminders` | リマインダー送信履歴 |
| `sms_logs` | SMS送信履歴 |

### 主要な関数

- `check_reservation_limit()` - 予約制限チェック
- `check_treatment_reservation_limit()` - 治療別予約制限チェック
- `check_appointment_time_conflict()` - 予約時間の重複チェック
- `cancel_appointment_with_reason()` - 予約キャンセル
- `generate_appointment_token()` - 予約トークン生成
- `validate_appointment_token()` - 予約トークン検証
- その他多数...

## 🔧 オプション設定

### デフォルトデータの投入

#### 治療カテゴリーの追加例

```sql
INSERT INTO treatment_categories (name, description, display_order) VALUES
('一般歯科', '虫歯治療、抜歯など一般的な歯科治療', 1),
('矯正歯科', '歯並びの矯正治療', 2),
('審美歯科', 'ホワイトニング、セラミック治療', 3),
('予防歯科', '定期検診、クリーニング', 4);
```

#### 治療メニューの追加例

```sql
INSERT INTO treatments (name, description, duration, fee, category_id) VALUES
('虫歯治療', '一般的な虫歯の治療', 30, 3000, (SELECT id FROM treatment_categories WHERE name = '一般歯科')),
('定期検診', '定期的な歯のチェックアップ', 30, 2000, (SELECT id FROM treatment_categories WHERE name = '予防歯科')),
('ホワイトニング', '歯を白くする治療', 60, 15000, (SELECT id FROM treatment_categories WHERE name = '審美歯科'));
```

#### 営業時間の設定例

```sql
-- 2025年1月の月曜日〜金曜日（9:00-18:00で営業）
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES
(2025, 1, 1, '09:00', '18:00', true),  -- 月曜日
(2025, 1, 2, '09:00', '18:00', true),  -- 火曜日
(2025, 1, 3, '09:00', '18:00', true),  -- 水曜日
(2025, 1, 4, '09:00', '18:00', true),  -- 木曜日
(2025, 1, 5, '09:00', '18:00', true);  -- 金曜日

-- 土日は休診
INSERT INTO clinic_schedules (year, month, day_of_week, start_time, end_time, is_available)
VALUES
(2025, 1, 0, '09:00', '18:00', false),  -- 日曜日
(2025, 1, 6, '09:00', '18:00', false);  -- 土曜日
```

#### 特別スケジュール（祝日・休診日）の設定例

```sql
-- 2025年1月1日は休診
INSERT INTO special_clinic_schedules (specific_date, start_time, end_time, is_available)
VALUES ('2025-01-01', '00:00', '00:00', false);
```

## 🔒 セキュリティ設定

### Row Level Security (RLS)

すべてのテーブルでRLSが有効化されています。現在は開発用に全アクセスを許可していますが、本番環境では適切なポリシーに変更してください。

### 本番環境用ポリシーの例

```sql
-- 患者情報は管理者のみアクセス可能
DROP POLICY IF EXISTS "Allow all access for now" ON public.patients;

CREATE POLICY "Service role only" ON public.patients
  FOR ALL
  USING (auth.role() = 'service_role');
```

## 📊 データの確認

### テーブル一覧の確認

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 関数一覧の確認

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

## 🔄 マイグレーション管理

### Supabase CLIを使用する場合

既存のマイグレーションファイルを使用することもできます：

```bash
# Supabase CLIのインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# マイグレーションを実行
supabase db push
```

マイグレーションファイルは `supabase/migrations/` ディレクトリにあります。

## 🚨 トラブルシューティング

### エラー: "relation already exists"

既にテーブルが存在する場合のエラーです。問題ありません。`CREATE TABLE IF NOT EXISTS` を使用しているため、既存のテーブルは上書きされません。

### エラー: "function already exists"

既に関数が存在する場合のエラーです。`CREATE OR REPLACE FUNCTION` を使用しているため、関数は更新されます。

### すべてをリセットして再実行したい

**⚠️ 警告: すべてのデータが削除されます**

```sql
-- すべてのテーブルを削除
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- その後、COMPLETE_DATABASE_SETUP.sqlを再実行
```

## 🔗 関連ドキュメント

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 完全なセットアップガイド
- [LOCAL_SETUP.md](./LOCAL_SETUP.md) - ローカル開発環境のセットアップ
- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - 環境変数の設定
- [FEATURE_OVERVIEW.md](./FEATURE_OVERVIEW.md) - 機能の詳細説明

## 💡 次のステップ

データベースのセットアップが完了したら：

1. ✅ Edge Functionsをデプロイ（決済、SMS機能を使う場合）
2. ✅ 環境変数を設定
3. ✅ アプリケーションを起動
4. ✅ 管理画面で初期データを登録

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

---

**SmartReserve予約システム** - ©合同会社UMA

簡単5分でデータベースのセットアップが完了します！


