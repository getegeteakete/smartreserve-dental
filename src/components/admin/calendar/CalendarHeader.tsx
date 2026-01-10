
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CalendarHeaderProps {
  selectedDate: Date;
  onMonthChange: (increment: number) => void;
  title?: string;
}

export const CalendarHeader = ({ selectedDate, onMonthChange, title }: CalendarHeaderProps) => {
  const defaultTitle = title || `${format(selectedDate, 'yyyy年MM月', { locale: ja })} スケジュール設定`;
  
  return (
    <CardHeader className="text-center bg-gray-50 border-b-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMonthChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl">
          {defaultTitle}
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMonthChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};
