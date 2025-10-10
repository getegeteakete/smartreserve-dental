
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEventRequest {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  treatmentName: string;
  confirmedDate: string;
  confirmedTimeSlot: string;
  notes?: string;
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('認証が必要です');
    }

    const {
      appointmentId,
      patientName,
      patientEmail,
      treatmentName,
      confirmedDate,
      confirmedTimeSlot,
      notes
    }: CalendarEventRequest = await req.json();

    console.log('Google Calendar同期開始:', {
      appointmentId,
      patientName,
      confirmedDate,
      confirmedTimeSlot
    });

    // 時間スロットから開始時間と終了時間を計算
    const [startTime, endTime] = confirmedTimeSlot.split('-') || [confirmedTimeSlot, null];
    
    let endTimeCalculated = endTime;
    if (!endTime) {
      // 時間スロットが "09:00" 形式の場合、1時間後を終了時間とする
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + 1;
      endTimeCalculated = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // ISO 8601形式のdatetimeを作成
    const startDateTime = `${confirmedDate}T${startTime}:00+09:00`;
    const endDateTime = `${confirmedDate}T${endTimeCalculated}:00+09:00`;

    // Google Calendar APIアクセストークンを取得
    const accessToken = await getGoogleAccessToken();

    // Googleカレンダーイベントを作成
    const calendarEvent = {
      summary: `${treatmentName} - ${patientName}様`,
      description: `患者様: ${patientName}\nメール: ${patientEmail}\n治療内容: ${treatmentName}${notes ? `\n備考: ${notes}` : ''}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Tokyo'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Tokyo'
      },
      attendees: [
        {
          email: patientEmail,
          displayName: patientName
        }
      ]
    };

    console.log('Googleカレンダーイベント作成中:', calendarEvent);

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API エラー:', errorText);
      throw new Error(`Google Calendar API エラー: ${response.status} ${errorText}`);
    }

    const createdEvent = await response.json();
    console.log('Googleカレンダーイベント作成成功:', createdEvent.id);

    // 予約データにGoogle Calendar Event IDを保存
    const { error: updateError } = await supabaseClient
      .from('appointments')
      .update({ 
        google_calendar_event_id: createdEvent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('予約データ更新エラー:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: createdEvent.id,
        eventUrl: createdEvent.htmlLink 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Google Calendar同期エラー:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Google Calendar同期に失敗しました' 
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
  
  if (!clientId || !clientSecret) {
    throw new Error('Google認証情報が設定されていません');
  }

  // サービスアカウント方式ではなく、管理者用のリフレッシュトークンを使用
  // 実際の運用では、管理者が一度OAuth認証を行い、リフレッシュトークンを取得する必要があります
  const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN');
  
  if (!refreshToken) {
    // 初回設定用のOAuth URLを生成
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent('https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/google-calendar-auth')}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    throw new Error(`Google認証が必要です。以下のURLで認証を完了してください: ${authUrl}`);
  }

  // リフレッシュトークンを使用してアクセストークンを取得
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

serve(handler);
