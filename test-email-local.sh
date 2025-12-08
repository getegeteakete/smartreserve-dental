#!/bin/bash

# ローカルでメール送信機能をテストするBashスクリプト

echo "📧 ローカルメール送信テスト"
echo "================================"
echo ""

# .env.localファイルの確認
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.localファイルが見つかりません"
    echo "以下の内容で.env.localファイルを作成してください:"
    echo ""
    echo "VITE_SUPABASE_URL=http://localhost:54321"
    echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo "RESEND_API_KEY=re_あなたのAPIキー"
    echo ""
    exit 1
fi

# .env.localから環境変数を読み込む
export $(grep -v '^#' .env.local | xargs)

# Supabaseの起動確認
echo ""
echo "🔍 Supabaseローカル環境の状態を確認中..."
if ! npx supabase status > /dev/null 2>&1; then
    echo "⚠️  Supabaseローカル環境が起動していません"
    read -p "起動しますか? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Supabaseローカル環境を起動中..."
        npx supabase start
        if [ $? -ne 0 ]; then
            echo "❌ Supabaseの起動に失敗しました"
            exit 1
        fi
    else
        echo "キャンセルしました"
        exit 1
    fi
else
    echo "✅ Supabaseローカル環境は起動しています"
fi

# 環境変数の設定
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

if [ -z "$RESEND_API_KEY" ]; then
    echo "⚠️  RESEND_API_KEYが設定されていません"
    echo ".env.localファイルにRESEND_API_KEYを設定してください"
else
    echo "✅ RESEND_API_KEYが設定されています"
fi

# Edge Functionの起動
echo ""
echo "🚀 Edge Functionを起動中..."
echo "別のターミナルで 'npm run dev' を実行してフロントエンドを起動してください"
echo ""
echo "📧 send-appointment-email関数を起動します..."
echo "停止するには Ctrl+C を押してください"
echo ""

npx supabase functions serve send-appointment-email --env-file .env.local

