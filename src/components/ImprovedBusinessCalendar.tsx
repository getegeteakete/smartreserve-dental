import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  getMonthlyBusinessDays, 
  formatBusinessDaysDisplay, 
  getCalendarModifiers, 
  getCalendarModifierStyles,
  getBusinessDayColors 
} from '@/utils/businessDayDisplay';

interface ImprovedBusinessCalendarProps {
  className?: string;
}

export const ImprovedBusinessCalendar = ({ className }: ImprovedBusinessCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [businessDaysInfo, setBusinessDaysInfo] = useState<any[]>([]);

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    
    const businessDays = getMonthlyBusinessDays(year, month);
    const formattedInfo = formatBusinessDaysDisplay(businessDays);
    setBusinessDaysInfo(formattedInfo);
  }, [selectedDate]);

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const modifiers = getCalendarModifiers(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
  const modifierStyles = getCalendarModifierStyles();
  const colors = getBusinessDayColors();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* カレンダーヘッダー */}
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

      {/* 営業日一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>今月の営業日</CardTitle>
          <CardDescription>
            {format(selectedDate, 'yyyy年MM月', { locale: ja })}の営業日一覧
          </CardDescription>
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

      {/* カレンダー */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={() => {}}
            locale={ja}
            className="rounded-md mx-auto"
            modifiers={modifiers}
            modifiersStyles={modifierStyles}
            components={{
              Day: ({ date, displayMonth, ...props }) => {
                const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
                const dayNumber = date.getDate();
                
                let dayType = 'closed';
                let dayLabel = '休み';
                
                if (modifiers.business.some(d => d.getDate() === dayNumber)) {
                  dayType = 'business';
                  dayLabel = '営業日';
                } else if (modifiers.closed.some(d => d.getDate() === dayNumber)) {
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
        <CardHeader>
          <CardTitle className="text-lg">凡例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(colors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${color.bg} ${color.border} border-2`} />
                <span className="text-sm text-gray-700">
                  {type === 'business' && '営業日'}
                  {type === 'closed' && '休み'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
