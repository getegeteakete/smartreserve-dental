import { format, getDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { isJapaneseHoliday } from "./holidayApiUtils";
import { hasHolidayInWeek } from "./holidayUtils";

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DatabaseScheduleData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface SpecialScheduleData {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

/**
 * 時間文字列を指定された間隔でスロットに分割
 */
const generateSlotsFromTimeRange = (
  startTime: string, 
  endTime: string, 
  dateStr: string,
  intervalMinutes: number = 30
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  console.log(`🔍 generateSlotsFromTimeRange呼び出し: ${startTime} - ${endTime} (${intervalMinutes}分間隔)`);
  
  // 時間文字列を解析 (HH:MM:SS または HH:MM)
  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    return {
      hour: parseInt(parts[0], 10),
      minute: parseInt(parts[1], 10)
    };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  console.log(`🔍 解析結果: start=${start.hour}:${start.minute}, end=${end.hour}:${end.minute}`);
  
  let currentHour = start.hour;
  let currentMinute = start.minute;
  
  while (
    currentHour < end.hour || 
    (currentHour === end.hour && currentMinute < end.minute)
  ) {
    const slotStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
    
    // 指定された間隔後の時刻を計算
    let nextMinute = currentMinute + intervalMinutes;
    let nextHour = currentHour;
    while (nextMinute >= 60) {
      nextMinute -= 60;
      nextHour++;
    }
    
    // 終了時刻を超えない場合のみ追加
    if (nextHour < end.hour || (nextHour === end.hour && nextMinute <= end.minute)) {
      const slotEndTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}:00`;
      
      slots.push({
        id: `${dateStr}-${slotStartTime}`,
        start_time: slotStartTime,
        end_time: slotEndTime,
        is_available: true
      });
    }
    
    currentMinute = nextMinute;
    currentHour = nextHour;
  }
  
  return slots;
};

/**
 * 時間スロットの重複を除去する関数
 */
const removeDuplicateTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  const seen = new Set<string>();
  const uniqueSlots: TimeSlot[] = [];
  
  for (const slot of slots) {
    // start_timeとend_timeの組み合わせでユニーク性を判定
    const key = `${slot.start_time}-${slot.end_time}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSlots.push(slot);
    }
  }
  
  // 開始時間でソート
  return uniqueSlots.sort((a, b) => {
    const timeA = a.start_time;
    const timeB = b.start_time;
    return timeA.localeCompare(timeB);
  });
};

/**
 * 治療時間に応じた時間枠を生成
 */
export const generateDynamicTimeSlotsForTreatment = async (
  date: Date, 
  treatmentDuration: number = 30
): Promise<TimeSlot[]> => {
  if (!date) return [];

  const dayOfWeek = getDay(date); // 0: 日曜, 1: 月曜, ..., 6: 土曜
  const dateStr = format(date, 'yyyy-MM-dd');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  console.log(`🔍 時間枠生成開始: ${dateStr} (${dayOfWeek}曜日) - 治療時間: ${treatmentDuration}分`);

  try {
    // 1. 祝日チェック
    const isHoliday = await isJapaneseHoliday(date);
    
    // 2. 特別予約受付時間を最優先チェック
    const { data: specialBookingSchedules, error: specialBookingError } = await (supabase as any).rpc(
      'get_special_booking_time_schedules',
      { p_year: year, p_month: month }
    );

    if (specialBookingError) {
      console.warn("特別予約受付時間取得エラー:", specialBookingError);
    }

    // 該当日の特別予約受付時間
    const daySpecialBookingSchedules = specialBookingSchedules?.filter(
      (schedule: SpecialScheduleData) => schedule.specific_date === dateStr
    ) || [];

    // 特別予約受付時間がある場合はそれを使用
    if (daySpecialBookingSchedules.length > 0) {
      const slots: TimeSlot[] = [];
      
      for (const specialSchedule of daySpecialBookingSchedules) {
        if (specialSchedule.is_available) {
          const specialSlots = generateSlotsFromTimeRange(
            specialSchedule.start_time,
            specialSchedule.end_time,
            dateStr,
            treatmentDuration
          );
          slots.push(...specialSlots);
        }
      }
      
      // 重複を除去
      const uniqueSlots = removeDuplicateTimeSlots(slots);
      console.log(`特別予約受付時間から生成(${treatmentDuration}分): ${dateStr}`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
      return uniqueSlots;
    }

    // 3. 特別診療時間をチェック（予約受付時間がない場合のフォールバック）
    const { data: specialSchedules, error: specialError } = await (supabase as any).rpc(
      'get_special_clinic_schedules',
      { p_year: year, p_month: month }
    );

    if (specialError) {
      console.error("特別診療時間取得エラー:", specialError);
    }

    // 該当日の特別診療時間
    const daySpecialSchedules = specialSchedules?.filter(
      (schedule: SpecialScheduleData) => schedule.specific_date === dateStr
    ) || [];

    // 特別診療時間がある場合はそれを使用
    if (daySpecialSchedules.length > 0) {
      const slots: TimeSlot[] = [];
      
      for (const specialSchedule of daySpecialSchedules) {
        if (specialSchedule.is_available) {
          const specialSlots = generateSlotsFromTimeRange(
            specialSchedule.start_time,
            specialSchedule.end_time,
            dateStr,
            treatmentDuration
          );
          slots.push(...specialSlots);
        }
      }
      
      // 重複を除去
      const uniqueSlots = removeDuplicateTimeSlots(slots);
      console.log(`特別診療時間から生成(${treatmentDuration}分)（フォールバック）: ${dateStr}`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
      return uniqueSlots;
    }

    // 4. 祝日の場合は予約不可（特別スケジュールで上書きされていない限り）
    if (isHoliday) {
      console.log(`祝日のため予約不可: ${dateStr}`);
      return [];
    }

    // 5. 予約受付時間スケジュールを優先取得
    const { data: bookingTimeSchedules, error: bookingTimeError } = await (supabase as any).rpc(
      'get_booking_time_schedules',
      { p_year: year, p_month: month }
    );

    if (bookingTimeError) {
      console.warn("予約受付時間スケジュール取得エラー（診療時間で代替）:", bookingTimeError);
    }

    // 該当曜日の予約受付時間スケジュール
    const dayBookingSchedules = bookingTimeSchedules?.filter(
      (schedule: DatabaseScheduleData) => schedule.day_of_week === dayOfWeek
    ) || [];

    const slots: TimeSlot[] = [];

    // 予約受付時間スケジュールがある場合はそれを使用
    if (dayBookingSchedules.length > 0) {
      for (const schedule of dayBookingSchedules) {
        if (schedule.is_available) {
          const bookingSlots = generateSlotsFromTimeRange(
            schedule.start_time,
            schedule.end_time,
            dateStr,
            treatmentDuration
          );
          slots.push(...bookingSlots);
        }
      }
      if (slots.length > 0) {
        // 重複を除去
        const uniqueSlots = removeDuplicateTimeSlots(slots);
        console.log(`予約受付時間から生成(${treatmentDuration}分): ${dateStr} (${dayOfWeek}曜日)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
        return uniqueSlots;
      }
      // 予約受付時間スケジュールが登録されているが、is_available=falseの場合もフォールバック処理へ
      console.log(`予約受付時間スケジュールは存在するが、利用不可のためフォールバック処理へ`);
    }

    // 予約受付時間スケジュールがない場合は診療時間をフォールバック
    const { data: regularSchedules, error: regularError } = await (supabase as any).rpc(
      'get_clinic_schedules',
      { p_year: year, p_month: month }
    );

    if (regularError) {
      console.error("通常スケジュール取得エラー:", regularError);
      return [];
    }

    console.log(`🔍 取得した診療時間スケジュール:`, regularSchedules);

    // 該当曜日の診療時間スケジュール
    const daySchedules = regularSchedules?.filter(
      (schedule: DatabaseScheduleData) => schedule.day_of_week === dayOfWeek
    ) || [];
    
    console.log(`🔍 ${dayOfWeek}曜日(月=1)の診療時間スケジュール:`, daySchedules);
    
    for (const schedule of daySchedules) {
      if (schedule.is_available) {
        console.log(`🔍 時間枠生成: ${schedule.start_time} - ${schedule.end_time}`);
        const regularSlots = generateSlotsFromTimeRange(
          schedule.start_time,
          schedule.end_time,
          dateStr,
          treatmentDuration
        );
        console.log(`🔍 生成された時間枠:`, regularSlots.map(s => s.start_time));
        slots.push(...regularSlots);
      }
    }

    // データベースから取得したスケジュールが空の場合、基本スケジュールを使用
    if (slots.length === 0) {
      console.log(`🔍 データベーススケジュールが空のため、基本スケジュールを使用: ${dateStr} (${dayOfWeek}曜日)`);
      
      // 木曜日で祝日がある週の場合
      if (dayOfWeek === 4) {
        if (hasHolidayInWeek(date)) {
          console.log(`🔍 木曜日（祝日週）: 10:00～13:30、15:00～19:00`);
          const morningSlots = generateSlotsFromTimeRange("10:00:00", "13:30:00", dateStr, treatmentDuration);
          const afternoonSlots = generateSlotsFromTimeRange("15:00:00", "19:00:00", dateStr, treatmentDuration);
          slots.push(...morningSlots, ...afternoonSlots);
          // 重複を除去
          const uniqueSlots = removeDuplicateTimeSlots(slots);
          console.log(`基本スケジュールから生成(${treatmentDuration}分): ${dateStr} (木曜日・祝日週)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
          return uniqueSlots;
        } else {
          // 木曜日で祝日がない週は休診
          console.log(`木曜日（祝日なし週）: 休診`);
          return [];
        }
      }
      
      // 火・水・金曜日：10:00～13:30、15:00～19:00
      if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 5) {
        console.log(`🔍 ${dayOfWeek === 2 ? '火' : dayOfWeek === 3 ? '水' : '金'}曜日: 10:00～13:30、15:00～19:00`);
        const morningSlots = generateSlotsFromTimeRange("10:00:00", "13:30:00", dateStr, treatmentDuration);
        const afternoonSlots = generateSlotsFromTimeRange("15:00:00", "19:00:00", dateStr, treatmentDuration);
        slots.push(...morningSlots, ...afternoonSlots);
        // 重複を除去
        const uniqueSlots = removeDuplicateTimeSlots(slots);
        console.log(`基本スケジュールから生成(${treatmentDuration}分): ${dateStr} (${dayOfWeek === 2 ? '火' : dayOfWeek === 3 ? '水' : '金'}曜日)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
        return uniqueSlots;
      }
      
      // 月曜日：午前休診、15:00～19:00
      if (dayOfWeek === 1) {
        console.log(`🔍 月曜日: 15:00～19:00`);
        const afternoonSlots = generateSlotsFromTimeRange("15:00:00", "19:00:00", dateStr, treatmentDuration);
        slots.push(...afternoonSlots);
        // 重複を除去
        const uniqueSlots = removeDuplicateTimeSlots(slots);
        console.log(`基本スケジュールから生成(${treatmentDuration}分): ${dateStr} (月曜日)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
        return uniqueSlots;
      }
      
      // 土曜日：9:00～12:30、14:00～17:30
      if (dayOfWeek === 6) {
        console.log(`🔍 土曜日: 9:00～12:30、14:00～17:30`);
        const morningSlots = generateSlotsFromTimeRange("09:00:00", "12:30:00", dateStr, treatmentDuration);
        const afternoonSlots = generateSlotsFromTimeRange("14:00:00", "17:30:00", dateStr, treatmentDuration);
        slots.push(...morningSlots, ...afternoonSlots);
        // 重複を除去
        const uniqueSlots = removeDuplicateTimeSlots(slots);
        console.log(`基本スケジュールから生成(${treatmentDuration}分): ${dateStr} (土曜日)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
        return uniqueSlots;
      }
      
      // 日曜日はデフォルトで休診
      if (dayOfWeek === 0) {
        console.log(`日曜日: 休診`);
        return [];
      }
    }

    // 重複を除去
    const uniqueSlots = removeDuplicateTimeSlots(slots);
    console.log(`診療時間から生成(${treatmentDuration}分): ${dateStr} (${dayOfWeek}曜日)`, uniqueSlots.length, `件 (重複除去前: ${slots.length}件)`);
    console.log(`🔍 最終的な全時間枠:`, uniqueSlots.map(s => s.start_time));
    return uniqueSlots;

  } catch (error) {
    console.error("動的時間枠生成エラー:", error);
    return [];
  }
};

/**
 * データベースから営業日スケジュールを取得し、時間枠を動的生成（既存関数・下位互換）
 */
export const generateDynamicTimeSlots = async (date: Date): Promise<TimeSlot[]> => {
  // デフォルト30分間隔で時間枠を生成
  return generateDynamicTimeSlotsForTreatment(date, 30);
};