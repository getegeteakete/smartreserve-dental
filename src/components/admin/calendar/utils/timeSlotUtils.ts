
import { hasHolidayInWeek } from "@/utils/holidayUtils";
import { getBasicSchedule } from "./basicScheduleUtils";

export const generateTimeSlots = (startTime: string, endTime: string) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const nextMin = currentMin + 30;
    const nextHour = nextMin >= 60 ? currentHour + 1 : currentHour;
    const adjustedNextMin = nextMin >= 60 ? nextMin - 60 : nextMin;
    
    if (nextHour < endHour || (nextHour === endHour && adjustedNextMin <= endMin)) {
      slots.push({
        start: `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`,
        end: `${nextHour.toString().padStart(2, '0')}:${adjustedNextMin.toString().padStart(2, '0')}`
      });
    }
    
    currentMin = adjustedNextMin;
    currentHour = nextHour;
  }
  
  return slots;
};

export const getBasicTimeSlots = (dayOfWeek: number, date?: Date) => {
  const basicSchedule = getBasicSchedule(dayOfWeek, date);
  const slots = [];
  
  // 木曜日で祝日がある週の場合
  if (dayOfWeek === 4 && date && hasHolidayInWeek(date)) {
    slots.push(...generateTimeSlots("10:00", "13:30"));
    slots.push(...generateTimeSlots("15:00", "19:00"));
    return slots;
  }
  
  if (basicSchedule.type === "afternoon") {
    slots.push(...generateTimeSlots("15:00", "19:00"));
  } else if (basicSchedule.type === "full") {
    slots.push(...generateTimeSlots("10:00", "13:30"));
    slots.push(...generateTimeSlots("15:00", "19:00"));
  } else if (basicSchedule.type === "saturday") {
    // 土曜日の診療時間を正確に設定：9:00～12:30 / 14:00～17:30
    slots.push(...generateTimeSlots("9:00", "12:30"));
    slots.push(...generateTimeSlots("14:00", "17:30"));
  }
  
  // 日曜日の場合は日曜診療用のスロットを返す
  if (dayOfWeek === 0) {
    slots.push(...generateTimeSlots("9:00", "12:30"));
    slots.push(...generateTimeSlots("14:00", "17:30"));
  }
  
  return slots;
};
