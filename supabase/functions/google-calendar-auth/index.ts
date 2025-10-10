
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(
        `<html><body><h1>認証エラー</h1><p>${error}</p></body></html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    if (!code) {
      return new Response(
        '<html><body><h1>認証コードが見つかりません</h1></body></html>',
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google認証情報が設定されていません');
    }

    // 認証コードをアクセストークンとリフレッシュトークンに交換
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/google-calendar-auth',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`トークン取得エラー: ${error}`);
    }

    const tokens = await tokenResponse.json();

    return new Response(
      `<html><body>
        <h1>Google Calendar認証完了</h1>
        <p>認証が正常に完了しました。</p>
        <p><strong>重要:</strong> 以下のリフレッシュトークンをSupabaseのシークレットに設定してください：</p>
        <p><code>GOOGLE_CALENDAR_REFRESH_TOKEN = ${tokens.refresh_token}</code></p>
        <p>このページを閉じて、管理画面に戻ってください。</p>
      </body></html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );

  } catch (error: any) {
    console.error('Google Calendar認証エラー:', error);
    return new Response(
      `<html><body><h1>認証エラー</h1><p>${error.message}</p></body></html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
};

serve(handler);
