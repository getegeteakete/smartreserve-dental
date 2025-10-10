
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarDay } from "./admin/calendar/CalendarDay";
import { CalendarLegend } from "./admin/calendar/CalendarLegend";
import { getScheduleInfo } from "./admin/calendar/utils/scheduleUtils";

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

export const BusinessCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<DatabaseScheduleData[]>([]);
  const [specialSchedules, setSpecialScheduleData] = useState<SpecialScheduleData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const currentMonth = selectedDate.getMonth() + 1;
      const currentYear = selectedDate.getFullYear();

      const { data: regularData } = await (supabase as any).rpc('get_clinic_schedules', {
        p_year: currentYear,
        p_month: currentMonth
      });

      const { data: specialData } = await (supabase as any).rpc('get_special_clinic_schedules', {
        p_year: currentYear,
        p_month: currentMonth
      });

      setSchedules(regularData || []);
      setSpecialScheduleData(specialData || []);
    } catch (error) {
      console.error("スケジュール取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const getDayModifiers = () => {
    const currentMonth = startOfMonth(selectedDate);
    const endMonth = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: currentMonth, end: endMonth });

    const fullOpenDays: Date[] = [];
    const partialOpenDays: Date[] = [];
    const closedDays: Date[] = [];
    const specialOpenDays: Date[] = [];

    monthDays.forEach(day => {
      const scheduleInfo = getScheduleInfo(day, specialSchedules, schedules);
      
      if (scheduleInfo.type === 'special-open') {
        specialOpenDays.push(day);
      } else if (scheduleInfo.type === 'full-open') {
        fullOpenDays.push(day);
      } else if (scheduleInfo.type === 'partial-open') {
        partialOpenDays.push(day);
      } else {
        closedDays.push(day);
      }
    });

    return { fullOpenDays, partialOpenDays, closedDays, specialOpenDays };
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const { fullOpenDays, partialOpenDays, closedDays, specialOpenDays } = getDayModifiers();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="border-2 border-gray-300 shadow-lg">
        <CardHeader className="text-center bg-gray-50 border-b-2 border-gray-200">
          <CardTitle className="text-xl">
            {format(selectedDate, 'yyyy年MM月', { locale: ja })} 営業日カレンダー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={() => {}}
              locale={ja}
              className="rounded-md mx-auto"
              modifiers={{
                fullOpen: fullOpenDays,
                partialOpen: partialOpenDays,
                closed: closedDays,
                specialOpen: specialOpenDays
              }}
              modifiersStyles={{
                fullOpen: { 
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  border: '2px solid #0ea5e9',
                  fontWeight: 'bold'
                },
                partialOpen: {
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  border: '2px solid #f59e0b',
                  fontWeight: 'bold'
                },
                closed: { 
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '2px solid #ef4444',
                  fontWeight: 'bold'
                },
                specialOpen: {
                  backgroundColor: '#f3e8ff',
                  color: '#7c3aed',
                  border: '2px solid #8b5cf6',
                  fontWeight: 'bold'
                }
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const scheduleInfo = getScheduleInfo(date, specialSchedules, schedules);
                  
                  return (
                    <CalendarDay
                      {...props}
                      date={date}
                      displayMonth={displayMonth}
                      scheduleType={scheduleInfo.type}
                      displayText={scheduleInfo.displayText}
                      onClick={() => {}}
                    />
                  );
                }
              }}
              month={selectedDate}
              onMonthChange={handleMonthChange}
              styles={{
                table: { width: '100%', fontSize: '14px' },
                head_cell: { width: '14.2857%', textAlign: 'center', padding: '8px 4px', fontWeight: 'bold' },
                row: { display: 'flex', width: '100%', marginBottom: '4px' },
                cell: { 
                  width: '14.2857%', 
                  textAlign: 'center', 
                  padding: '2px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }}
            />
          </div>
          
          <CalendarLegend />
        </CardContent>
      </Card>
    </div>
  );
};
