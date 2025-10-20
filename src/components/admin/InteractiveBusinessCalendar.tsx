import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarLegend } from "./calendar/CalendarLegend";
import { ScheduleDialog } from "./calendar/ScheduleDialog";
import { DailyScheduleEditor } from "./calendar/DailyScheduleEditor";
import { CalendarDay } from "./calendar/CalendarDay";
import { getScheduleInfo, generateTimeSlots, getBasicTimeSlots } from "./calendar/utils/scheduleUtils";
import { useSundayScheduleOperations } from "@/hooks/schedule/useSundayScheduleOperations";
import { 
  getMonthlyBusinessDays, 
  formatBusinessDaysDisplay, 
  getCalendarModifiers, 
  getCalendarModifierStyles,
  getBusinessDayColors 
} from "@/utils/businessDayDisplay";

interface ScheduleData {
  id?: string;
  year: number;
  month: number;
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

interface InteractiveBusinessCalendarProps {
  selectedYear: number;
  selectedMonth: number;
  schedules: ScheduleData[];
  onYearMonthChange: (year: number, month: number) => void;
  onScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleAdd: (selectedDate: Date, selectedTime: string) => Promise<void>;
  onSpecialScheduleDelete: (scheduleId: string) => Promise<void>;
}

export const InteractiveBusinessCalendar = ({ 
  selectedYear, 
  selectedMonth,
  schedules,
  onYearMonthChange,
  onScheduleChange,
  onSpecialScheduleAdd, 
  onSpecialScheduleDelete 
}: InteractiveBusinessCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(selectedYear, selectedMonth - 1));
  const [specialSchedules, setSpecialScheduleData] = useState<SpecialScheduleData[]>([]);
  const [dailyMemos, setDailyMemos] = useState<Array<{date: string, memo: string}>>([]);
  const [businessDaysInfo, setBusinessDaysInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showDailyEditor, setShowDailyEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // UI強制更新用のキー
  const { toast } = useToast();
  const operationInProgress = useRef(false);

  // 年月限定のスケジュール変更関数
  const onScheduleChangeWithYearMonth = async (
    year: number,
    month: number,
    dayOfWeek: number, 
    timeSlot: { start: string; end: string }, 
    isAvailable: boolean
  ) => {
    try {
      console.log(`スケジュール変更開始: ${year}年${month}月 曜日${dayOfWeek} ${timeSlot.start}-${timeSlot.end} -> ${isAvailable}`);
      
      // 親コンポーネントのonScheduleChange関数を使用
      await onScheduleChange(dayOfWeek, timeSlot, isAvailable);
      
      console.log("スケジュール変更成功");
      return true;
    } catch (error) {
      console.error("スケジュール変更処理エラー:", error);
      throw error;
    }
  };

  // スケジュール再取得用の関数
  const fetchAllScheduleData = async () => {
    console.log("全スケジュールデータ再取得開始");
    await fetchSpecialSchedules();
    await fetchDailyMemos();
    // UI強制更新
    setRefreshKey(prev => prev + 1);
    console.log("全スケジュールデータ再取得完了");
  };

  const { handleSundayScheduleSetup } = useSundayScheduleOperations(
    onScheduleChange,
    fetchAllScheduleData,
    onSpecialScheduleAdd,
    onSpecialScheduleDelete
  );

  const fetchSpecialSchedules = async () => {
    try {
      console.log(`特別スケジュール取得: ${selectedYear}年${selectedMonth}月`);
      const { data: specialData } = await (supabase as any).rpc('get_special_clinic_schedules', {
        p_year: selectedYear,
        p_month: selectedMonth
      });

      console.log("特別スケジュール取得結果:", specialData);
      setSpecialScheduleData(specialData || []);
    } catch (error) {
      console.error("特別スケジュール取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyMemos = async () => {
    try {
      console.log(`メモ取得: ${selectedYear}年${selectedMonth}月`);
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      const { data: memosData, error } = await supabase
        .from('daily_memos')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (error) {
        console.error("メモ取得エラー:", error);
      } else {
        console.log("メモ取得結果:", memosData);
        setDailyMemos(memosData || []);
      }
    } catch (error) {
      console.error("メモ取得エラー:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect: 選択年月変更:", selectedYear, selectedMonth);
    const newDate = new Date(selectedYear, selectedMonth - 1);
    setSelectedDate(newDate);
    fetchSpecialSchedules();
    fetchDailyMemos();
  }, [selectedYear, selectedMonth]);

  // 営業日情報を更新
  useEffect(() => {
    const businessDays = getMonthlyBusinessDays(selectedYear, selectedMonth);
    const formattedInfo = formatBusinessDaysDisplay(businessDays);
    setBusinessDaysInfo(formattedInfo);
  }, [selectedYear, selectedMonth]);

  const handleSpecialScheduleToggle = async (scheduleId: string, isAvailable: boolean) => {
    if (operationInProgress.current) {
      console.log("操作が既に進行中です。スキップします。");
      return;
    }

    try {
      operationInProgress.current = true;
      console.log("特別診療日更新処理開始:", scheduleId, isAvailable);
      
      const { error } = await (supabase as any).rpc('update_special_clinic_schedule', {
        p_id: scheduleId,
        p_is_available: isAvailable
      });

      if (error) {
        console.error("特別診療日更新エラー:", error);
        throw error;
      }

      console.log("特別診療日更新成功");
      await fetchSpecialSchedules();
      
      toast({
        title: "更新完了",
        description: "特別診療日が更新されました",
      });
    } catch (error: any) {
      console.error("特別診療日更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `特別診療日の更新に失敗しました: ${error.message}`,
      });
    } finally {
      operationInProgress.current = false;
    }
  };

  const getHasSpecialSchedule = (date?: Date) => {
    const targetDate = date || clickedDate;
    if (!targetDate) return false;
    const dateString = format(targetDate, 'yyyy-MM-dd');
    return specialSchedules.some(s => s.specific_date === dateString);
  };

  const getDayModifiers = () => {
    const currentMonth = startOfMonth(selectedDate);
    const endMonth = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: currentMonth, end: endMonth });

    const fullOpenDays: Date[] = [];
    const partialOpenDays: Date[] = [];
    const closedDays: Date[] = [];
    const specialOpenDays: Date[] = [];

    monthDays.forEach(day => {
      const scheduleInfo = getScheduleInfo(day, specialSchedules, schedules);
      console.log(`${format(day, 'MM/dd')}のスケジュール情報:`, scheduleInfo);
      
      if (scheduleInfo.type === 'special-open') {
        specialOpenDays.push(day);
      } else if (scheduleInfo.type === 'full-open') {
        fullOpenDays.push(day);
      } else if (scheduleInfo.type === 'partial-open') {
        partialOpenDays.push(day);
      } else {
        closedDays.push(day);
      }
    });

    return { fullOpenDays, partialOpenDays, closedDays, specialOpenDays };
  };

  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      console.log("Date clicked:", date);
      const clickedYear = date.getFullYear();
      const clickedMonth = date.getMonth() + 1;
      
      if (clickedYear !== selectedYear || clickedMonth !== selectedMonth) {
        console.log("年月が異なるため、まず年月を変更します");
        onYearMonthChange(clickedYear, clickedMonth);
        setTimeout(() => {
          setClickedDate(date);
          setShowDailyEditor(true);
        }, 1000);
      } else {
        setClickedDate(date);
        setShowDailyEditor(true);
      }
    }
  };

  const handleTimeSlotToggle = async (timeSlot: { start: string; end: string }, isCurrentlyAvailable: boolean) => {
    if (!clickedDate || operationInProgress.current) {
      if (operationInProgress.current) {
        console.log("操作が既に進行中です。スキップします。");
      }
      return;
    }

    const dayOfWeek = getDay(clickedDate);
    const newAvailability = !isCurrentlyAvailable;
    const actionText = newAvailability ? '診療中' : '休診';
    const timeText = `${timeSlot.start}～${timeSlot.end}`;
    
    try {
      operationInProgress.current = true;
      console.log(`時間スロット変更処理開始: ${timeText} -> ${actionText}`);
      
      // スケジュール変更を実行
      await onScheduleChange(dayOfWeek, timeSlot, newAvailability);
      
      // 成功後、UI更新
      console.log("スケジュール変更完了、UI更新中...");
      setRefreshKey(prev => prev + 1);
      
      toast({
        title: "更新完了",
        description: `${timeText}を${actionText}に設定しました`,
      });
    } catch (error: any) {
      console.error("時間スロット更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `時間スロットの更新に失敗しました: ${error.message}`,
      });
    } finally {
      operationInProgress.current = false;
    }
  };

  const executeScheduleChange = async (scheduleType: string) => {
    if (!clickedDate || operationInProgress.current) {
      return;
    }

    const dayOfWeek = getDay(clickedDate);
    const clickedYear = clickedDate.getFullYear();
    const clickedMonth = clickedDate.getMonth() + 1;
    
    try {
      operationInProgress.current = true;
      console.log(`スケジュール一括変更開始: ${scheduleType}`);

      // 日曜日の場合は特別診療日として処理
      if (scheduleType === "sunday") {
        console.log("日曜診療設定を実行します");
        await handleSundayScheduleSetup(clickedDate);
        setShowScheduleDialog(false);
        return;
      }

      // 土曜日の場合の土曜営業設定
      if (scheduleType === "saturday" && dayOfWeek === 6) {
        console.log("土曜営業設定を実行します");
        const saturdaySlots = generateTimeSlots("9:00", "12:30").concat(generateTimeSlots("14:00", "17:30"));
        const allSlots = generateTimeSlots("9:00", "19:00");
        
        // まず全てのスロットを無効化
        for (const slot of allSlots) {
          try {
            await onScheduleChange(dayOfWeek, slot, false);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error("土曜営業設定：無効化エラー:", slot, error);
          }
        }
        
        // 土曜営業用のスロットを有効化
        for (const slot of saturdaySlots) {
          try {
            await onScheduleChange(dayOfWeek, slot, true);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error("土曜営業設定：有効化エラー:", slot, error);
          }
        }
      }
      // 日曜日・土曜日以外の場合のみ通常のスケジュール変更処理を実行
      else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (scheduleType === "closed") {
          const allTimeSlots = generateTimeSlots("09:00", "19:00");
          for (const slot of allTimeSlots) {
            try {
              await onScheduleChange(dayOfWeek, slot, false);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error("休診設定エラー:", slot, error);
            }
          }
        } else {
          const slots = [];
          
          if (scheduleType === "morning") {
            slots.push(...generateTimeSlots("10:00", "13:30"));
          } else if (scheduleType === "afternoon") {
            slots.push(...generateTimeSlots("15:00", "19:00"));
          } else if (scheduleType === "full") {
            slots.push(...generateTimeSlots("10:00", "13:30"));
            slots.push(...generateTimeSlots("15:00", "19:00"));
          }
          
          const allSlots = generateTimeSlots("09:00", "19:00");
          for (const slot of allSlots) {
            try {
              await onScheduleChange(dayOfWeek, slot, false);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error("無効化エラー:", slot, error);
            }
          }
          
          for (const slot of slots) {
            try {
              await onScheduleChange(dayOfWeek, slot, true);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error("有効化エラー:", slot, error);
            }
          }
        }
      }

      // UI更新
      console.log("一括変更完了、UI更新中...");
      setRefreshKey(prev => prev + 1);
      
      setShowScheduleDialog(false);
      
      toast({
        title: "更新完了",
        description: `${clickedYear}年${clickedMonth}月のスケジュールが更新されました`,
      });
    } catch (error: any) {
      console.error("スケジュール更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `スケジュールの更新に失敗しました: ${error.message}`,
      });
    } finally {
      operationInProgress.current = false;
    }
  };

  const handleSpecialScheduleAdd = async () => {
    if (!clickedDate) return;

    try {
      const dayOfWeek = getDay(clickedDate);
      
      // 現在のスケジュールから診療中の時間帯を取得
      const currentSchedules = getCurrentSchedules();
      const availableSchedules = currentSchedules.filter(s => s.is_available);
      
      if (availableSchedules.length > 0) {
        // 診療中の時間帯がある場合は、それらから診療時間範囲を決定
        const startTimes = availableSchedules.map(s => s.start_time.substring(0, 5));
        const endTimes = availableSchedules.map(s => s.end_time.substring(0, 5));
        
        // 最も早い開始時間と最も遅い終了時間を取得
        const earliestStart = startTimes.reduce((earliest, current) => 
          current < earliest ? current : earliest
        );
        const latestEnd = endTimes.reduce((latest, current) => 
          current > latest ? current : latest
        );
        
        console.log(`現在の診療時間を特別診療日として設定: ${earliestStart}-${latestEnd}`);
        
        // 直接RPC呼び出しで診療時間範囲を設定
        const { error } = await (supabase as any).rpc('insert_special_clinic_schedule', {
          p_specific_date: format(clickedDate, 'yyyy-MM-dd'),
          p_start_time: earliestStart,
          p_end_time: latestEnd,
          p_is_available: true
        });

        if (error) {
          console.error("特別診療日追加エラー:", error);
          throw error;
        }
        
        console.log("現在の診療時間での特別診療日設定成功");
      } else {
        // 診療中の時間帯がない場合は、その曜日の基本診療時間を使用
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // 平日の標準診療時間
          await onSpecialScheduleAdd(clickedDate, "10:00");
        } else if (dayOfWeek === 6) {
          // 土曜日の診療時間
          await onSpecialScheduleAdd(clickedDate, "09:00");
        } else {
          // 日曜日の診療時間
          await onSpecialScheduleAdd(clickedDate, "09:00");
        }
      }
      
      await fetchSpecialSchedules();
      setShowScheduleDialog(false);
      toast({
        title: "追加完了",
        description: "特別診療日が追加されました",
      });
    } catch (error) {
      console.error("特別診療日追加エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "特別診療日の追加に失敗しました",
      });
    }
  };

  const handleSpecialScheduleRemove = async () => {
    if (!clickedDate) return;

    const dateString = format(clickedDate, 'yyyy-MM-dd');
    const specialSchedule = specialSchedules.find(s => s.specific_date === dateString);
    
    if (specialSchedule) {
      try {
        await onSpecialScheduleDelete(specialSchedule.id);
        await fetchSpecialSchedules();
        setShowScheduleDialog(false);
        toast({
          title: "削除完了",
          description: "特別診療日が削除されました",
        });
      } catch (error) {
        console.error("特別診療日削除エラー:", error);
        toast({
          variant: "destructive",
          title: "エラー",
          description: "特別診療日の削除に失敗しました",
        });
      }
    }
  };

  const getCurrentSchedules = () => {
    if (!clickedDate) return [];
    
    const dayOfWeek = getDay(clickedDate);
    return schedules.filter(s => s.day_of_week === dayOfWeek);
  };

  const getDailyMemo = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dailyMemos.find(memo => memo.date === dateString)?.memo || '';
  };

  const handleDailyScheduleUpdated = () => {
    // スケジュール更新後の処理
    fetchAllScheduleData();
    setShowDailyEditor(false);
  };

  const { fullOpenDays, partialOpenDays, closedDays, specialOpenDays } = getDayModifiers();

  if (loading) {
    return <div className="text-center py-4">カレンダーを読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <CalendarHeader 
        selectedDate={selectedDate}
        onMonthChange={(increment) => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() + increment);
          onYearMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
        }}
      />
      
      {/* 営業日一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>今月の営業日</CardTitle>
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
            onSelect={handleDateClick}
            month={selectedDate}
            onMonthChange={(month) => {
              const year = month.getFullYear();
              const monthNum = month.getMonth() + 1;
              onYearMonthChange(year, monthNum);
            }}
            locale={ja}
            modifiers={{
              fullOpen: fullOpenDays,
              partialOpen: partialOpenDays,
              closed: closedDays,
              specialOpen: specialOpenDays,
            }}
            modifiersStyles={{
              fullOpen: { 
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                border: '2px solid #3b82f6',
                fontWeight: 'bold'
              },
              partialOpen: { 
                backgroundColor: '#fef3c7',
                color: '#d97706',
                border: '2px solid #f59e0b',
                fontWeight: 'bold'
              },
              closed: { 
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '2px solid #ef4444',
                fontWeight: 'bold'
              },
              specialOpen: { 
                backgroundColor: '#f3e8ff',
                color: '#7c3aed',
                border: '2px solid #8b5cf6',
                fontWeight: 'bold'
              },
            }}
            components={{
              Day: ({ date, ...props }) => {
                const scheduleInfo = getScheduleInfo(date, specialSchedules, schedules);
                const memo = getDailyMemo(date);
                return (
                  <CalendarDay 
                    date={date} 
                    displayMonth={selectedDate}
                    scheduleType={scheduleInfo.type}
                    displayText={scheduleInfo.displayText}
                    memo={memo}
                    onClick={handleDateClick}
                    {...props}
                  />
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <ScheduleDialog
        key={`${showScheduleDialog}-${refreshKey}`} // refreshKeyでコンポーネントを強制更新
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        clickedDate={clickedDate}
        hasSpecialSchedule={getHasSpecialSchedule(clickedDate)}
        specialSchedules={specialSchedules}
        basicTimeSlots={clickedDate ? getBasicTimeSlots(getDay(clickedDate), clickedDate) : []}
        currentSchedules={getCurrentSchedules()}
        onTimeSlotToggle={handleTimeSlotToggle}
        onScheduleChange={executeScheduleChange}
        onSpecialScheduleAdd={handleSpecialScheduleAdd}
        onSpecialScheduleRemove={handleSpecialScheduleRemove}
        onSpecialScheduleToggle={handleSpecialScheduleToggle}
      />

      {/* 日別スケジュールエディター */}
      {showDailyEditor && clickedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <DailyScheduleEditor
              selectedDate={clickedDate}
              onClose={() => setShowDailyEditor(false)}
              onScheduleUpdated={handleDailyScheduleUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
};
