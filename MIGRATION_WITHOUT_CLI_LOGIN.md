# 🔧 CLIログイン不要の移行方法

ターミナルでのログインが難しい場合の代替方法です。

## 方法1: Supabaseダッシュボードで完全移行（最も簡単）

### ステップ1: 旧プロジェクトからSQLエクスポート

#### 1-1. 旧プロジェクトのSQL Editorを開く

[旧プロジェクト - SQL Editor](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/sql/new)

#### 1-2. データエクスポートSQLを実行

以下のSQLを実行して、各テーブルのデータを確認・コピー：

```sql
-- 1. treatment_categories
SELECT * FROM treatment_categories ORDER BY display_order;

-- 2. treatments  
SELECT * FROM treatments ORDER BY created_at;

-- 3. patients
SELECT * FROM patients ORDER BY created_at;

-- 4. appointments
SELECT * FROM appointments ORDER BY created_at;

-- 5. clinic_schedules
SELECT * FROM clinic_schedules ORDER BY day_of_week;

-- 6. system_settings
SELECT * FROM system_settings ORDER BY setting_key;

-- 7. booking_time_schedules
SELECT * FROM booking_time_schedules ORDER BY created_at;

-- 8. special_booking_times
SELECT * FROM special_booking_times ORDER BY date;
```

各クエリの結果を確認し、「Export to CSV」でダウンロード

---

### ステップ2: 新プロジェクトにスキーマを作成

#### 2-1. 新プロジェクトのSQL Editorを開く

[新プロジェクト - SQL Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/sql/new)

#### 2-2. COMPLETE_DATABASE_SETUP.sqlを実行

1. プロジェクトフォルダの `COMPLETE_DATABASE_SETUP.sql` を開く
2. 内容をすべてコピー
3. SQL Editorに貼り付け
4. 「Run」をクリック

**実行結果**: すべてのテーブルが作成されます

---

### ステップ3: 新プロジェクトにデータをインポート

#### 3-1. 新プロジェクトのTable Editorを開く

[新プロジェクト - Table Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/editor)

#### 3-2. CSVファイルをインポート

**この順序で実行**（依存関係があるため）:

1. `treatment_categories` → `treatment_categories.csv` をインポート
2. `treatments` → `treatments.csv` をインポート
3. `patients` → `patients.csv` をインポート
4. `appointments` → `appointments.csv` をインポート
5. `clinic_schedules` → `clinic_schedules.csv` をインポート
6. `system_settings` → `system_settings.csv` をインポート
7. `booking_time_schedules` → `booking_time_schedules.csv` をインポート
8. `special_booking_times` → `special_booking_times.csv` をインポート

**各テーブルのインポート手順**:
1. 左サイドバーでテーブルをクリック
2. 右上の「Insert」→「Import data from CSV」
3. CSVファイルを選択
4. 「Import」をクリック

---

### ステップ4: Edge Functionsをデプロイ

#### 4-1. アクセストークンを取得

[Supabase - Access Tokens](https://app.supabase.com/account/tokens)

1. 「Generate new token」をクリック
2. 名前を入力（例: Migration Token）
3. トークンをコピー（`sbp_` で始まる文字列）

#### 4-2. 環境変数に設定してデプロイ

PowerShellで実行：

```powershell
# アクセストークンを環境変数に設定
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxxxxxxxxxxx"

# プロジェクトをリンク
npx -y supabase link --project-ref lcexzucpzawxdujmljyo

# Edge Functionsをデプロイ
npx -y supabase functions deploy send-appointment-email
npx -y supabase functions deploy send-confirmation-email
npx -y supabase functions deploy send-cancellation-email
npx -y supabase functions deploy send-reminder-emails
npx -y supabase functions deploy send-appointment-modification-email
npx -y supabase functions deploy send-payment-confirmation-email

# Secretsを設定
npx -y supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## 方法2: 最小限の移行（システム設定のみ）

データ量が多い場合、重要な設定のみを移行：

### 移行するデータ

1. **system_settings** - システム設定（必須）
2. **clinic_schedules** - スケジュール設定（必須）
3. **treatment_categories** - カテゴリー（推奨）
4. **treatments** - 診療メニュー（推奨）

### 移行しないデータ

- **appointments** - 予約データ（新規で開始）
- **patients** - 患者データ（新規で開始）

---

## 📋 実行チェックリスト

- [ ] 旧プロジェクトからCSVエクスポート
- [ ] 新プロジェクトにスキーマ作成
- [ ] 新プロジェクトにCSVインポート
- [ ] Edge Functionsデプロイ
- [ ] Secretsの設定
- [ ] 動作確認

---

## 🚀 次のステップ

1. **まず、旧プロジェクトのデータを確認**
   - [旧プロジェクト - Table Editor](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/editor) を開く
   - 各テーブルのデータ量を確認

2. **移行方法を選択**
   - 全データ移行 または 設定のみ移行

どちらで進めますか？







