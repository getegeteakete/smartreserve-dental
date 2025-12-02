#!/bin/bash
# Xサーバーメール設定用のSupabase Secrets設定スクリプト

echo "=== Supabase Secrets設定 ==="
echo ""
echo "以下のコマンドを実行して、Resend APIキーとその他の設定を追加してください："
echo ""
echo "# Resend APIキーを設定（既に提供済みのキーを使用）"
echo "supabase secrets set RESEND_API_KEY=re_あなたのAPIキー"
echo ""
echo "# Supabase URLを設定"
echo "supabase secrets set SUPABASE_URL=https://vnwnevhakhgbbxxlmutx.supabase.co"
echo ""
echo "# Supabase Service Role Keyを設定（Supabaseダッシュボードから取得）"
echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=あなたのServiceRoleKey"
echo ""
echo "# Edge Functionをデプロイ"
echo "supabase functions deploy send-appointment-email"
echo ""

