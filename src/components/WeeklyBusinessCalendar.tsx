import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleInfo {
  date: Date;
  dayName: string;
  hours: string;
  isOpen: boolean;
  isSpecial?: boolean;
  specialText?: string;
}

interface ClinicSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const WeeklyBusinessCalendar = () => {
  const [weekSchedule, setWeekSchedule] = useState<ScheduleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklySchedule();
  }, []);

  const loadWeeklySchedule = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      
      // データベースから現在の月の診療時間を取得
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      
      const { data: schedules, error } = await supabase
        .from('clinic_schedules')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('day_of_week', { ascending: true });
      
      if (error) {
        console.error('診療時間取得エラー:', error);
      }
      
      const scheduleMap = new Map<number, ClinicSchedule[]>();
      schedules?.forEach((schedule: ClinicSchedule) => {
        if (!scheduleMap.has(schedule.day_of_week)) {
          scheduleMap.set(schedule.day_of_week, []);
        }
        scheduleMap.get(schedule.day_of_week)!.push(schedule);
      });
      
      const schedule: ScheduleInfo[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(weekStart, i);
        const dayOfWeek = currentDate.getDay();
        
        // データベースから営業時間を取得
        const daySchedules = scheduleMap.get(dayOfWeek) || [];
        const availableSchedules = daySchedules.filter(s => s.is_available);
        
        if (availableSchedules.length === 0) {
          schedule.push({
            date: currentDate,
            dayName: format(currentDate, "EEE", { locale: ja }),
            hours: "",
            isOpen: false,
          });
          continue;
        }
        
        // 営業時間をフォーマット
        const hoursList = availableSchedules.map(s => 
          `${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`
        );
        const hours = hoursList.join(" / ");
        
        schedule.push({
          date: currentDate,
          dayName: format(currentDate, "EEE", { locale: ja }),
          hours: hours,
          isOpen: true,
        });
      }
      
      setWeekSchedule(schedule);
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">診療時間を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* タイトル */}
      <h3 className="text-lg font-bold text-gray-900 mb-6">今週の診療カレンダー</h3>
      
      {/* 週間スケジュール */}
      <div className="grid grid-cols-7 gap-2">
        {weekSchedule.map((day, index) => (
          <div
            key={index}
            className={`
              rounded-lg border-2 p-3 text-center min-h-[100px] flex flex-col items-center justify-center
              ${day.isOpen 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
              }
            `}
          >
            {/* 日付と曜日 */}
            <div className="text-sm font-medium text-gray-800 mb-2">
              {format(day.date, "M/d")}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              ({day.dayName})
            </div>
            
            {/* 営業時間 or 休診 */}
            {day.isOpen ? (
              <>
                <div className="text-xs font-medium text-green-700 mb-1">
                  {day.hours}
                </div>
                {day.specialText && (
                  <div className="text-xs text-gray-700 mt-1">
                    {day.specialText}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-700 font-medium">
                休診
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 注意書き */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        ※診療時間は変更になる場合がございます。詳しくはお電話でご確認ください。
      </p>
    </div>
  );
};

export default WeeklyBusinessCalendar;

