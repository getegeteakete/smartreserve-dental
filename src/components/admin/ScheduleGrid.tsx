
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, HelpCircle, Save } from "lucide-react";
import { useState, RefObject } from "react";

interface ScheduleData {
  id?: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleGridProps {
  selectedYear: number;
  selectedMonth: number;
  schedules: ScheduleData[];
  loading: boolean;
  onScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => void;
  guideRefs?: {
    batchApply: RefObject<HTMLDivElement>;
    dayOff: RefObject<HTMLDivElement>;
  };
  currentGuideStep?: number;
  isGuideActive?: boolean;
}

export const ScheduleGrid = ({ 
  selectedYear, 
  selectedMonth, 
  schedules, 
  loading, 
  onScheduleChange,
  guideRefs,
  currentGuideStep,
  isGuideActive
}: ScheduleGridProps) => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [dayTimeSelections, setDayTimeSelections] = useState<Map<number, Set<string>>>(new Map());
  
  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  
  const timeSlots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      timeSlots.push({ start: startTime, end: endTime });
    }
  }

  const isScheduleAvailable = (dayOfWeek: number, timeSlot: { start: string; end: string }) => {
    const schedule = schedules.find(
      s => s.day_of_week === dayOfWeek && s.start_time === timeSlot.start
    );
    return schedule ? schedule.is_available : false;
  };

  const handleTimeSlotSelectionChange = (timeSlot: { start: string; end: string }, checked: boolean) => {
    const timeSlotKey = timeSlot.start;
    const newSelectedTimeSlots = new Set(selectedTimeSlots);
    
    if (checked) {
      newSelectedTimeSlots.add(timeSlotKey);
    } else {
      newSelectedTimeSlots.delete(timeSlotKey);
    }
    
    setSelectedTimeSlots(newSelectedTimeSlots);
  };

  const handleDaySelectionChange = (dayOfWeek: number, checked: boolean) => {
    const newSelectedDays = new Set(selectedDays);
    
    if (checked) {
      newSelectedDays.add(dayOfWeek);
    } else {
      newSelectedDays.delete(dayOfWeek);
    }
    
    setSelectedDays(newSelectedDays);
  };

  const handleDayTimeSlotChange = (dayOfWeek: number, timeSlot: { start: string; end: string }, checked: boolean) => {
    const currentSelections = dayTimeSelections.get(dayOfWeek) || new Set();
    const newSelections = new Set(currentSelections);
    
    if (checked) {
      newSelections.add(timeSlot.start);
    } else {
      newSelections.delete(timeSlot.start);
    }
    
    const newDayTimeSelections = new Map(dayTimeSelections);
    newDayTimeSelections.set(dayOfWeek, newSelections);
    setDayTimeSelections(newDayTimeSelections);
  };

  const handleSelectAllForDay = (dayOfWeek: number) => {
    const allTimeSlots = new Set(timeSlots.map(slot => slot.start));
    const newDayTimeSelections = new Map(dayTimeSelections);
    newDayTimeSelections.set(dayOfWeek, allTimeSlots);
    setDayTimeSelections(newDayTimeSelections);
  };

  const handleDeselectAllForDay = (dayOfWeek: number) => {
    const newDayTimeSelections = new Map(dayTimeSelections);
    newDayTimeSelections.set(dayOfWeek, new Set());
    setDayTimeSelections(newDayTimeSelections);
  };

  const handleSubmitDaySchedule = async (dayOfWeek: number) => {
    const selectedSlots = dayTimeSelections.get(dayOfWeek) || new Set();
    
    // まず、その曜日の全ての時間スロットを診療不可に設定
    for (const timeSlot of timeSlots) {
      await onScheduleChange(dayOfWeek, timeSlot, false);
    }
    
    // 次に、選択された時間スロットのみを診療可能に設定
    for (const startTime of selectedSlots) {
      const timeSlot = timeSlots.find(slot => slot.start === startTime);
      if (timeSlot) {
        await onScheduleChange(dayOfWeek, timeSlot, true);
      }
    }

    // 選択をクリア
    const newDayTimeSelections = new Map(dayTimeSelections);
    newDayTimeSelections.set(dayOfWeek, new Set());
    setDayTimeSelections(newDayTimeSelections);
  };

  const handleBatchApply = () => {
    if (selectedTimeSlots.size === 0) return;

    selectedTimeSlots.forEach(startTime => {
      const timeSlot = timeSlots.find(slot => slot.start === startTime);
      if (timeSlot) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          onScheduleChange(dayOfWeek, timeSlot, true);
        }
      }
    });

    setSelectedTimeSlots(new Set());
  };

  const handleBatchDayOff = () => {
    if (selectedDays.size === 0) return;

    selectedDays.forEach(dayOfWeek => {
      timeSlots.forEach(timeSlot => {
        onScheduleChange(dayOfWeek, timeSlot, false);
      });
    });

    setSelectedDays(new Set());
  };

  const isTimeSlotSelected = (timeSlot: { start: string; end: string }) => {
    return selectedTimeSlots.has(timeSlot.start);
  };

  const isDaySelected = (dayOfWeek: number) => {
    return selectedDays.has(dayOfWeek);
  };

  const isDayTimeSlotSelected = (dayOfWeek: number, timeSlot: { start: string; end: string }) => {
    const daySelections = dayTimeSelections.get(dayOfWeek) || new Set();
    return daySelections.has(timeSlot.start);
  };

  const getDaySelectedCount = (dayOfWeek: number) => {
    const daySelections = dayTimeSelections.get(dayOfWeek) || new Set();
    return daySelections.size;
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedYear}年{selectedMonth}月の診療時間設定
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>診療時間を効率的に設定できます。<br/>
                一括設定機能を使用すると初期設定が簡単です。</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            日曜日〜土曜日の9:00〜19:00の間で30分刻みで設定できます。複数選択して一括登録が可能です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : (
            <div className="space-y-6">
              {/* 時間スロット一括適用セクション */}
              <div 
                ref={guideRefs?.batchApply}
                className={`bg-blue-50 p-4 rounded-lg border border-blue-200 ${
                  currentGuideStep === 3 && isGuideActive ? "ring-2 ring-primary animate-pulse" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-blue-800">時間スロット一括適用</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>例：9:00、10:00、14:00を選択して一括適用すると、<br/>
                      月〜日の全ての曜日で選択した時間が診療可能になります。<br/>
                      初期設定に便利です。</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-blue-700">
                    適用したい時間スロットを選択してから「一括適用」ボタンを押すと、選択した時間が全ての曜日に適用されます。
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div key={timeIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`batch-${timeIndex}`}
                          checked={isTimeSlotSelected(timeSlot)}
                          onCheckedChange={(checked) => 
                            handleTimeSlotSelectionChange(timeSlot, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`batch-${timeIndex}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {timeSlot.start}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleBatchApply}
                        disabled={selectedTimeSlots.size === 0}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        一括適用 ({selectedTimeSlots.size}個の時間スロット)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>選択した時間スロットを全ての曜日（月〜日）に<br/>
                      一度に適用します。初期設定時に便利です。</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 曜日別休業日設定セクション */}
              <div 
                ref={guideRefs?.dayOff}
                className={`bg-red-50 p-4 rounded-lg border border-red-200 ${
                  currentGuideStep === 4 && isGuideActive ? "ring-2 ring-primary animate-pulse" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-red-800">曜日別休業日設定</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-red-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>例：日曜日と祝日を選択して休業日に設定すると、<br/>
                      その曜日の全ての時間が診療不可になります。<br/>
                      定休日の設定に便利です。</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-red-700">
                    休業にしたい曜日を選択してから「休業日に設定」ボタンを押すと、選択した曜日の全ての時間がオフになります。
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {dayNames.map((dayName, dayIndex) => (
                      <div key={dayIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${dayIndex}`}
                          checked={isDaySelected(dayIndex)}
                          onCheckedChange={(checked) => 
                            handleDaySelectionChange(dayIndex, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`day-${dayIndex}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dayName}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleBatchDayOff}
                        disabled={selectedDays.size === 0}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        休業日に設定 ({selectedDays.size}つの曜日)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>選択した曜日の全ての時間スロットを<br/>
                      一度に診療不可に設定します。定休日設定に便利です。</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* 曜日別診療時間設定セクション */}
              {dayNames.map((dayName, dayIndex) => (
                <div key={dayIndex} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-green-800">{dayName}の診療時間設定</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-green-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dayName}の診療時間を複数選択してから「診療時間を登録」ボタンで<br/>
                          一括で設定できます。選択していない時間は診療不可になります。</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-700 font-medium">
                        {getDaySelectedCount(dayIndex)}個選択中
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectAllForDay(dayIndex)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        全選択
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeselectAllForDay(dayIndex)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        全解除
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitDaySchedule(dayIndex)}
                            disabled={getDaySelectedCount(dayIndex) === 0}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3" />
                            診療時間を登録
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>選択した時間を診療時間に、選択していない時間を<br/>
                          休診時間に一括で設定します</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div key={timeIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${dayIndex}-${timeIndex}`}
                          checked={isDayTimeSlotSelected(dayIndex, timeSlot)}
                          onCheckedChange={(checked) => 
                            handleDayTimeSlotChange(dayIndex, timeSlot, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`day-${dayIndex}-${timeIndex}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                            isScheduleAvailable(dayIndex, timeSlot) 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`}
                        >
                          {timeSlot.start}
                          {isScheduleAvailable(dayIndex, timeSlot) && (
                            <span className="ml-1 text-xs">✓</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
