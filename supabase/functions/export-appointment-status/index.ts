import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentStatus {
  date: string;
  time_slot: string;
  treatment_name: string;
  confirmed_count: number;
  pending_count: number;
  total_count: number;
  max_capacity: number;
  availability_status: string;
}

const getTreatmentCapacity = (treatmentName: string): number => {
  const normalized = treatmentName.toLowerCase();
  
  if (normalized.includes('初診') || 
      normalized.includes('精密検査') ||
      normalized.includes('カウンセリング')) {
    return 1;
  } else if (normalized.includes('ホワイトニング') || 
             normalized.includes('pmtc') ||
             normalized.includes('クリーニング')) {
    return 4;
  }
  return 99; // その他は制限なし
};

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break; // 18:30まで
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      slots.push(timeSlot);
    }
  }
  return slots;
};

const formatAsCSV = (data: AppointmentStatus[]): string => {
  const headers = [
    "日付", "時間帯", "診療内容", "確定予約数", "申込み中予約数", 
    "合計予約数", "上限人数", "空き状況"
  ];
  
  const csvRows = [headers.join(",")];
  
  data.forEach(row => {
    const csvRow = [
      row.date,
      row.time_slot,
      `"${row.treatment_name}"`,
      row.confirmed_count,
      row.pending_count,
      row.total_count,
      row.max_capacity,
      `"${row.availability_status}"`
    ];
    csvRows.push(csvRow.join(","));
  });
  
  return csvRows.join("\n");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const startDate = url.searchParams.get("start_date") || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get("end_date") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`予約状況エクスポート開始: ${startDate} - ${endDate}, format: ${format}`);

    // 全診療内容を取得
    const { data: treatments, error: treatmentsError } = await supabase
      .from("treatments")
      .select("name");

    if (treatmentsError) {
      throw treatmentsError;
    }

    const timeSlots = generateTimeSlots();
    const appointmentStatusList: AppointmentStatus[] = [];

    // 期間内の各日について処理
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      for (const timeSlot of timeSlots) {
        for (const treatment of treatments) {
          const treatmentName = treatment.name;
          
          // 確定予約数を取得
          const { data: confirmedAppointments, error: confirmedError } = await supabase
            .from("appointments")
            .select("id")
            .eq("confirmed_date", dateStr)
            .eq("confirmed_time_slot", timeSlot)
            .eq("treatment_name", treatmentName)
            .eq("status", "confirmed");

          if (confirmedError) {
            console.error("確定予約取得エラー:", confirmedError);
            continue;
          }

          // 申込み中予約数を取得（希望日時も含む）
          const { data: pendingAppointments, error: pendingError } = await supabase
            .from("appointments")
            .select("id")
            .eq("treatment_name", treatmentName)
            .eq("status", "pending");

          if (pendingError) {
            console.error("申込み中予約取得エラー:", pendingError);
            continue;
          }

          // 希望日時も考慮
          const { data: pendingPreferences, error: preferencesError } = await supabase
            .from("appointment_preferences")
            .select(`
              appointment_id,
              appointments!inner(
                id,
                treatment_name,
                status
              )
            `)
            .eq("preferred_date", dateStr)
            .eq("preferred_time_slot", timeSlot);

          if (preferencesError) {
            console.error("希望日時取得エラー:", preferencesError);
          }

          const matchingPreferences = pendingPreferences?.filter(pref => 
            pref.appointments?.treatment_name === treatmentName &&
            pref.appointments?.status === 'pending'
          ) || [];

          const confirmedCount = confirmedAppointments.length;
          const pendingCount = matchingPreferences.length;
          const totalCount = confirmedCount + pendingCount;
          const maxCapacity = getTreatmentCapacity(treatmentName);

          let availabilityStatus = "空きあり";
          if (totalCount >= maxCapacity) {
            availabilityStatus = "満員";
          } else if (totalCount >= maxCapacity * 0.8) {
            availabilityStatus = "残りわずか";
          }

          // 予約がある場合のみ出力対象とする（0件の場合はスキップしてサイズを削減）
          if (totalCount > 0) {
            appointmentStatusList.push({
              date: dateStr,
              time_slot: timeSlot,
              treatment_name: treatmentName,
              confirmed_count: confirmedCount,
              pending_count: pendingCount,
              total_count: totalCount,
              max_capacity: maxCapacity,
              availability_status: availabilityStatus
            });
          }
        }
      }
    }

    console.log(`予約状況データ生成完了: ${appointmentStatusList.length}件`);

    if (format === "csv") {
      const csvData = formatAsCSV(appointmentStatusList);
      
      return new Response(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointment-status-${startDate}-${endDate}.csv"`,
          ...corsHeaders,
        },
      });
    } else {
      return new Response(JSON.stringify({
        success: true,
        data: appointmentStatusList,
        summary: {
          total_records: appointmentStatusList.length,
          date_range: `${startDate} - ${endDate}`,
          generated_at: new Date().toISOString()
        }
      }, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

  } catch (error: any) {
    console.error("予約状況エクスポートエラー:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);