import { format, getDay } from "date-fns";
import { isHoliday, hasHolidayInWeek } from "@/utils/holidayUtils";
import { getBasicSchedule } from "./basicScheduleUtils";
import { generateTimeSlots, getBasicTimeSlots } from "./timeSlotUtils";
import { getScheduleInfo } from "./scheduleInfoUtils";

interface SpecialScheduleData {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// This interface matches what the database actually returns
interface DatabaseScheduleData {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Keep the original interface for backward compatibility where needed
interface ScheduleData {
  id?: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Re-export all the utilities from the focused files
export { getBasicSchedule } from "./basicScheduleUtils";
export { generateTimeSlots, getBasicTimeSlots } from "./timeSlotUtils";
export { getScheduleInfo } from "./scheduleInfoUtils";
