
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SpecialScheduleData {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface SpecialScheduleManagerProps {
  specialSchedules: SpecialScheduleData[];
  onAdd: (date: Date, timeSlot: string) => Promise<void>;
  onToggle: (scheduleId: string, isAvailable: boolean) => Promise<void>;
  onDelete: (scheduleId: string) => Promise<void>;
}

export const SpecialScheduleManager = ({ specialSchedules, onAdd, onToggle, onDelete }: SpecialScheduleManagerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loadingScheduleId, setLoadingScheduleId] = useState<string | null>(null);

  // 10:00-20:00の30分刻みの時間スロットを生成
  const timeSlots = [];
  for (let hour = 10; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      timeSlots.push({ start: startTime, end: endTime });
    }
  }

  const handleAdd = async () => {
    if (!selectedDate || !selectedTime || isAdding) {
      console.log("追加処理をスキップ:", { selectedDate, selectedTime, isAdding });
      return;
    }

    setIsAdding(true);
    try {
      console.log("特別営業日追加処理開始:", { selectedDate, selectedTime });
      await onAdd(selectedDate, selectedTime);
      console.log("特別営業日追加成功");
      setSelectedDate(undefined);
      setSelectedTime("");
    } catch (error) {
      console.error("特別営業日追加エラー:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (scheduleId: string, isAvailable: boolean) => {
    if (loadingScheduleId) return;
    
    setLoadingScheduleId(scheduleId);
    try {
      await onToggle(scheduleId, isAvailable);
    } catch (error) {
      console.error("特別営業日更新エラー:", error);
    } finally {
      setLoadingScheduleId(null);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (loadingScheduleId) return;
    
    setLoadingScheduleId(scheduleId);
    try {
      await onDelete(scheduleId);
    } catch (error) {
      console.error("特別営業日削除エラー:", error);
      setLoadingScheduleId(null);
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            特別営業日設定
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>通常の曜日設定とは別に、特定の日付での<br/>
                診療時間を設定できます。祝日や臨時営業に便利です。</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            通常の曜日設定とは別に、特定の日付での診療時間を設定できます。特別営業日の設定は通常の曜日設定より優先されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">新しい特別営業日を追加</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>例：祝日に診療する場合や、通常休みの日に<br/>
                  特別に営業する場合に使用します。</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="special-date">営業日</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isAdding}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={ja}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>特別に営業したい日付を選択してください</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="w-40">
                <Label htmlFor="special-time">時間（30分刻み）</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={selectedTime} onValueChange={setSelectedTime} disabled={isAdding}>
                      <SelectTrigger>
                        <SelectValue placeholder="時間選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((timeSlot) => (
                          <SelectItem key={timeSlot.start} value={timeSlot.start}>
                            {timeSlot.start} - {timeSlot.end}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>営業する時間帯を選択してください<br/>（10:00-20:00、30分刻み）</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleAdd} 
                    disabled={!selectedDate || !selectedTime || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        追加中...
                      </>
                    ) : (
                      "追加"
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>日付と時間を選択後、クリックして<br/>
                  特別営業日を追加します</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">設定済み特別営業日</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>設定済みの特別営業日の一覧です。<br/>
                  利用可能のチェックを外すと休業にできます。</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>時間</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      利用可能
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>チェックを外すと、その時間は<br/>
                          予約不可になります</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      操作
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>不要になった特別営業日を<br/>
                          削除できます</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {format(new Date(schedule.specific_date), "yyyy年MM月dd日", { locale: ja })}
                    </TableCell>
                    <TableCell>
                      {schedule.start_time} - {schedule.end_time}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={schedule.is_available}
                        onCheckedChange={(checked) => 
                          handleToggle(schedule.id, checked as boolean)
                        }
                        disabled={loadingScheduleId === schedule.id}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                            disabled={loadingScheduleId === schedule.id}
                          >
                            {loadingScheduleId === schedule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>この特別営業日を削除します</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
