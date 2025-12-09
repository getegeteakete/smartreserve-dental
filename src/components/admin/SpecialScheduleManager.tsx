
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  onRefresh?: () => Promise<void>;
}

export const SpecialScheduleManager = ({ specialSchedules, onAdd, onToggle, onDelete, onRefresh }: SpecialScheduleManagerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loadingScheduleId, setLoadingScheduleId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // 日曜日一括設定用の状態
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSundays, setSelectedSundays] = useState<string[]>([]);
  const [sundayStartTime, setSundayStartTime] = useState("09:00");
  const [sundayEndTime, setSundayEndTime] = useState("17:30");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

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

  // 選択した年月の日曜日を取得
  const sundaysInMonth = useMemo(() => {
    const firstDay = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    const lastDay = endOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
    return allDays.filter(day => getDay(day) === 0).map(day => format(day, 'yyyy-MM-dd'));
  }, [selectedYear, selectedMonth]);

  // 既に設定されている日曜日をチェック
  const existingSundaySchedules = useMemo(() => {
    return specialSchedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.specific_date);
        return getDay(scheduleDate) === 0 && 
               scheduleDate.getFullYear() === selectedYear &&
               scheduleDate.getMonth() + 1 === selectedMonth;
      })
      .map(schedule => schedule.specific_date);
  }, [specialSchedules, selectedYear, selectedMonth]);

  // 年と月の選択肢を生成
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 日曜日の一括追加処理
  const handleBulkAddSundays = async () => {
    if (selectedSundays.length === 0 || isBulkAdding) {
      return;
    }

    // 時間のバリデーション
    if (sundayStartTime >= sundayEndTime) {
      toast({
        title: "エラー",
        description: "開始時間は終了時間より前である必要があります。",
        variant: "destructive",
      });
      return;
    }

    setIsBulkAdding(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const sundayDate of selectedSundays) {
        // 既に設定されている場合はスキップ
        if (existingSundaySchedules.includes(sundayDate)) {
          continue;
        }

        try {
          // 直接RPCを呼び出してカスタム時間を設定
          const { error } = await (supabase as any).rpc('insert_special_clinic_schedule', {
            p_specific_date: sundayDate,
            p_start_time: sundayStartTime,
            p_end_time: sundayEndTime,
            p_is_available: true
          });

          if (error) {
            console.error(`日曜日 ${sundayDate} の設定エラー:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`日曜日 ${sundayDate} の設定エラー:`, error);
          errorCount++;
        }

        // 少し待機してから次の処理
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (successCount > 0) {
        toast({
          title: "設定完了",
          description: `${successCount}件の日曜日営業を設定しました。${errorCount > 0 ? `（${errorCount}件失敗）` : ''}`,
        });
        setSelectedSundays([]);
        // 親コンポーネントに再取得を促す
        if (onRefresh) {
          await onRefresh();
        }
      } else if (errorCount > 0) {
        toast({
          title: "エラー",
          description: `日曜日営業の設定に失敗しました。`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("日曜日一括追加エラー:", error);
      toast({
        title: "エラー",
        description: "日曜日営業の設定中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsBulkAdding(false);
    }
  };

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
          {/* 日曜日特別営業日設定セクション */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-blue-900">日曜日特別営業日設定</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>日曜日は特別営業日として設定できます。<br/>
                  年月を選択して、その月の日曜日から営業する日付を選んでください。</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mb-3 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-sm text-blue-800">
                <strong>※ 日曜日は特別営業日として設定されます。</strong><br/>
                通常の曜日設定とは別に、特定の日曜日を選んで営業時間を設定できます。
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="w-32">
                  <Label htmlFor="sunday-year">年</Label>
                  <Select 
                    value={selectedYear.toString()} 
                    onValueChange={(value) => {
                      setSelectedYear(parseInt(value));
                      setSelectedSundays([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="w-32">
                  <Label htmlFor="sunday-month">月</Label>
                  <Select 
                    value={selectedMonth.toString()} 
                    onValueChange={(value) => {
                      setSelectedMonth(parseInt(value));
                      setSelectedSundays([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {sundaysInMonth.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-base font-medium">その月の日曜日から営業する日付を選択（複数選択可）</Label>
                  <p className="text-xs text-gray-600 mb-3">
                    選択した日曜日が特別営業日として設定されます。
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sundaysInMonth.map(sunday => {
                      const isExisting = existingSundaySchedules.includes(sunday);
                      const isSelected = selectedSundays.includes(sunday);
                      const sundayDate = new Date(sunday);
                      const dayOfMonth = sundayDate.getDate();
                      const weekOfMonth = Math.ceil(dayOfMonth / 7);
                      const weekLabel = weekOfMonth === 1 ? '第1' : weekOfMonth === 2 ? '第2' : weekOfMonth === 3 ? '第3' : weekOfMonth === 4 ? '第4' : '第5';
                      
                      return (
                        <div 
                          key={sunday} 
                          className={`flex items-center space-x-2 p-3 border-2 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-blue-100 border-blue-400 shadow-sm' 
                              : isExisting 
                              ? 'bg-gray-50 border-gray-300 opacity-60' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isExisting) {
                              if (isSelected) {
                                setSelectedSundays(selectedSundays.filter(d => d !== sunday));
                              } else {
                                setSelectedSundays([...selectedSundays, sunday]);
                              }
                            }
                          }}
                        >
                          <Checkbox
                            id={`sunday-${sunday}`}
                            checked={isSelected}
                            disabled={isExisting}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSundays([...selectedSundays, sunday]);
                              } else {
                                setSelectedSundays(selectedSundays.filter(d => d !== sunday));
                              }
                            }}
                            className="pointer-events-none"
                          />
                          <Label 
                            htmlFor={`sunday-${sunday}`} 
                            className={`text-sm cursor-pointer flex-1 ${isExisting ? 'text-gray-400' : 'text-gray-700'}`}
                          >
                            <div className="font-medium">
                              {format(sundayDate, 'M月d日(E)', { locale: ja })}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {weekLabel}日曜日
                            </div>
                            {isExisting && (
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                (特別営業日設定済み)
                              </div>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-end gap-2 pt-2">
                    <div className="w-24">
                      <Label htmlFor="sunday-start">開始時間</Label>
                      <Input
                        id="sunday-start"
                        type="time"
                        value={sundayStartTime}
                        onChange={(e) => setSundayStartTime(e.target.value)}
                        disabled={isBulkAdding}
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor="sunday-end">終了時間</Label>
                      <Input
                        id="sunday-end"
                        type="time"
                        value={sundayEndTime}
                        onChange={(e) => setSundayEndTime(e.target.value)}
                        disabled={isBulkAdding}
                      />
                    </div>
                    <Button
                      onClick={handleBulkAddSundays}
                      disabled={selectedSundays.length === 0 || isBulkAdding}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isBulkAdding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          設定中...
                        </>
                      ) : (
                        `選択した日曜日を設定 (${selectedSundays.length}件)`
                      )}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>注意：</strong>既に特別営業日として設定済みの日曜日は選択できません。<br/>
                      削除してから再度設定する場合は、下の「設定済み特別営業日」一覧から削除してください。
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">この月に日曜日はありません。</p>
              )}
            </div>
          </div>

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
                {specialSchedules.map((schedule) => {
                  const scheduleDate = new Date(schedule.specific_date);
                  const isSunday = getDay(scheduleDate) === 0;
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {format(scheduleDate, "yyyy年MM月dd日", { locale: ja })}
                          {isSunday && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                              日曜日
                            </Badge>
                          )}
                        </div>
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
