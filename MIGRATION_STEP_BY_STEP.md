# 🔄 Supabase移行 - ステップバイステップガイド

## 📍 現在の状況

- ✅ コード内のSupabase設定を更新済み
- ⏳ Supabaseログイン待ち
- ⏳ データ移行待ち

---

## 🚀 今すぐ実行する手順

### ステップ1: Supabaseにログイン

#### 1-1. ターミナルでEnterキーを押す

Cursorの下部にあるターミナルで **「Enter」キーを押してください**。

#### 1-2. ブラウザで認証

1. ブラウザが自動的に開きます
2. Supabaseの認証ページが表示されます
3. **「Authorize」ボタン**をクリック
4. 「Success!」と表示されたらブラウザを閉じる

---

### ステップ2: 旧プロジェクトからデータをエクスポート

ターミナルで以下を実行：

```powershell
# 旧プロジェクトに接続
npx -y supabase link --project-ref vnwnevhakhgbbxxlmutx

# データをエクスポート
npx -y supabase db dump -f backup-data.sql --data-only
```

**実行結果**: `backup-data.sql` ファイルが作成されます

---

### ステップ3: 新プロジェクトにスキーマを作成

```powershell
# 新プロジェクトに接続
npx -y supabase link --project-ref lcexzucpzawxdujmljyo

# マイグレーションを実行
npx -y supabase db push
```

**実行結果**: 新プロジェクトにテーブルが作成されます

---

### ステップ4: データをインポート

#### 方法A: SQL Editorで手動インポート（推奨）

1. [新プロジェクト - SQL Editor](https://app.supabase.com/project/lcexzucpzawxdujmljyo/sql/new) を開く
2. `backup-data.sql` ファイルの内容をコピー
3. SQL Editorに貼り付け
4. 「Run」をクリック

#### 方法B: CLIでインポート（エラーが出る可能性あり）

```powershell
# データベースパスワードが必要
# 新プロジェクト作成時に設定したパスワードを使用
psql "postgresql://postgres:[パスワード]@db.lcexzucpzawxdujmljyo.supabase.co:5432/postgres" -f backup-data.sql
```

---

### ステップ5: Edge Functionsをデプロイ

```powershell
# メール関連関数をデプロイ
npx -y supabase functions deploy send-appointment-email
npx -y supabase functions deploy send-confirmation-email
npx -y supabase functions deploy send-cancellation-email
npx -y supabase functions deploy send-reminder-emails
npx -y supabase functions deploy send-appointment-modification-email
npx -y supabase functions deploy send-payment-confirmation-email
```

---

### ステップ6: Secretsを設定

```powershell
# Resend APIキーを設定
npx -y supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**注意**: `re_xxxxxxxxxxxxx` を実際のResend APIキーに置き換えてください

---

### ステップ7: 動作確認

```powershell
# ローカルで起動
npm run dev
```

1. http://localhost:5173 にアクセス
2. 診療メニューが表示されるか確認
3. 予約を試す
4. メールが送信されるか確認

---

## 📋 実行チェックリスト

- [ ] ステップ1: Supabaseログイン完了
- [ ] ステップ2: データエクスポート完了
- [ ] ステップ3: スキーマ作成完了
- [ ] ステップ4: データインポート完了
- [ ] ステップ5: Edge Functionsデプロイ完了
- [ ] ステップ6: Secrets設定完了
- [ ] ステップ7: 動作確認完了

---

## 🆘 トラブルシューティング

### ログインできない

```powershell
# 再度ログイン
npx -y supabase login
```

### データエクスポートが失敗する

→ ブラウザで手動エクスポート（CSV）を推奨

### データインポートが失敗する

→ ブラウザのTable Editorで手動インポート（CSV）を推奨

---

**次のステップ**: ターミナルで「Enter」キーを押してログイン認証を完了してください！








