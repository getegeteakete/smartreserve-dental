import { supabase } from "@/integrations/supabase/client";

/**
 * データベーステーブルの存在確認と自動セットアップ
 */
export const checkAndSetupScheduleTables = async () => {
  try {
    // clinic_schedulesテーブルの確認
    const { error: clinicError } = await supabase
      .from("clinic_schedules")
      .select("id")
      .limit(1);

    // booking_time_schedulesテーブルの確認
    const { error: bookingError } = await supabase
      .from("booking_time_schedules")
      .select("id")
      .limit(1);

    const results = {
      clinicSchedules: !clinicError,
      bookingTimeSchedules: !bookingError,
      errors: [] as string[],
    };

    if (clinicError) {
      results.errors.push("clinic_schedules テーブルが存在しません");
    }
    if (bookingError) {
      results.errors.push("booking_time_schedules テーブルが存在しません");
    }

    return results;
  } catch (error) {
    console.error("テーブル確認エラー:", error);
    return {
      clinicSchedules: false,
      bookingTimeSchedules: false,
      errors: ["データベース接続エラー"],
    };
  }
};

/**
 * デフォルトの基本営業時間を設定
 */
export const setupDefaultClinicSchedules = async (year: number, month: number) => {
  const defaultSchedules = [
    // 月曜〜金曜: 10:00-13:30, 15:00-19:00
    { dayOfWeek: 1, startTime: "10:00", endTime: "13:30" },
    { dayOfWeek: 1, startTime: "15:00", endTime: "19:00" },
    { dayOfWeek: 2, startTime: "10:00", endTime: "13:30" },
    { dayOfWeek: 2, startTime: "15:00", endTime: "19:00" },
    { dayOfWeek: 3, startTime: "10:00", endTime: "13:30" },
    { dayOfWeek: 3, startTime: "15:00", endTime: "19:00" },
    { dayOfWeek: 5, startTime: "10:00", endTime: "13:30" },
    { dayOfWeek: 5, startTime: "15:00", endTime: "19:00" },
    // 土曜: 9:00-12:30, 14:00-17:30
    { dayOfWeek: 6, startTime: "09:00", endTime: "12:30" },
    { dayOfWeek: 6, startTime: "14:00", endTime: "17:30" },
  ];

  const results = [];
  for (const schedule of defaultSchedules) {
    const { data, error } = await supabase
      .from("clinic_schedules")
      .insert({
        year,
        month,
        day_of_week: schedule.dayOfWeek,
        start_time: schedule.startTime + ":00",
        end_time: schedule.endTime + ":00",
        is_available: true,
      })
      .select()
      .single();

    if (error) {
      console.error("デフォルト設定エラー:", error);
      results.push({ success: false, error });
    } else {
      results.push({ success: true, data });
    }
  }

  return results;
};

/**
 * 基本営業時間から予約受付時間を自動生成
 */
export const generateBookingTimesFromClinic = async (year: number, month: number) => {
  // 基本営業時間を取得
  const { data: clinicSchedules, error } = await supabase
    .from("clinic_schedules")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .eq("is_available", true);

  if (error || !clinicSchedules || clinicSchedules.length === 0) {
    return { success: false, message: "基本営業時間が設定されていません" };
  }

  const results = [];
  for (const clinic of clinicSchedules) {
    const startMinutes = parseInt(clinic.start_time.split(':')[0]) * 60 + parseInt(clinic.start_time.split(':')[1]);
    const endMinutes = parseInt(clinic.end_time.split(':')[0]) * 60 + parseInt(clinic.end_time.split(':')[1]);
    
    // 30分後開始、30分前終了
    const bookingStartMinutes = startMinutes + 30;
    const bookingEndMinutes = endMinutes - 30;
    
    if (bookingEndMinutes > bookingStartMinutes) {
      const startTime = `${String(Math.floor(bookingStartMinutes / 60)).padStart(2, '0')}:${String(bookingStartMinutes % 60).padStart(2, '0')}`;
      const endTime = `${String(Math.floor(bookingEndMinutes / 60)).padStart(2, '0')}:${String(bookingEndMinutes % 60).padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from("booking_time_schedules")
        .insert({
          year,
          month,
          day_of_week: clinic.day_of_week,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: true,
        })
        .select()
        .single();

      results.push({ success: !error, data, error });
    }
  }

  return { success: true, results, count: results.length };
};


