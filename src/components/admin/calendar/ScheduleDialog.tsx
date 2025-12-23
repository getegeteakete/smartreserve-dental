
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useState, useEffect } from "react";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clickedDate: Date | null;
  hasSpecialSchedule: boolean;
  specialSchedules: Array<{ id: string; specific_date: string; start_time: string; end_time: string; is_available: boolean }>;
  basicTimeSlots: Array<{ start: string; end: string }>;
  currentSchedules: Array<{ start_time: string; end_time: string; is_available: boolean }>;
  onTimeSlotToggle: (timeSlot: { start: string; end: string }, isAvailable: boolean) => void;
  onScheduleChange: (scheduleType: string) => void;
  onSpecialScheduleAdd: () => void;
  onSpecialScheduleRemove: () => void;
  onSpecialScheduleToggle: (scheduleId: string, isAvailable: boolean) => Promise<void>;
}

const getTimeOptions = (isSunday: boolean, isSaturday: boolean) => {
  if (isSunday) {
    return [
      { value: "sunday", label: "日曜診療" },
      { value: "closed", label: "休診日" }
    ];
  } else if (isSaturday) {
    return [
      { value: "saturday", label: "土曜営業" },
      { value: "closed", label: "休診日" }
    ];
  } else {
    return [
      { value: "morning", label: "午前のみ営業" },
      { value: "afternoon", label: "午後のみ営業" },
      { value: "full", label: "終日営業" },
      { value: "closed", label: "休診日" }
    ];
  }
};

const formatTime = (timeString: string): string => {
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
};

export const ScheduleDialog = ({
  open,
  onOpenChange,
  clickedDate,
  hasSpecialSchedule,
  specialSchedules,
  basicTimeSlots,
  currentSchedules,
  onTimeSlotToggle,
  onScheduleChange,
  onSpecialScheduleAdd,
  onSpecialScheduleRemove,
  onSpecialScheduleToggle
}: ScheduleDialogProps) => {
  // ローカル状態で時間スロットの変更を管理
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedNewState, setSelectedNewState] = useState<boolean>(false);

  // 時間スロットの現在の可用性を取得する関数
  const getTimeSlotAvailability = (slot: { start: string; end: string }) => {
    const key = `${slot.start}-${slot.end}`;
    
    // 保留中の変更があればそれを表示
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    // データベースから現在の状態を確認
    const currentSchedule = currentSchedules.find(
      s => s.start_time === `${slot.start}:00` && s.end_time === `${slot.end}:00`
    );
    
    return currentSchedule ? currentSchedule.is_available : true;
  };

  // ダイアログが開かれるたびに保留中の変更をクリア
  useEffect(() => {
    if (open) {
      setPendingChanges({});
    }
  }, [open]);

  const handleTimeSlotClick = (slot: { start: string; end: string }) => {
    const currentState = getTimeSlotAvailability(slot);
    const newState = !currentState;
    
    setSelectedTimeSlot(slot);
    setSelectedNewState(newState);
    setShowConfirmDialog(true);
  };

  const handleConfirmTimeSlotChange = () => {
    if (!selectedTimeSlot) return;
    
    const key = `${selectedTimeSlot.start}-${selectedTimeSlot.end}`;
    const currentState = getTimeSlotAvailability(selectedTimeSlot);
    
    // ローカル状態を更新（即座にUIに反映）
    setPendingChanges(prev => ({
      ...prev,
      [key]: selectedNewState
    }));
    
    setShowConfirmDialog(false);
    setSelectedTimeSlot(null);
    setSelectedNewState(false);
  };

  const handleCancelTimeSlotChange = () => {
    setShowConfirmDialog(false);
    setSelectedTimeSlot(null);
    setSelectedNewState(false);
  };

  const handleApplyChanges = async () => {
    // 保留中の変更をデータベースに反映
    for (const [key, newState] of Object.entries(pendingChanges)) {
      const [start, end] = key.split('-');
      const slot = { start, end };
      const currentState = currentSchedules.find(
        s => s.start_time === `${start}:00` && s.end_time === `${end}:00`
      )?.is_available ?? true;
      
      // 現在の状態と異なる場合のみ更新
      if (currentState !== newState) {
        onTimeSlotToggle(slot, currentState);
      }
    }
    
    // 保留中の変更をクリア
    setPendingChanges({});
  };

  const handleResetChanges = () => {
    setPendingChanges({});
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  if (!clickedDate) return null;

  const dayOfWeek = getDay(clickedDate);
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const dateString = format(clickedDate, 'yyyy-MM-dd');
  const currentSpecialSchedule = specialSchedules.find(s => s.specific_date === dateString);

  const availableOptions = getTimeOptions(isSunday, isSaturday);

  const handleSpecialScheduleToggle = async (isAvailable: boolean) => {
    if (currentSpecialSchedule) {
      await onSpecialScheduleToggle(currentSpecialSchedule.id, isAvailable);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {format(clickedDate, 'MM月dd日(E)', { locale: ja })} のスケジュール設定
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 特別診療日が設定されている場合の利用可能性切り替え */}
            {hasSpecialSchedule && currentSpecialSchedule && (
              <div>
                <h4 className="font-semibold mb-3">特別診療日設定</h4>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id="special-available"
                    checked={currentSpecialSchedule.is_available}
                    onCheckedChange={(checked) => handleSpecialScheduleToggle(checked as boolean)}
                  />
                  <Label htmlFor="special-available" className="text-sm">
                    {currentSpecialSchedule.is_available ? '営業中' : '休診中'}
                    （{formatTime(currentSpecialSchedule.start_time)}～{formatTime(currentSpecialSchedule.end_time)}）
                  </Label>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  チェックを外すと、この特別診療日を休診日にできます。
                </p>
              </div>
            )}

            {/* 日曜日・土曜日でない場合のみ現在の設定を表示 */}
            {!isSunday && !isSaturday && !hasSpecialSchedule && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">基本スケジュール設定</h4>
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border">
                    ⚠️ 変更は全ての{format(clickedDate, 'E', { locale: ja })}曜日に反映されます
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {basicTimeSlots.map((slot) => {
                    const key = `${slot.start}-${slot.end}`;
                    const isAvailable = getTimeSlotAvailability(slot);
                    const isPending = key in pendingChanges;
                    
                    return (
                      <Button
                        key={key}
                        variant={isAvailable ? "default" : "outline"}
                        size="sm"
                        className={`h-8 text-xs transition-colors border-2 ${
                          isAvailable 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'
                        } ${isPending ? 'ring-2 ring-orange-400' : ''}`}
                        onClick={() => handleTimeSlotClick(slot)}
                      >
                        {formatTime(slot.start)}～{formatTime(slot.end)}
                        {isPending && <span className="ml-1 text-xs">*</span>}
                      </Button>
                    );
                  })}
                </div>
                {basicTimeSlots.length === 0 && (
                  <p className="text-gray-500 text-sm">この曜日は基本休診日です</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  青色：営業中、白色：休診中、オレンジ枠：変更予定 (*印は未適用の変更)
                </p>
                
                {/* 変更適用ボタン */}
                {hasPendingChanges && (
                  <div className="flex gap-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Button 
                      onClick={handleApplyChanges}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      変更を適用（全{format(clickedDate, 'E', { locale: ja })}曜日）
                    </Button>
                    <Button 
                      onClick={handleResetChanges}
                      variant="outline"
                      size="sm"
                    >
                      変更をリセット
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 日曜日の場合の説明 */}
            {isSunday && !hasSpecialSchedule && (
              <div>
                <h4 className="font-semibold mb-3">日曜日の設定</h4>
                <p className="text-gray-600 text-sm mb-3">
                  日曜日は特別診療日として設定されます。日曜診療を選択すると、9:00～12:30、14:00～17:30の時間帯で営業します。
                </p>
              </div>
            )}

            {/* 土曜日の場合の説明とチェックボックス */}
            {isSaturday && !hasSpecialSchedule && (
              <div>
                <h4 className="font-semibold mb-3">土曜日の設定</h4>
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50">
                  <Checkbox
                    id="saturday-available"
                    checked={(() => {
                      // 土曜日の基本営業スケジュール（9:00-12:30、14:00-17:30）が有効かどうかを判定
                      const normalizeTime = (time: string) => time.substring(0, 5); // "09:00:00" -> "09:00" または "09:00" -> "09:00"
                      const saturdaySchedule1 = currentSchedules.find(s => 
                        s.is_available && 
                        normalizeTime(s.start_time) === "09:00" && 
                        normalizeTime(s.end_time) === "12:30"
                      );
                      const saturdaySchedule2 = currentSchedules.find(s => 
                        s.is_available && 
                        normalizeTime(s.start_time) === "14:00" && 
                        normalizeTime(s.end_time) === "17:30"
                      );
                      return !!saturdaySchedule1 && !!saturdaySchedule2;
                    })()}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onScheduleChange("saturday");
                      } else {
                        onScheduleChange("closed");
                      }
                    }}
                  />
                  <Label htmlFor="saturday-available" className="text-sm cursor-pointer">
                    土曜営業（9:00～12:30、14:00～17:30）
                  </Label>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  チェックを外すと、すべての土曜日を休診日にできます。
                </p>
              </div>
            )}

            {/* スケジュール変更オプション（特別診療日でない場合のみ） */}
            {!hasSpecialSchedule && (
              <div>
                <h4 className="font-semibold mb-2">スケジュール変更</h4>
                <div className="grid grid-cols-1 gap-2">
                  {availableOptions.map((option) => (
                    <AlertDialog key={option.value}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                        >
                          {option.label}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>スケジュール変更の確認</AlertDialogTitle>
                          <AlertDialogDescription>
                            {format(clickedDate, 'MM月dd日(E)', { locale: ja })} を
                            「{option.label}」に変更しますか？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onScheduleChange(option.value)}>
                            変更する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
              </div>
            )}

            {/* 特定日付のみ変更オプション */}
            {!hasSpecialSchedule && !isSunday && !isSaturday && (
              <div>
                <h4 className="font-semibold mb-3">この日のみ変更したい場合</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    「{format(clickedDate, 'MM月dd日', { locale: ja })}」のみスケジュールを変更したい場合は、
                    特別診療日として設定してください。
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        📅 この日のみ変更（特別診療日に設定）
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>特別診療日設定の確認</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            {format(clickedDate, 'MM月dd日(E)', { locale: ja })} を
                            特別診療日に設定しますか？
                          </p>
                          <p className="text-sm text-blue-600">
                            ✅ この日のみのスケジュール変更が可能になります<br/>
                            ✅ 他の{format(clickedDate, 'E', { locale: ja })}曜日には影響しません
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={onSpecialScheduleAdd}>
                          設定する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* その他の特別設定 */}
            <div>
              <h4 className="font-semibold mb-2">その他の設定</h4>
              <div className="space-x-2">
                
                {!hasSpecialSchedule && isSunday && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm">日曜診療に設定</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>日曜診療設定の確認</AlertDialogTitle>
                        <AlertDialogDescription>
                          {format(clickedDate, 'MM月dd日(E)', { locale: ja })} を
                          日曜診療日に設定しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={onSpecialScheduleAdd}>
                          設定する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {!hasSpecialSchedule && isSaturday && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm">土曜営業に設定</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>土曜営業設定の確認</AlertDialogTitle>
                        <AlertDialogDescription>
                          {format(clickedDate, 'MM月dd日(E)', { locale: ja })} を
                          土曜診療日に設定しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={onSpecialScheduleAdd}>
                          設定する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {hasSpecialSchedule && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">特別設定を削除</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>特別設定削除の確認</AlertDialogTitle>
                        <AlertDialogDescription>
                          {format(clickedDate, 'MM月dd日(E)', { locale: ja })} の
                          特別設定を削除しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={onSpecialScheduleRemove}>
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 時間スロット変更確認ダイアログ */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>時間スロット変更の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTimeSlot && (
                <>
                  {formatTime(selectedTimeSlot.start)}～{formatTime(selectedTimeSlot.end)} を
                  {selectedNewState ? '営業中' : '休診中'}に変更しますか？
                  <br />
                  <span className="text-sm text-gray-600">
                    ※変更は一時的に保存され、「変更を適用」ボタンで確定されます。
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelTimeSlotChange}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTimeSlotChange}>
              変更する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
