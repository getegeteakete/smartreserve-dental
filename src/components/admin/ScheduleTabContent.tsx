
import { InteractiveBusinessCalendar } from "./InteractiveBusinessCalendar";

interface ScheduleData {
  id?: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleTabContentProps {
  selectedYear: number;
  selectedMonth: number;
  schedules: ScheduleData[];
  loading: boolean;
  onYearMonthChange: (year: number, month: number) => void;
  onScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleAdd: (selectedDate: Date, selectedTime: string) => Promise<void>;
  onSpecialScheduleDelete: (scheduleId: string) => Promise<void>;
  targetRefs: {
    monthSelector: React.RefObject<HTMLDivElement>;
  };
}

export const ScheduleTabContent = ({
  selectedYear,
  selectedMonth,
  schedules,
  loading,
  onYearMonthChange,
  onScheduleChange,
  onSpecialScheduleAdd,
  onSpecialScheduleDelete,
  targetRefs
}: ScheduleTabContentProps) => {
  return (
    <div className="space-y-6">
      {/* カレンダーのみの表示 */}
      <div className="flex flex-col">
        <div className="flex justify-center">
          <InteractiveBusinessCalendar
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            schedules={schedules}
            onYearMonthChange={onYearMonthChange}
            onScheduleChange={onScheduleChange}
            onSpecialScheduleAdd={onSpecialScheduleAdd}
            onSpecialScheduleDelete={onSpecialScheduleDelete}
          />
        </div>
      </div>
    </div>
  );
};
