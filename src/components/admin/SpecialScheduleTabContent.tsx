
import { SpecialScheduleManager } from "./SpecialScheduleManager";
import { InteractiveBusinessCalendar } from "./InteractiveBusinessCalendar";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleData {
  id?: string;
  year: number;
  month: number;
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

interface SpecialScheduleTabContentProps {
  selectedYear: number;
  selectedMonth: number;
  schedules: ScheduleData[];
  specialSchedules: SpecialScheduleData[];
  onYearMonthChange: (year: number, month: number) => void;
  onScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleAdd: (selectedDate: Date, selectedTime: string) => Promise<void>;
  onSpecialScheduleToggle: (scheduleId: string, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleDelete: (scheduleId: string) => Promise<void>;
}

export const SpecialScheduleTabContent = ({
  selectedYear,
  selectedMonth,
  schedules,
  specialSchedules,
  onYearMonthChange,
  onScheduleChange,
  onSpecialScheduleAdd,
  onSpecialScheduleToggle,
  onSpecialScheduleDelete
}: SpecialScheduleTabContentProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
        <div>
          <SpecialScheduleManager
            specialSchedules={specialSchedules}
            onAdd={onSpecialScheduleAdd}
            onToggle={onSpecialScheduleToggle}
            onDelete={onSpecialScheduleDelete}
          />
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-4">営業日カレンダープレビュー</h3>
          <div className="flex-1 flex items-start justify-center">
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
    </div>
  );
};
