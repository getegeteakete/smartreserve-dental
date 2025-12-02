# Supabaseプロジェクト移行ヘルパースクリプト (PowerShell版)
# このスクリプトは新しいSupabaseプロジェクトへの移行を支援します

Write-Host "🔄 Supabaseプロジェクト移行ヘルパー" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 新しいプロジェクト情報の入力
Write-Host "📝 新しいSupabaseプロジェクトの情報を入力してください" -ForegroundColor Yellow
Write-Host ""

$NEW_PROJECT_ID = Read-Host "新しいプロジェクトID (Reference ID)"
$NEW_PROJECT_URL = Read-Host "新しいプロジェクトURL"
$NEW_ANON_KEY = Read-Host "新しいAnon Key"

Write-Host ""
Write-Host "確認:"
Write-Host "  プロジェクトID: $NEW_PROJECT_ID"
Write-Host "  URL: $NEW_PROJECT_URL"
Write-Host ""

$CONFIRM = Read-Host "この情報で続行しますか? (y/n)"
if ($CONFIRM -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ1: Supabaseにログイン" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
npx supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ログインに失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ2: プロジェクトをリンク" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
npx supabase link --project-ref $NEW_PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ プロジェクトのリンクに失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ3: データベースマイグレーション" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
$RUN_MIGRATION = Read-Host "マイグレーションを実行しますか? (y/n)"
if ($RUN_MIGRATION -eq "y") {
    npx supabase db push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ マイグレーションに失敗しました" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ マイグレーション完了" -ForegroundColor Green
} else {
    Write-Host "⚠️  マイグレーションをスキップしました" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ4: Edge Functionsのデプロイ" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
$DEPLOY_FUNCTIONS = Read-Host "Edge Functionsをデプロイしますか? (y/n)"
if ($DEPLOY_FUNCTIONS -eq "y") {
    Write-Host "メール関連関数をデプロイ中..." -ForegroundColor Yellow
    
    npx supabase functions deploy send-appointment-email
    npx supabase functions deploy send-confirmation-email
    npx supabase functions deploy send-cancellation-email
    npx supabase functions deploy send-reminder-emails
    npx supabase functions deploy send-appointment-modification-email
    npx supabase functions deploy send-payment-confirmation-email
    
    Write-Host "✅ Edge Functions デプロイ完了" -ForegroundColor Green
} else {
    Write-Host "⚠️  Edge Functionsのデプロイをスキップしました" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ5: Supabase Secretsの設定" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
$SET_SECRETS = Read-Host "Resend APIキーを設定しますか? (y/n)"
if ($SET_SECRETS -eq "y") {
    $RESEND_API_KEY = Read-Host "Resend APIキー"
    npx supabase secrets set RESEND_API_KEY=$RESEND_API_KEY
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secrets設定完了" -ForegroundColor Green
    } else {
        Write-Host "❌ Secrets設定に失敗しました" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Secrets設定をスキップしました" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ステップ6: 環境変数ファイルの作成" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
$CREATE_ENV = Read-Host ".env.localファイルを作成しますか? (y/n)"
if ($CREATE_ENV -eq "y") {
    $envContent = @"
# 新しいSupabaseプロジェクトの情報
VITE_SUPABASE_URL=$NEW_PROJECT_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY

# アプリケーション設定
VITE_APP_URL=http://localhost:5173

# オプション: 決済機能を使用する場合
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# VITE_KOMOJU_PUBLISHABLE_KEY=pk_test_xxxxx
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.localファイルを作成しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.localファイルの作成をスキップしました" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ 移行準備が完了しました！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "1. src/integrations/supabase/client.ts のハードコード値を更新"
Write-Host "2. npm run dev でローカル環境を起動して動作確認"
Write-Host "3. Vercelの環境変数を更新"
Write-Host "4. Resendのドメイン認証を設定"
Write-Host ""
Write-Host "詳細は SUPABASE_MIGRATION_GUIDE.md を参照してください" -ForegroundColor Cyan
Write-Host ""

