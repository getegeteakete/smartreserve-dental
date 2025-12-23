
import { format, getDay } from "date-fns";
import { isHoliday, hasHolidayInWeek } from "@/utils/holidayUtils";
import { getBasicSchedule } from "./basicScheduleUtils";

interface SpecialScheduleData {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DatabaseScheduleData {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const formatTime = (timeString: string): string => {
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
};

export const getScheduleInfo = (
  date: Date, 
  specialSchedules: SpecialScheduleData[], 
  schedules: DatabaseScheduleData[]
) => {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayOfWeek = getDay(date);

  // 祝日チェック
  if (isHoliday(date)) {
    return {
      type: 'basic-closed',
      schedules: ['祝日'],
      displayText: '祝日'
    };
  }

  // 特別診療日設定をチェック（最優先）
  const specialSchedule = specialSchedules.find(s => s.specific_date === dateString);
  if (specialSchedule) {
    return {
      type: specialSchedule.is_available ? 'special-open' : 'special-closed',
      schedules: specialSchedule.is_available ? [`${formatTime(specialSchedule.start_time)}～${formatTime(specialSchedule.end_time)}`] : ['休診日（特別設定）'],
      displayText: specialSchedule.is_available ? '特別営業' : '休み'
    };
  }

  // 土曜日の処理：実際のスケジュールデータをチェック
  if (dayOfWeek === 6) {
    const saturdaySchedules = schedules.filter(s => s.day_of_week === 6);
    if (saturdaySchedules.length > 0) {
      const availableSchedules = saturdaySchedules.filter(s => s.is_available);
      if (availableSchedules.length > 0) {
        // 土曜営業スケジュールがある場合
        return {
          type: 'saturday-open',
          schedules: availableSchedules.map(s => `${formatTime(s.start_time)}～${formatTime(s.end_time)}`),
          displayText: '土曜営業'
        };
      } else {
        // すべてのスケジュールが無効（休業）
        return {
          type: 'basic-closed',
          schedules: ['休診日'],
          displayText: '休み'
        };
      }
    }
    // デフォルトの土曜営業スケジュール（データがない場合）
    return {
      type: 'saturday-open',
      schedules: ['9:00～12:30', '14:00～17:30'],
      displayText: '土曜営業'
    };
  }

  // 木曜日の処理：祝日がある週は営業、ない週は休診
  if (dayOfWeek === 4) {
    const hasHoliday = hasHolidayInWeek(date);
    console.log(`木曜日 ${dateString} (${format(date, 'MM/dd')}): 祝日週チェック = ${hasHoliday}`);
    if (hasHoliday) {
      return {
        type: 'full-open',
        schedules: ['10:00～13:30', '15:00～19:00'],
        displayText: '祝日週営業'
      };
    } else {
      return {
        type: 'basic-closed',
        schedules: ['定休日'],
        displayText: '休み'
      };
    }
  }

  // 日曜日の場合、デフォルトは基本休診日
  if (dayOfWeek === 0) {
    return {
      type: 'basic-closed',
      schedules: ['基本休診日'],
      displayText: '休み'
    };
  }

  // カスタムスケジュール設定をチェック（土曜日以外）
  const regularSchedules = schedules.filter(s => s.day_of_week === dayOfWeek);
  if (regularSchedules.length > 0) {
    const availableSchedules = regularSchedules.filter(s => s.is_available);
    if (availableSchedules.length > 0) {
      const morningSchedules = availableSchedules.filter(s => s.start_time < "14:00:00");
      const afternoonSchedules = availableSchedules.filter(s => s.start_time >= "14:00:00");
      
      let displayText = "";
      if (morningSchedules.length > 0 && afternoonSchedules.length > 0) {
        if (dayOfWeek === 0) {
          displayText = "日曜診療";
        } else {
          displayText = "";
        }
      } else if (morningSchedules.length > 0) {
        displayText = "午前営業";
      } else if (afternoonSchedules.length > 0) {
        displayText = "午後営業";
      }

      return {
        type: morningSchedules.length > 0 && afternoonSchedules.length > 0 ? 'full-open' : 'partial-open',
        schedules: availableSchedules.map(s => `${formatTime(s.start_time)}～${formatTime(s.end_time)}`),
        displayText
      };
    } else {
      return {
        type: 'custom-closed',
        schedules: ['休診日（カスタム設定）'],
        displayText: '休み'
      };
    }
  }

  // 基本スケジュールを適用
  const basicSchedule = getBasicSchedule(dayOfWeek, date);
  if (Object.keys(basicSchedule).length > 0 && basicSchedule.type !== 'closed') {
    const scheduleTexts = [];
    if (basicSchedule.morning) scheduleTexts.push(basicSchedule.morning);
    if (basicSchedule.afternoon) scheduleTexts.push(basicSchedule.afternoon);
    
    let displayText = "";
    if (basicSchedule.type === "full") displayText = "";
    else if (basicSchedule.type === "afternoon") displayText = "午後営業";

    return {
      type: basicSchedule.type === "full" ? 'full-open' : 'partial-open',
      schedules: scheduleTexts,
      displayText
    };
  }

  // デフォルトは休診日
  return {
    type: 'basic-closed',
    schedules: ['基本休診日'],
    displayText: '休み'
  };
};
