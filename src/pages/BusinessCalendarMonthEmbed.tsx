import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarHeader } from "@/components/admin/calendar/CalendarHeader";
import { CalendarLegend } from "@/components/admin/calendar/CalendarLegend";
import { CalendarDay } from "@/components/admin/calendar/CalendarDay";
import { supabase } from "@/integrations/supabase/client";
import { getScheduleInfo } from "@/components/admin/calendar/utils/scheduleInfoUtils";

interface DatabaseScheduleData {
  id?: string;
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

const BusinessCalendarMonthEmbed = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<DatabaseScheduleData[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiers, setModifiers] = useState<{ business: Date[]; saturday: Date[]; closed: Date[] }>({
    business: [],
    saturday: [],
    closed: []
  });

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  useEffect(() => {
    if (!loading) {
      updateModifiers();
    }
  }, [schedules, specialSchedules, selectedDate, loading]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      let regularData: DatabaseScheduleData[] = [];
      let specialData: SpecialScheduleData[] = [];
      
      // 通常のスケジュールを取得
      try {
        const { data, error } = await (supabase as any).rpc('get_clinic_schedules', {
          p_year: year,
          p_month: month
        });
        
        if (error) {
          console.error('診療時間取得エラー:', error);
        } else {
          regularData = (data || []) as DatabaseScheduleData[];
        }
      } catch (error) {
        console.error('診療時間取得エラー:', error);
      }
      
      // 特別スケジュールを取得
      try {
        const { data, error } = await (supabase as any).rpc('get_special_clinic_schedules', {
          p_year: year,
          p_month: month
        });
        
        if (error) {
          console.error('特別スケジュール取得エラー:', error);
        } else {
          specialData = (data || []) as SpecialScheduleData[];
        }
      } catch (error) {
        console.error('特別スケジュール取得エラー:', error);
      }
      
      setSchedules(regularData);
      setSpecialSchedules(specialData);
    } catch (error) {
      console.error("スケジュール取得エラー:", error);
      setSchedules([]);
      setSpecialSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const updateModifiers = () => {
    try {
      const currentMonth = startOfMonth(selectedDate);
      const endMonth = endOfMonth(selectedDate);
      const monthDays = eachDayOfInterval({ start: currentMonth, end: endMonth });

      const businessDays: Date[] = [];
      const saturdayDays: Date[] = [];
      const closedDays: Date[] = [];

      monthDays.forEach(day => {
        try {
          const scheduleInfo = getScheduleInfo(day, specialSchedules, schedules);
          
          // 土曜営業を分離
          if (scheduleInfo.type === 'saturday-open') {
            saturdayDays.push(day);
          }
          // 通常診療日
          else if (scheduleInfo.type === 'special-open' || 
              scheduleInfo.type === 'full-open' || 
              scheduleInfo.type === 'partial-open' ||
              scheduleInfo.type === 'morning-closed') {
            businessDays.push(day);
          } else {
            closedDays.push(day);
          }
        } catch (error) {
          console.error(`日付 ${format(day, 'yyyy-MM-dd')} のスケジュール取得エラー:`, error);
          closedDays.push(day);
        }
      });

      setModifiers({ business: businessDays, saturday: saturdayDays, closed: closedDays });
    } catch (error) {
      console.error('updateModifiers エラー:', error);
      // エラーが発生した場合でも空のmodifiersを設定
      setModifiers({ business: [], saturday: [], closed: [] });
    }
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const { business: businessDays, saturday: saturdayDays, closed: closedDays } = modifiers;

  if (loading) {
    return (
      <div className="bg-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">診療カレンダーを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="w-full space-y-4">
        <CalendarHeader 
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
        />
        
        <CalendarLegend />
        
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={() => {}}
              month={selectedDate}
              onMonthChange={(month) => {
                setSelectedDate(month);
              }}
              locale={ja}
              modifiers={{
                business: businessDays || [],
                saturday: saturdayDays || [],
                closed: closedDays || [],
              }}
              modifiersStyles={{
                business: { 
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  border: '2px solid #3b82f6',
                  fontWeight: 'bold'
                },
                saturday: { 
                  backgroundColor: '#fed7aa',
                  color: '#c2410c',
                  border: '2px solid #fb923c',
                  fontWeight: 'bold'
                },
                closed: { 
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '2px solid #ef4444',
                  fontWeight: 'bold'
                },
              }}
              components={{
                Day: ({ date, ...props }) => {
                  const scheduleInfo = getScheduleInfo(date, specialSchedules, schedules);
                  return (
                    <CalendarDay 
                      date={date} 
                      displayMonth={selectedDate}
                      scheduleType={scheduleInfo.type}
                      displayText={scheduleInfo.displayText}
                      onClick={() => {}}
                      {...props}
                    />
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessCalendarMonthEmbed;

