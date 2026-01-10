
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CalendarDayProps {
  date: Date;
  displayMonth: Date;
  scheduleType: string;
  displayText: string;
  memo?: string;
  onClick: (date: Date) => void;
}

export const CalendarDay = ({ 
  date, 
  displayMonth, 
  scheduleType, 
  displayText, 
  memo,
  onClick 
}: CalendarDayProps) => {
  const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
  const dateString = format(date, 'yyyy-MM-dd');
  
  // デバッグログ（1月8日のみ）
  if (dateString.includes('-01-08')) {
    console.log('[CalendarDay] 1月8日の表示情報:', {
      dateString,
      scheduleType,
      displayText,
      isCurrentMonth
    });
  }
  
  let dayStyle = "w-12 h-12 text-sm flex flex-col items-center justify-center rounded-md border-2 cursor-pointer transition-all hover:shadow-md ";
  
  if (!isCurrentMonth) {
    dayStyle += "text-gray-300 bg-gray-50 border-gray-200 ";
  } else {
    switch (scheduleType) {
      case 'full-open':
        dayStyle += "bg-blue-50 text-blue-700 border-blue-400 hover:bg-blue-100 ";
        break;
      case 'partial-open':
        dayStyle += "bg-amber-50 text-amber-700 border-amber-400 hover:bg-amber-100 ";
        break;
      case 'special-open':
        dayStyle += "bg-purple-50 text-purple-700 border-purple-400 hover:bg-purple-100 ";
        break;
      case 'saturday-open':
        dayStyle += "bg-orange-50 text-orange-700 border-orange-400 hover:bg-orange-100 ";
        break;
      default:
        dayStyle += "bg-red-50 text-red-700 border-red-400 hover:bg-red-100 ";
        break;
    }
  }

  return (
    <div className="relative">
      <button
        className={dayStyle}
        style={{ 
          // modifiersStylesの上書きを防ぐため、!importantを使用
          backgroundColor: 'inherit',
          color: 'inherit',
          border: 'inherit'
        }}
        onClick={(e) => {
          e.preventDefault();
          if (isCurrentMonth) {
            onClick(date);
          }
        }}
        disabled={!isCurrentMonth}
      >
        <span className="text-base font-medium">{date.getDate()}</span>
        {isCurrentMonth && displayText && (
          <span className="text-[9px] leading-tight mt-0.5 px-1 rounded text-center">
            {displayText}
          </span>
        )}
      </button>
      {memo && isCurrentMonth && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">📝</span>
        </div>
      )}
    </div>
  );
};
