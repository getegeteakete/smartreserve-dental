import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarModifierStyles, getBusinessDayColors } from "@/utils/businessDayDisplay";
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
    if (schedules.length >= 0 && specialSchedules.length >= 0) {
      updateModifiers();
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
      // 通常診療日
      else if (scheduleInfo.type === 'special-open' || 
          scheduleInfo.type === 'full-open' || 
          scheduleInfo.type === 'partial-open' ||
          scheduleInfo.type === 'morning-closed') {
        businessDays.push(day);
      } else {
        closedDays.push(day);
      }
    });

    setModifiers({ businessDays, saturdayDays, closedDays });
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const modifierStyles = getCalendarModifierStyles();
  const colors = getBusinessDayColors();

  return (
    <div className="bg-white p-6">
      <div className="w-full space-y-6">
        {/* カレンダーヘッダー（タイトルなし、ナビゲーションのみ） */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(selectedDate, 'yyyy年MM月', { locale: ja })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* カレンダー */}
        <Card>
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={() => {}}
              locale={ja}
              className="rounded-md mx-auto"
            modifiers={{
              business: modifiers.business,
              saturday: modifiers.saturday,
              closed: modifiers.closed
            }}
            modifiersStyles={modifierStyles}
            components={{
              Day: ({ date, displayMonth, ...props }) => {
                const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
                const dayNumber = date.getDate();
                
                let dayType = 'closed';
                let dayLabel = '休み';
                
                if (modifiers.business.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) {
                  dayType = 'business';
                  dayLabel = '診療日';
                } else if (modifiers.saturday.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) {
                  dayType = 'saturday';
                  dayLabel = '土曜営業';
                } else if (modifiers.closed.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) {
                  dayType = 'closed';
                  dayLabel = '休み';
                }

                const colorClass = colors[dayType as keyof typeof colors];
                
                return (
                  <div
                    {...props}
                    className={`
                      w-12 h-12 text-sm flex flex-col items-center justify-center rounded-md border-2 cursor-pointer transition-all hover:shadow-md
                      ${isCurrentMonth ? `${colorClass.bg} ${colorClass.text} ${colorClass.border}` : 'text-gray-300 bg-gray-50 border-gray-200'}
                    `}
                  >
                    <span className="text-base font-medium">{dayNumber}</span>
                    {isCurrentMonth && (
                      <span className="text-[9px] leading-tight mt-0.5 px-1 rounded text-center">
                        {dayLabel}
                      </span>
                    )}
                  </div>
                );
              }
            }}
              month={selectedDate}
              onMonthChange={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* 凡例 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(colors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${color.bg} ${color.border} border-2`} />
                  <span className="text-sm text-gray-700">
                    {type === 'business' && '診療日'}
                    {type === 'saturday' && '土曜営業'}
                    {type === 'closed' && '休み'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessCalendarMonthEmbed;

