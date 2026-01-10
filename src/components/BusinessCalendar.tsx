
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
      
      console.log(`[BusinessCalendar] スケジュール取得開始: ${year}年${month}月`);
      
      let regularData: DatabaseScheduleData[] = [];
      let specialData: SpecialScheduleData[] = [];
      
      // 通常のスケジュールを取得（InteractiveBusinessCalendarと同じ方法）
      try {
        const { data, error } = await (supabase as any).rpc('get_clinic_schedules', {
          p_year: year,
          p_month: month
        });
        
        if (error) {
          console.error('[BusinessCalendar] 診療時間取得エラー:', error);
        } else {
          // DatabaseScheduleDataの形式に変換（InteractiveBusinessCalendarと同じ）
          regularData = (data || []).map((s: any) => ({
            id: s.id,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_available: s.is_available
          })) as DatabaseScheduleData[];
          console.log(`[BusinessCalendar] 通常スケジュール取得: ${regularData.length}件`, regularData);
        }
      } catch (error) {
        console.error('[BusinessCalendar] 診療時間取得エラー:', error);
      }
      
      // 特別スケジュールを取得（InteractiveBusinessCalendarと同じ方法で直接テーブルから取得）
      try {
        // RPC関数ではなく、InteractiveBusinessCalendarと同じように直接テーブルから取得
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const { data, error } = await supabase
          .from('special_clinic_schedules')
          .select('*')
          .gte('specific_date', format(startDate, 'yyyy-MM-dd'))
          .lte('specific_date', format(endDate, 'yyyy-MM-dd'));
        
        if (error) {
          console.error('[BusinessCalendar] 特別スケジュール取得エラー:', error);
        } else {
          specialData = (data || []) as SpecialScheduleData[];
          console.log(`[BusinessCalendar] 特別スケジュール取得: ${specialData.length}件`, specialData);
          
          // 1月8日のデータがあるか確認
          if (month === 1) {
            const jan8Data = specialData.find(s => s.specific_date === `${year}-01-08`);
            if (jan8Data) {
              console.log('[BusinessCalendar] 1月8日の特別スケジュール:', jan8Data);
            } else {
              console.log('[BusinessCalendar] 1月8日の特別スケジュールが見つかりません');
            }
          }
        }
      } catch (error) {
        console.error('[BusinessCalendar] 特別スケジュール取得エラー:', error);
      }
      
      setSchedules(regularData);
      setSpecialSchedules(specialData);
    } catch (error) {
      console.error("[BusinessCalendar] スケジュール取得エラー:", error);
      setSchedules([]);
      setSpecialSchedules([]);
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
      try {
        const dateString = format(day, 'yyyy-MM-dd');
        const scheduleInfo = getScheduleInfo(day, specialSchedules, schedules);
        
        // 1月8日のデバッグログ
        if (dateString.includes('-01-08')) {
          console.log(`[BusinessCalendar] 1月8日のスケジュール情報:`, {
            dateString,
            scheduleInfo,
            specialSchedulesForDate: specialSchedules.filter(s => s.specific_date === dateString),
            allSpecialSchedules: specialSchedules
          });
        }
        
        // 土曜営業を分離
        if (scheduleInfo.type === 'saturday-open') {
          saturdayDays.push(day);
        }
        // 通常診療日（special-openも含む）
        else if (scheduleInfo.type === 'special-open' || 
            scheduleInfo.type === 'full-open' || 
            scheduleInfo.type === 'partial-open' ||
            scheduleInfo.type === 'morning-closed') {
          businessDays.push(day);
        } else {
          closedDays.push(day);
        }
      } catch (error) {
        console.error(`[BusinessCalendar] 日付 ${format(day, 'yyyy-MM-dd')} のスケジュール取得エラー:`, error);
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
        title={`${format(selectedDate, 'yyyy年MM月', { locale: ja })} 診療日カレンダー`}
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
