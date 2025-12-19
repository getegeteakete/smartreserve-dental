# 📦 データ移行マニュアル（手動）

既存のSupabaseプロジェクトから新しいプロジェクトへデータを移行する手順です。

## 🎯 移行するデータ

以下のテーブルのデータを移行します：

1. **appointments** - 予約データ
2. **patients** - 患者データ
3. **treatments** - 診療メニュー
4. **treatment_categories** - カテゴリー
5. **clinic_schedules** - スケジュール設定
6. **system_settings** - システム設定
7. **booking_time_schedules** - 予約時間設定
8. **special_booking_times** - 特別予約時間

---

## 方法1: Supabaseダッシュボードで手動エクスポート・インポート（推奨）

### ステップ1: 旧プロジェクトからデータをエクスポート

#### 1-1. 旧プロジェクトにアクセス

[旧プロジェクト - Table Editor](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/editor)

#### 1-2. 各テーブルのデータをエクスポート

**重要なテーブルから順番に**:

1. **treatment_categories** (カテゴリー - 最初に必要)
   - Table Editor → `treatment_categories` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `treatment_categories.csv` として保存

2. **treatments** (診療メニュー)
   - Table Editor → `treatments` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `treatments.csv` として保存

3. **patients** (患者データ)
   - Table Editor → `patients` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `patients.csv` として保存

4. **appointments** (予約データ)
   - Table Editor → `appointments` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `appointments.csv` として保存

5. **clinic_schedules** (スケジュール設定)
   - Table Editor → `clinic_schedules` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `clinic_schedules.csv` として保存

6. **system_settings** (システム設定)
   - Table Editor → `system_settings` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `system_settings.csv` として保存

7. **booking_time_schedules** (予約時間設定)
   - Table Editor → `booking_time_schedules` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `booking_time_schedules.csv` として保存

8. **special_booking_times** (特別予約時間)
   - Table Editor → `special_booking_times` を選択
   - 右上の「...」メニュー → 「Export to CSV」
   - ファイル名: `special_booking_times.csv` として保存

### ステップ2: 新プロジェクトにスキーマを作成

#### 2-1. 新プロジェクトにアクセス

[新プロジェクト - SQL Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/sql/new)

#### 2-2. スキーマを作成

1. SQL Editor を開く
2. 「New query」をクリック
3. プロジェクトフォルダの `COMPLETE_DATABASE_SETUP.sql` の内容をコピー
4. SQL Editorに貼り付け
5. 「Run」をクリック

または、マイグレーションファイルを順番に実行：
- `supabase/migrations/` フォルダ内の各SQLファイルを作成日時順に実行

### ステップ3: 新プロジェクトにデータをインポート

[新プロジェクト - Table Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/editor)

**重要: 依存関係の順序で実行**

1. **treatment_categories** (最初)
   - Table Editor → `treatment_categories` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `treatment_categories.csv` を選択
   - 「Import」をクリック

2. **treatments**
   - Table Editor → `treatments` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `treatments.csv` を選択
   - 「Import」をクリック

3. **patients**
   - Table Editor → `patients` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `patients.csv` を選択
   - 「Import」をクリック

4. **appointments**
   - Table Editor → `appointments` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `appointments.csv` を選択
   - 「Import」をクリック

5. **clinic_schedules**
   - Table Editor → `clinic_schedules` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `clinic_schedules.csv` を選択
   - 「Import」をクリック

6. **system_settings**
   - Table Editor → `system_settings` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `system_settings.csv` を選択
   - 「Import」をクリック

7. **booking_time_schedules**
   - Table Editor → `booking_time_schedules` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `booking_time_schedules.csv` を選択
   - 「Import」をクリック

8. **special_booking_times**
   - Table Editor → `special_booking_times` を選択
   - 右上の「Insert」→「Import data from CSV」
   - `special_booking_times.csv` を選択
   - 「Import」をクリック

---

## 方法2: SQL Editorで一括エクスポート・インポート

### ステップ1: 旧プロジェクトからSQLエクスポート

旧プロジェクトの SQL Editor で以下を実行：

```sql
-- すべてのデータをJSON形式でエクスポート
COPY (SELECT * FROM treatment_categories) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM treatments) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM patients) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM appointments) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM clinic_schedules) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM system_settings) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM booking_time_schedules) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM special_booking_times) TO STDOUT WITH CSV HEADER;
```

### ステップ2: データを確認

各テーブルにどれくらいのデータがあるか確認：

```sql
SELECT 'appointments' as table_name, COUNT(*) as count FROM appointments
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'treatments', COUNT(*) FROM treatments
UNION ALL
SELECT 'treatment_categories', COUNT(*) FROM treatment_categories
UNION ALL
SELECT 'clinic_schedules', COUNT(*) FROM clinic_schedules
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings;
```

---

## 🤔 データ移行の判断基準

### 移行が必要な場合

- ✅ **本番環境で実際の予約がある**
- ✅ **患者データが登録されている**
- ✅ **カスタマイズした診療メニューがある**
- ✅ **重要な設定変更をしている**

### 移行不要な場合

- ✅ **テストデータのみ**
- ✅ **デフォルト設定のまま**
- ✅ **まだ本番稼働していない**

---

## 📝 推奨の進め方

### オプションA: データ移行する（本番データがある場合）

1. 上記の手順でCSVエクスポート
2. 新プロジェクトにスキーマ作成
3. CSVインポート
4. 動作確認

### オプションB: 新規で始める（テストデータのみの場合）

1. 新プロジェクトにスキーマ作成のみ
2. アプリ起動でデフォルトデータ自動作成
3. 必要な設定を再設定

---

## 🔍 現在の状況確認

**質問**: 旧プロジェクトに以下のデータはありますか？

1. 実際の予約データ（テストではない）
2. 患者の個人情報
3. カスタマイズした診療メニュー
4. 重要なシステム設定

→ **ある場合**: 方法1でデータ移行を実行
→ **ない場合**: スキーマのみ作成して新規スタート

どちらで進めますか？







