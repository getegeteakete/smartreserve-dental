#!/bin/bash

# Supabaseプロジェクト移行ヘルパースクリプト
# このスクリプトは新しいSupabaseプロジェクトへの移行を支援します

echo "🔄 Supabaseプロジェクト移行ヘルパー"
echo "======================================"
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 新しいプロジェクト情報の入力
echo "📝 新しいSupabaseプロジェクトの情報を入力してください"
echo ""

read -p "新しいプロジェクトID (Reference ID): " NEW_PROJECT_ID
read -p "新しいプロジェクトURL: " NEW_PROJECT_URL
read -p "新しいAnon Key: " NEW_ANON_KEY

echo ""
echo "確認:"
echo "  プロジェクトID: $NEW_PROJECT_ID"
echo "  URL: $NEW_PROJECT_URL"
echo ""

read -p "この情報で続行しますか? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "キャンセルしました"
    exit 1
fi

echo ""
echo "======================================"
echo "ステップ1: Supabaseにログイン"
echo "======================================"
npx supabase login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ログインに失敗しました${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "ステップ2: プロジェクトをリンク"
echo "======================================"
npx supabase link --project-ref $NEW_PROJECT_ID

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ プロジェクトのリンクに失敗しました${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "ステップ3: データベースマイグレーション"
echo "======================================"
read -p "マイグレーションを実行しますか? (y/n): " RUN_MIGRATION
if [ "$RUN_MIGRATION" = "y" ]; then
    npx supabase db push
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ マイグレーションに失敗しました${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ マイグレーション完了${NC}"
else
    echo -e "${YELLOW}⚠️  マイグレーションをスキップしました${NC}"
fi

echo ""
echo "======================================"
echo "ステップ4: Edge Functionsのデプロイ"
echo "======================================"
read -p "Edge Functionsをデプロイしますか? (y/n): " DEPLOY_FUNCTIONS
if [ "$DEPLOY_FUNCTIONS" = "y" ]; then
    echo "メール関連関数をデプロイ中..."
    
    npx supabase functions deploy send-appointment-email
    npx supabase functions deploy send-confirmation-email
    npx supabase functions deploy send-cancellation-email
    npx supabase functions deploy send-reminder-emails
    npx supabase functions deploy send-appointment-modification-email
    npx supabase functions deploy send-payment-confirmation-email
    
    echo -e "${GREEN}✅ Edge Functions デプロイ完了${NC}"
else
    echo -e "${YELLOW}⚠️  Edge Functionsのデプロイをスキップしました${NC}"
fi

echo ""
echo "======================================"
echo "ステップ5: Supabase Secretsの設定"
echo "======================================"
read -p "Resend APIキーを設定しますか? (y/n): " SET_SECRETS
if [ "$SET_SECRETS" = "y" ]; then
    read -p "Resend APIキー: " RESEND_API_KEY
    npx supabase secrets set RESEND_API_KEY=$RESEND_API_KEY
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Secrets設定完了${NC}"
    else
        echo -e "${RED}❌ Secrets設定に失敗しました${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Secrets設定をスキップしました${NC}"
fi

echo ""
echo "======================================"
echo "ステップ6: 環境変数ファイルの作成"
echo "======================================"
read -p ".env.localファイルを作成しますか? (y/n): " CREATE_ENV
if [ "$CREATE_ENV" = "y" ]; then
    cat > .env.local << EOF
# 新しいSupabaseプロジェクトの情報
VITE_SUPABASE_URL=$NEW_PROJECT_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY

# アプリケーション設定
VITE_APP_URL=http://localhost:5173

# オプション: 決済機能を使用する場合
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# VITE_KOMOJU_PUBLISHABLE_KEY=pk_test_xxxxx
EOF
    echo -e "${GREEN}✅ .env.localファイルを作成しました${NC}"
else
    echo -e "${YELLOW}⚠️  .env.localファイルの作成をスキップしました${NC}"
fi

echo ""
echo "======================================"
echo "✅ 移行準備が完了しました！"
echo "======================================"
echo ""
echo "次のステップ:"
echo "1. src/integrations/supabase/client.ts のハードコード値を更新"
echo "2. npm run dev でローカル環境を起動して動作確認"
echo "3. Vercelの環境変数を更新"
echo "4. Resendのドメイン認証を設定"
echo ""
echo "詳細は SUPABASE_MIGRATION_GUIDE.md を参照してください"
echo ""

