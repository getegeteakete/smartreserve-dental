# 🌐 ブラウザで手動データ移行ガイド（最も確実）

CLIでのログインが難しい場合、ブラウザで手動移行する方が確実です。

## 📋 移行の全体像

1. ✅ コード更新（完了済み）
2. ⏳ 旧プロジェクトからデータをエクスポート
3. ⏳ 新プロジェクトにスキーマを作成
4. ⏳ 新プロジェクトにデータをインポート
5. ⏳ Edge Functionsをデプロイ

---

## ステップ1: 旧プロジェクトからデータをエクスポート

### 1-1. 旧プロジェクトを開く

[旧プロジェクト - Table Editor](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/editor)

### 1-2. 各テーブルをCSVでエクスポート

**重要な順序で実行してください**:

#### ① treatment_categories（カテゴリー）
1. 左サイドバーで `treatment_categories` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `treatment_categories.csv` として保存

#### ② treatments（診療メニュー）
1. 左サイドバーで `treatments` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `treatments.csv` として保存

#### ③ patients（患者データ）
1. 左サイドバーで `patients` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `patients.csv` として保存

#### ④ appointments（予約データ）
1. 左サイドバーで `appointments` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `appointments.csv` として保存

#### ⑤ clinic_schedules（スケジュール）
1. 左サイドバーで `clinic_schedules` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `clinic_schedules.csv` として保存

#### ⑥ system_settings（システム設定）
1. 左サイドバーで `system_settings` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `system_settings.csv` として保存

#### ⑦ booking_time_schedules（予約時間設定）
1. 左サイドバーで `booking_time_schedules` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `booking_time_schedules.csv` として保存

#### ⑧ special_booking_times（特別予約時間）
1. 左サイドバーで `special_booking_times` をクリック
2. 右上の「...」メニュー → 「Export to CSV」
3. ファイル名: `special_booking_times.csv` として保存

---

## ステップ2: 新プロジェクトにスキーマを作成

### 2-1. 新プロジェクトのSQL Editorを開く

[新プロジェクト - SQL Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/sql/new)

### 2-2. COMPLETE_DATABASE_SETUP.sqlを実行

1. SQL Editorで「New query」をクリック
2. プロジェクトフォルダの `COMPLETE_DATABASE_SETUP.sql` を開く
3. 内容をすべてコピー
4. SQL Editorに貼り付け
5. 「Run」をクリック

**実行結果**: すべてのテーブルが作成されます

---

## ステップ3: 新プロジェクトにデータをインポート

### 3-1. 新プロジェクトのTable Editorを開く

[新プロジェクト - Table Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/editor)

### 3-2. 各テーブルにCSVをインポート

**重要: この順序で実行してください**（依存関係があるため）

#### ① treatment_categories
1. 左サイドバーで `treatment_categories` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `treatment_categories.csv` を選択
4. 「Import」をクリック

#### ② treatments
1. 左サイドバーで `treatments` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `treatments.csv` を選択
4. 「Import」をクリック

#### ③ patients
1. 左サイドバーで `patients` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `patients.csv` を選択
4. 「Import」をクリック

#### ④ appointments
1. 左サイドバーで `appointments` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `appointments.csv` を選択
4. 「Import」をクリック

#### ⑤ clinic_schedules
1. 左サイドバーで `clinic_schedules` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `clinic_schedules.csv` を選択
4. 「Import」をクリック

#### ⑥ system_settings
1. 左サイドバーで `system_settings` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `system_settings.csv` を選択
4. 「Import」をクリック

#### ⑦ booking_time_schedules
1. 左サイドバーで `booking_time_schedules` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `booking_time_schedules.csv` を選択
4. 「Import」をクリック

#### ⑧ special_booking_times
1. 左サイドバーで `special_booking_times` をクリック
2. 右上の「Insert」→「Import data from CSV」
3. `special_booking_times.csv` を選択
4. 「Import」をクリック

---

## ステップ4: Edge Functionsをデプロイ

### 4-1. Supabase CLIでデプロイ

新しいターミナルを開いて実行：

```powershell
# プロジェクトに接続（パスワード入力が必要な場合あり）
npx -y supabase link --project-ref lcexzucpzawxdujmljyo

# Edge Functionsをデプロイ
npx -y supabase functions deploy send-appointment-email
npx -y supabase functions deploy send-confirmation-email
npx -y supabase functions deploy send-cancellation-email
npx -y supabase functions deploy send-reminder-emails
npx -y supabase functions deploy send-appointment-modification-email
npx -y supabase functions deploy send-payment-confirmation-email
```

### 4-2. デプロイの確認

[新プロジェクト - Edge Functions](https://app.supabase.com/project/lcexzucpzawxdujmljyo/functions)

各関数が表示されていることを確認

---

## ステップ5: Secretsを設定

```powershell
# Resend APIキーを設定
npx -y supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## ステップ6: 動作確認

```powershell
npm run dev
```

1. http://localhost:5173 にアクセス
2. 診療メニューが表示されるか確認
3. 予約を試す

---

## 📞 次のステップ

**今すぐ実行**:

1. [旧プロジェクト](https://app.supabase.com/project/vnwnevhakhgbbxxlmutx/editor) を開く
2. 上記の手順でCSVエクスポートを開始

エクスポートが完了したら教えてください！





