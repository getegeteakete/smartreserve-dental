import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getScheduleInfo } from "@/components/admin/calendar/utils/scheduleInfoUtils";

interface ScheduleInfo {
  date: Date;
  dayName: string;
  hours: string[] | string;
  isOpen: boolean;
  isSpecial?: boolean;
  specialText?: string;
}

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
      
      let schedules: DatabaseScheduleData[] = [];
      let specialSchedules: SpecialScheduleData[] = [];
      
      // 通常のスケジュールを取得（RPC関数を使用）
      try {
        const { data, error: scheduleError } = await (supabase as any).rpc('get_clinic_schedules', {
          p_year: year,
          p_month: month
        });
        
        if (scheduleError) {
          console.error('診療時間取得エラー:', scheduleError);
        } else {
          schedules = (data || []) as DatabaseScheduleData[];
        }
      } catch (error) {
        console.error('診療時間取得エラー:', error);
      }
      
      // 特別スケジュールを取得
      try {
        const { data, error: specialError } = await (supabase as any).rpc('get_special_clinic_schedules', {
          p_year: year,
          p_month: month
        });
        
        if (specialError) {
          console.error('特別スケジュール取得エラー:', specialError);
        } else {
          specialSchedules = (data || []) as SpecialScheduleData[];
        }
      } catch (error) {
        console.error('特別スケジュール取得エラー:', error);
      }
      
      const schedule: ScheduleInfo[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(weekStart, i);
        
        try {
          // getScheduleInfoを使用してスケジュール情報を取得
          const scheduleInfo = getScheduleInfo(
            currentDate,
            specialSchedules,
            schedules
          );
          
          const isOpen = scheduleInfo.type === 'saturday-open' || 
                        scheduleInfo.type === 'special-open' || 
                        scheduleInfo.type === 'full-open' || 
                        scheduleInfo.type === 'partial-open' ||
                        scheduleInfo.type === 'morning-closed';
          
          // 重複を排除して時間帯を取得
          const uniqueSchedules = scheduleInfo.schedules && scheduleInfo.schedules.length > 0
            ? Array.from(new Set(scheduleInfo.schedules))
            : [];
          
          schedule.push({
            date: currentDate,
            dayName: format(currentDate, "EEE", { locale: ja }),
            hours: uniqueSchedules.length > 0 ? uniqueSchedules : [],
            isOpen: isOpen,
            isSpecial: scheduleInfo.type === 'special-open' || scheduleInfo.type === 'special-closed',
            specialText: scheduleInfo.displayText && scheduleInfo.displayText !== '' 
              ? scheduleInfo.displayText 
              : undefined,
          });
        } catch (error) {
          console.error(`日付 ${format(currentDate, 'yyyy-MM-dd')} のスケジュール取得エラー:`, error);
          // エラーが発生した場合でも、デフォルトのスケジュールを追加
          schedule.push({
            date: currentDate,
            dayName: format(currentDate, "EEE", { locale: ja }),
            hours: [],
            isOpen: false,
            isSpecial: false,
            specialText: undefined,
          });
        }
      }
      
      setWeekSchedule(schedule);
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
      // エラーが発生した場合でも、空のスケジュールを設定して表示する
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const defaultSchedule: ScheduleInfo[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(weekStart, i);
        defaultSchedule.push({
          date: currentDate,
          dayName: format(currentDate, "EEE", { locale: ja }),
          hours: [],
          isOpen: false,
          isSpecial: false,
          specialText: undefined,
        });
      }
      
      setWeekSchedule(defaultSchedule);
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

  // weekScheduleが空の場合のデフォルト表示
  if (weekSchedule.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">今週の診療カレンダー</h3>
        <div className="text-center py-8 text-gray-500">
          スケジュールデータを読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-2 md:p-3 lg:p-4 shadow-sm">
      {/* タイトル */}
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">今週の診療カレンダー</h3>
      
      {/* 週間スケジュール */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2">
        {weekSchedule.map((day, index) => {
          const hoursArray = Array.isArray(day.hours) ? day.hours : [day.hours];
          const hoursDisplay = hoursArray.length > 0 && hoursArray[0] !== '' 
            ? hoursArray 
            : [];
          
          return (
            <div
              key={index}
              className={`
                rounded-lg border-2 p-2 sm:p-2 md:p-3 text-center min-h-[130px] sm:min-h-[110px] md:min-h-[90px] flex flex-col items-center justify-center
                ${day.isOpen 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
                }
              `}
            >
              {/* 日付と曜日 */}
              <div className="text-base sm:text-sm font-bold text-gray-800 mb-1">
                {format(day.date, "M/d")}
              </div>
              <div className="text-sm sm:text-sm text-gray-600 mb-2 sm:mb-2">
                ({day.dayName})
              </div>
              
              {/* 営業時間 or 休診 */}
              {day.isOpen ? (
                <div className="flex flex-col items-center justify-center w-full px-1">
                  {hoursDisplay.length > 0 ? (
                    <div className="text-sm sm:text-xs font-semibold text-green-700 space-y-1.5 sm:space-y-0.5 w-full">
                      {hoursDisplay.map((hour, idx) => (
                        <div key={idx} className="leading-relaxed sm:leading-tight break-words">
                          {hour}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs sm:text-xs text-gray-500">
                      営業時間未設定
                    </div>
                  )}
                  {day.specialText && (
                    <div className="text-xs sm:text-xs text-gray-600 mt-2 sm:mt-1 font-medium">
                      {day.specialText}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-base sm:text-sm text-gray-700 font-bold">
                  休診
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyBusinessCalendar;

