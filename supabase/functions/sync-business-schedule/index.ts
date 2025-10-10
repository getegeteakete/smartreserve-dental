
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleSyncRequest {
  year: number;
  month: number;
  dayOfWeek: number;
  timeSlot: {
    start: string;
    end: string;
  };
  isAvailable: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // 管理者認証をスキップ（管理画面からの呼び出しを許可）
    const authHeader = req.headers.get('Authorization');
    console.log('認証ヘッダー:', authHeader);

    const {
      year,
      month,
      dayOfWeek,
      timeSlot,
      isAvailable
    }: ScheduleSyncRequest = await req.json();

    console.log('営業日スケジュール同期開始:', {
      year,
      month,
      dayOfWeek,
      timeSlot,
      isAvailable
    });

    // Google Calendar APIアクセストークンを取得
    const accessToken = await getGoogleAccessToken();

    // 曜日名を取得
    const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const dayName = dayNames[dayOfWeek];

    // 月の全ての該当曜日を取得
    const datesInMonth = getDatesForDayOfWeek(year, month, dayOfWeek);

    for (const date of datesInMonth) {
      const eventTitle = isAvailable 
        ? `診療時間 ${timeSlot.start}-${timeSlot.end}`
        : `休診 ${timeSlot.start}-${timeSlot.end}`;

      const eventDescription = isAvailable
        ? `${dayName} ${timeSlot.start}-${timeSlot.end} 診療可能`
        : `${dayName} ${timeSlot.start}-${timeSlot.end} 休診`;

      // ISO 8601形式のdatetimeを作成
      const startDateTime = `${date}T${timeSlot.start}:00+09:00`;
      const endDateTime = `${date}T${timeSlot.end}:00+09:00`;

      // 既存イベントを検索
      const existingEvents = await searchExistingEvents(accessToken, date, timeSlot);

      if (existingEvents.length > 0) {
        // 既存イベントを更新
        for (const event of existingEvents) {
          await updateGoogleCalendarEvent(accessToken, event.id, {
            summary: eventTitle,
            description: eventDescription,
            start: {
              dateTime: startDateTime,
              timeZone: 'Asia/Tokyo'
            },
            end: {
              dateTime: endDateTime,
              timeZone: 'Asia/Tokyo'
            }
          });
        }
      } else {
        // 新規イベント作成
        await createGoogleCalendarEvent(accessToken, {
          summary: eventTitle,
          description: eventDescription,
          start: {
            dateTime: startDateTime,
            timeZone: 'Asia/Tokyo'
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'Asia/Tokyo'
          }
        });
      }
    }

    console.log('営業日スケジュール同期完了');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: '営業日スケジュールがGoogleカレンダーに同期されました'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('営業日スケジュール同期エラー:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || '営業日スケジュールの同期に失敗しました' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function getGoogleAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN');
  
  // より詳細なエラーメッセージを提供
  if (!clientId || !clientSecret) {
    const errorMessage = `❌ Google認証情報が不完全です

📋 Supabaseの「Manage Secrets」で以下を設定してください：
• GOOGLE_CALENDAR_CLIENT_ID
• GOOGLE_CALENDAR_CLIENT_SECRET

🔗 Google Cloud Consoleで取得：
https://console.cloud.google.com/apis/credentials`;
    
    console.log('🚨 認証エラー詳細:');
    console.log(errorMessage);
    throw new Error(errorMessage);
  }

  if (!refreshToken) {
    const redirectUri = 'https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/google-calendar-auth';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    const errorMessage = `🔐 Google Calendar初回認証が必要です

🚀 以下のURLをクリックして認証を完了してください：

${authUrl}

✅ 認証完了後、表示されるリフレッシュトークンを
   Supabaseの「Manage Secrets」で設定してください：
   GOOGLE_CALENDAR_REFRESH_TOKEN = 取得したトークン`;
   
    console.log('🔑 認証URL:');
    console.log(authUrl);
    console.log('');
    console.log('📝 詳細手順:');
    console.log(errorMessage);
    throw new Error(errorMessage);
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`アクセストークン取得エラー: ${error}`);
  }

  const tokens = await tokenResponse.json();
  return tokens.access_token;
}

function getDatesForDayOfWeek(year: number, month: number, dayOfWeek: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, month - 1, 1);
  
  // 月の最初の該当曜日を見つける
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  // 月内の全ての該当曜日を追加
  while (date.getMonth() === month - 1) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 7);
  }
  
  return dates;
}

async function searchExistingEvents(accessToken: string, date: string, timeSlot: { start: string; end: string }) {
  const timeMin = `${date}T${timeSlot.start}:00+09:00`;
  const timeMax = `${date}T${timeSlot.end}:00+09:00`;
  
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error('イベント検索エラー:', await response.text());
    return [];
  }

  const data = await response.json();
  return data.items?.filter((event: any) => 
    event.summary?.includes('診療時間') || event.summary?.includes('休診')
  ) || [];
}

async function createGoogleCalendarEvent(accessToken: string, event: any) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Googleカレンダーイベント作成エラー: ${response.status} ${errorText}`);
  }

  return await response.json();
}

async function updateGoogleCalendarEvent(accessToken: string, eventId: string, event: any) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Googleカレンダーイベント更新エラー: ${response.status} ${errorText}`);
  }

  return await response.json();
}

serve(handler);
