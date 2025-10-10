
import { TimeSlot } from "@/types/schedule";

export const generateTimeSlots = (): TimeSlot[] => {
  const timeSlots = [];
  
  // 9:00-19:00の30分刻みの時間スロットを生成
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      timeSlots.push({ start: startTime, end: endTime });
    }
  }
  
  return timeSlots;
};
