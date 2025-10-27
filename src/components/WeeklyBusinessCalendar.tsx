import { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ja } from "date-fns/locale";

interface ScheduleInfo {
  date: Date;
  dayName: string;
  hours: string;
  isOpen: boolean;
  isSpecial?: boolean;
  specialText?: string;
}

const WeeklyBusinessCalendar = () => {
  const [weekSchedule, setWeekSchedule] = useState<ScheduleInfo[]>([]);

  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日スタート
    
    const schedule: ScheduleInfo[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStart, i);
      const dayOfWeek = currentDate.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
      
      let hours = "";
      let isOpen = true;
      let specialText = "";
      
      // 曜日別の営業時間設定
      if (dayOfWeek === 0) {
        // 日曜日 - 休診
        isOpen = false;
      } else if (dayOfWeek === 4) {
        // 木曜日 - 休診
        isOpen = false;
      } else if (dayOfWeek === 6) {
        // 土曜日 - 午前のみ
        hours = "9:00-18:00";
        specialText = "午前のみ";
        isOpen = true;
      } else {
        // 月〜水、金 - 通常営業
        hours = "9:00-18:00";
        isOpen = true;
      }
      
      schedule.push({
        date: currentDate,
        dayName: format(currentDate, "EEE", { locale: ja }),
        hours: hours,
        isOpen: isOpen,
        isSpecial: dayOfWeek === 6,
        specialText: specialText
      });
    }
    
    setWeekSchedule(schedule);
  }, []);

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

