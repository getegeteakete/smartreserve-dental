
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarHeader } from "@/components/admin/calendar/CalendarHeader";
import { CalendarLegend } from "@/components/admin/calendar/CalendarLegend";
import { CalendarDay } from "@/components/admin/calendar/CalendarDay";
import { getScheduleInfo } from "@/components/admin/calendar/utils/scheduleInfoUtils";
import { getMonthlyBusinessDays, formatBusinessDaysDisplay } from "@/utils/businessDayDisplay";

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

export const BusinessCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<DatabaseScheduleData[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessDaysInfo, setBusinessDaysInfo] = useState<any[]>([]);
  const [modifiers, setModifiers] = useState<{ business: Date[]; saturday: Date[]; closed: Date[] }>({
    business: [],
    saturday: [],
    closed: []
  });

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  useEffect(() => {
    if (schedules.length >= 0 && specialSchedules.length >= 0) {
      updateModifiers();
      // 診療日情報を更新
      const businessDays = getMonthlyBusinessDays(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      const formattedInfo = formatBusinessDaysDisplay(businessDays);
      setBusinessDaysInfo(formattedInfo);
    }
  }, [schedules, specialSchedules, selectedDate]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      // 通常のスケジュールを取得
      const { data: regularData } = await (supabase as any).rpc('get_clinic_schedules', {
        p_year: year,
        p_month: month
      });
      
      // 特別スケジュールを取得
      const { data: specialData } = await (supabase as any).rpc('get_special_clinic_schedules', {
        p_year: year,
        p_month: month
      });
      
      setSchedules(regularData || []);
      setSpecialSchedules(specialData || []);
    } catch (error) {
      console.error("スケジュール取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateModifiers = () => {
    const currentMonth = startOfMonth(selectedDate);
    const endMonth = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: currentMonth, end: endMonth });

    const businessDays: Date[] = [];
    const saturdayDays: Date[] = [];
    const closedDays: Date[] = [];

    monthDays.forEach(day => {
      const scheduleInfo = getScheduleInfo(day, specialSchedules, schedules);
      
      // 土曜営業を分離
      if (scheduleInfo.type === 'saturday-open') {
        saturdayDays.push(day);
      }
      // 通常診療日（special-open, full-open, partial-open, morning-closed等）
      else if (scheduleInfo.type === 'special-open' || 
          scheduleInfo.type === 'full-open' || 
          scheduleInfo.type === 'partial-open' ||
          scheduleInfo.type === 'morning-closed') {
        businessDays.push(day);
      } else {
        closedDays.push(day);
      }
    });

    setModifiers({ business: businessDays, saturday: saturdayDays, closed: closedDays });
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const { business: businessDays, saturday: saturdayDays, closed: closedDays } = modifiers;


  if (loading) {
    return <div className="text-center py-4">カレンダーを読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <CalendarHeader 
        selectedDate={selectedDate}
        onMonthChange={handleMonthChange}
      />
      
      {/* 診療日一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>今月の診療日</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessDaysInfo.map((info) => (
              <div key={info.type} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`w-4 h-4 rounded-full ${info.color.bg} ${info.color.border} border-2`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{info.label}</div>
                  <div className="text-sm text-gray-600">{info.displayText}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {info.days.length}日
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
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
              business: businessDays,
              saturday: saturdayDays,
              closed: closedDays,
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
  );
};
