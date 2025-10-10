
import { hasHolidayInWeek } from "@/utils/holidayUtils";

export const getBasicSchedule = (dayOfWeek: number, date?: Date): { morning?: string; afternoon?: string; type?: string } => {
  // 木曜日（4）は基本的に定休日だが、祝日がある週は営業日
  if (dayOfWeek === 4) {
    if (date && hasHolidayInWeek(date)) {
      return { morning: "10:00～13:30", afternoon: "15:00～19:00", type: "full" };
    } else {
      return { type: "closed" };
    }
  }
  
  switch (dayOfWeek) {
    case 1: // 月曜日 - 午後のみ
      return { afternoon: "15:00～19:00", type: "afternoon" };
    case 2: // 火曜日 - 終日営業
    case 3: // 水曜日 - 終日営業
    case 5: // 金曜日 - 終日営業
      return { morning: "10:00～13:30", afternoon: "15:00～19:00", type: "full" };
    case 6: // 土曜日 - 土曜診療時間 9:00～12:30 / 14:00～17:30
      return { morning: "9:00～12:30", afternoon: "14:00～17:30", type: "saturday" };
    default: // 日曜日（0）- 基本休診
      return { type: "closed" };
  }
};
