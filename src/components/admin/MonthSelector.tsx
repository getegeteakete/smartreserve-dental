
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  onYearMonthChange: (year: number, month: number) => void;
}

export const MonthSelector = ({ 
  selectedYear, 
  selectedMonth, 
  onYearMonthChange 
}: MonthSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMonthName = (month: number) => {
    const monthNames = [
      "1月", "2月", "3月", "4月", "5月", "6月",
      "7月", "8月", "9月", "10月", "11月", "12月"
    ];
    return monthNames[month - 1];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>年月選択</CardTitle>
        <CardDescription>
          診療時間を設定する年月を選択してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">年</label>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => onYearMonthChange(parseInt(value), selectedMonth)}
            >
              <SelectTrigger>
                <SelectValue placeholder="年を選択" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium">月</label>
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(value) => onYearMonthChange(selectedYear, parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="月を選択" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {getMonthName(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
