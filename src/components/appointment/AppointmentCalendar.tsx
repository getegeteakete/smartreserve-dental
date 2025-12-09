
import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays, addWeeks, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getScheduleInfo } from "@/components/admin/calendar/utils/scheduleInfoUtils";
import { 
  getMonthlyBusinessDays, 
  formatBusinessDaysDisplay, 
  getCalendarModifiers, 
  getCalendarModifierStyles,
  getBusinessDayColors 
} from "@/utils/businessDayDisplay";

interface AppointmentCalendarProps {
  preferredDates: any[];
  onDateSelect: (index: number, date: Date) => void;
  onTimeSlotSelect: (index: number, timeSlot: string) => void;
  userEmail?: string;
  selectedTreatment?: string;
  treatmentData?: {
    id: string;
    name: string;
    fee: number;
    duration: number;
    description?: string;
  };
  onScrollToPatientForm?: () => void;
  maxVisiblePreference?: number; // 表示する希望日の最大数（0: 第1希望のみ、1: 第1・第2希望、2: すべて）
}

const AppointmentCalendar = ({
  preferredDates,
  onDateSelect,
  onTimeSlotSelect,
  userEmail,
  selectedTreatment,
  treatmentData,
  onScrollToPatientForm,
  maxVisiblePreference = 2 // デフォルトはすべて表示
}: AppointmentCalendarProps) => {
  // 2週間後から6週間後までの日付のみ選択可能
  const twoWeeksFromNow = addDays(new Date(), 14);
  const sixWeeksFromNow = addWeeks(new Date(), 6);
  
  // スケジュールデータの状態管理
  const [schedules, setSchedules] = useState<any[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 各希望日のセクションへの参照
  const preference1Ref = useRef<HTMLDivElement>(null);
  const preference2Ref = useRef<HTMLDivElement>(null);
  const preference3Ref = useRef<HTMLDivElement>(null);
  
  // スケジュールデータの取得
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        // 通常のスケジュールを取得
        const { data: regularData } = await (supabase as any).rpc('get_clinic_schedules', {
          p_year: currentYear,
          p_month: currentMonth
        });
        
        // 特別スケジュールを取得
        const { data: specialData } = await (supabase as any).rpc('get_special_clinic_schedules', {
          p_year: currentYear,
          p_month: currentMonth
        });
        
        setSchedules(regularData || []);
        setSpecialSchedules(specialData || []);
      } catch (error) {
        console.error("スケジュール取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);

  // 各希望日ごとに、日付変更時に選択済み時間が利用可能かチェック
  // 第1希望
  const preference0Date = preferredDates[0]?.date ? format(preferredDates[0].date, 'yyyy-MM-dd') : '';
  const preference0TimeSlot = preferredDates[0]?.timeSlot || '';
  const { data: timeSlots0 = [], isLoading: isLoadingSlots0 } = useTimeSlots(
    preferredDates[0]?.date,
    selectedTreatment,
    userEmail,
    treatmentData?.duration
  );
  
  useEffect(() => {
    if (preferredDates[0]?.date && preferredDates[0]?.timeSlot && !isLoadingSlots0 && timeSlots0.length > 0) {
      const isTimeSlotAvailable = timeSlots0.some(
        slot => slot.start_time === preferredDates[0]?.timeSlot && slot.is_available
      );
      if (!isTimeSlotAvailable) {
        console.log(`日付変更により、利用不可能な時間スロットをクリア（第1希望）: ${preferredDates[0]?.timeSlot}`);
        onTimeSlotSelect(0, '');
      }
    }
  }, [preference0Date, preference0TimeSlot, isLoadingSlots0, timeSlots0.length, onTimeSlotSelect]);

  // 第2希望
  const preference1Date = preferredDates[1]?.date ? format(preferredDates[1].date, 'yyyy-MM-dd') : '';
  const preference1TimeSlot = preferredDates[1]?.timeSlot || '';
  const { data: timeSlots1 = [], isLoading: isLoadingSlots1 } = useTimeSlots(
    preferredDates[1]?.date,
    selectedTreatment,
    userEmail,
    treatmentData?.duration
  );
  
  useEffect(() => {
    if (preferredDates[1]?.date && preferredDates[1]?.timeSlot && !isLoadingSlots1 && timeSlots1.length > 0) {
      const isTimeSlotAvailable = timeSlots1.some(
        slot => slot.start_time === preferredDates[1]?.timeSlot && slot.is_available
      );
      if (!isTimeSlotAvailable) {
        console.log(`日付変更により、利用不可能な時間スロットをクリア（第2希望）: ${preferredDates[1]?.timeSlot}`);
        onTimeSlotSelect(1, '');
      }
    }
  }, [preference1Date, preference1TimeSlot, isLoadingSlots1, timeSlots1.length, onTimeSlotSelect]);

  // 第3希望
  const preference2Date = preferredDates[2]?.date ? format(preferredDates[2].date, 'yyyy-MM-dd') : '';
  const preference2TimeSlot = preferredDates[2]?.timeSlot || '';
  const { data: timeSlots2 = [], isLoading: isLoadingSlots2 } = useTimeSlots(
    preferredDates[2]?.date,
    selectedTreatment,
    userEmail,
    treatmentData?.duration
  );
  
  useEffect(() => {
    if (preferredDates[2]?.date && preferredDates[2]?.timeSlot && !isLoadingSlots2 && timeSlots2.length > 0) {
      const isTimeSlotAvailable = timeSlots2.some(
        slot => slot.start_time === preferredDates[2]?.timeSlot && slot.is_available
      );
      if (!isTimeSlotAvailable) {
        console.log(`日付変更により、利用不可能な時間スロットをクリア（第3希望）: ${preferredDates[2]?.timeSlot}`);
        onTimeSlotSelect(2, '');
      }
    }
  }, [preference2Date, preference2TimeSlot, isLoadingSlots2, timeSlots2.length, onTimeSlotSelect]);

  const isDateDisabled = (date: Date) => {
    // 選択可能な範囲外
    if (date < twoWeeksFromNow || date > sixWeeksFromNow) {
      return true;
    }
    // 休診日は選択不可
    const scheduleType = getDateScheduleType(date);
    if (['basic-closed', 'custom-closed', 'special-closed'].includes(scheduleType)) {
      return true;
    }
    return false;
  };
  
  // 日付のスケジュール状態を取得
  const getDateScheduleType = (date: Date) => {
    const scheduleInfo = getScheduleInfo(date, specialSchedules, schedules);
    return scheduleInfo.type;
  };
  
  // 日付の表示テキストを取得
  const getDateDisplayText = (date: Date) => {
    const scheduleInfo = getScheduleInfo(date, specialSchedules, schedules);
    return scheduleInfo.displayText;
  };

  const handleDateSelect = (date: Date | undefined, index: number) => {
    if (date) {
      onDateSelect(index, date);
      // 日付変更時、以前選択された時間が新しい日付で利用可能かチェック
      // 利用可能でない場合は時間をクリア
      const currentPreference = preferredDates[index];
      if (currentPreference?.timeSlot) {
        // 時間スロットが読み込まれるまで待つため、useEffectで処理
        // ここでは日付を更新するだけ
      }
      // 日付選択時は自動スクロールしない（ユーザーが選択中のため）
    }
  };

  const handleTimeSlotSelect = (timeSlot: string, index: number) => {
    onTimeSlotSelect(index, timeSlot);
    
    // 時間選択後、次の希望日セクションまたは名前入力欄へ自動スクロール
    setTimeout(() => {
      if (index === 0 && preference2Ref.current) {
        // 第1希望の時間選択後、第2希望へスクロール
        preference2Ref.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else if (index === 1 && preference3Ref.current) {
        // 第2希望の時間選択後、第3希望へスクロール
        preference3Ref.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else if (index === 2 && onScrollToPatientForm) {
        // 第3希望の時間選択後、名前入力欄へスクロール
        onScrollToPatientForm();
      }
    }, 500); // 選択アニメーションと他の処理の完了を待つ
  };

  const getPreferenceLabel = (index: number) => {
    const labels = ['第1希望日の選択', '第2希望日の選択', '第3希望日の選択'];
    return labels[index];
  };

  const getPreferenceBadgeColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500'];
    return colors[index];
  };

  const isDateSelected = (date: Date, currentIndex: number) => {
    return preferredDates.some((pref, i) => 
      i === currentIndex && pref?.date && format(pref.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getSelectedDateIndex = (date: Date, currentIndex: number) => {
    return preferredDates.findIndex((pref, i) => 
      i !== currentIndex && pref?.date && format(pref.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const renderPreferenceSection = (index: number) => {
    const preference = preferredDates[index];
    
    // 各希望日ごとに取得した時間スロットを使用
    const timeSlots = index === 0 ? timeSlots0 : index === 1 ? timeSlots1 : timeSlots2;
    const isLoadingSlots = index === 0 ? isLoadingSlots0 : index === 1 ? isLoadingSlots1 : isLoadingSlots2;

    const isRequired = index < 2;
    const hasCompleted = index > 0 && preferredDates[index - 1]?.date && preferredDates[index - 1]?.timeSlot;
    const shouldShowNextMessage = index === 1 && preferredDates[0]?.date && preferredDates[0]?.timeSlot;
    const shouldShowThirdMessage = index === 2 && preferredDates[1]?.date && preferredDates[1]?.timeSlot;

    // refを各セクションに割り当て
    const sectionRef = index === 0 ? preference1Ref : index === 1 ? preference2Ref : preference3Ref;
    
    return (
      <div key={index} ref={sectionRef} className="mb-8 scroll-mt-20">
        {/* 第2希望への案内メッセージ */}
        {shouldShowNextMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4 animate-in fade-in-50 slide-in-from-top-3">
            <div className="text-blue-600 font-medium text-base sm:text-lg mb-2">
              ↓ 第2希望を選択してください ↓
            </div>
            <div className="text-blue-500 text-xs sm:text-sm">
              第1希望の時間選択が完了しました！続けて第2希望もご入力ください（必須項目です）
            </div>
          </div>
        )}
        
        {/* 第3希望への案内メッセージ */}
        {shouldShowThirdMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4 animate-in fade-in-50 slide-in-from-top-3">
            <div className="text-green-600 font-medium text-base sm:text-lg mb-2">
              ↓ 第3希望も選択できます（任意）↓
            </div>
            <div className="text-green-500 text-xs sm:text-sm mb-3">
              第2希望の時間選択が完了しました！第3希望も入力いただくと、予約が確定しやすくなります
            </div>
            <Button
              onClick={() => onScrollToPatientForm && onScrollToPatientForm()}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 border-green-300 text-green-700 hover:text-green-800"
            >
              第2希望だけで予約する →
            </Button>
          </div>
        )}

        {/* タイトル部分 */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            {getPreferenceLabel(index)}
            {isRequired && <span className="text-red-500 text-xs sm:text-sm ml-2">※必須</span>}
          </h3>
        </div>

        {/* カレンダーと時間選択のコンテナ */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* 左側：カレンダー */}
            <div>
              <div className="mb-4">
                <h4 className="text-base font-medium text-gray-700 mb-3">日付を選択してください</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <Calendar
                    mode="single"
                    selected={preference?.date}
                    onSelect={(date) => handleDateSelect(date, index)}
                    disabled={isDateDisabled}
                    fromDate={twoWeeksFromNow}
                    toDate={sixWeeksFromNow}
                    className="w-full"
                    modifiers={{
                      selected: (date) => isDateSelected(date, index),
                      otherSelected: (date) => {
                        const selectedIndex = getSelectedDateIndex(date, index);
                        return selectedIndex !== -1;
                      },
                      // 営業日（選択可能な範囲内で、休みでない日）は黒枠を表示
                      business: (date) => {
                        // 選択可能な範囲（2週間後〜6週間後）内かチェック
                        if (date < twoWeeksFromNow || date > sixWeeksFromNow) {
                          return false;
                        }
                        // 休みの日でないかチェック
                        const scheduleType = getDateScheduleType(date);
                        return !['basic-closed', 'custom-closed', 'special-closed'].includes(scheduleType);
                      }
                    }}
                    modifiersClassNames={{
                      selected: "date-selected",
                      otherSelected: "bg-gray-200 text-gray-500 opacity-60",
                      business: "date-business"
                    }}
                    classNames={{
                      day: "date-unselected",
                      day_selected: "date-selected",
                      day_disabled: "date-disabled",
                      day_outside: "date-disabled"
                    }}
                  />
                </div>
                
                {/* 選択日表示（カレンダーの下） */}
                {preference?.date && (
                  <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-800 mb-1">
                        {format(preference.date, "yyyy年MM月dd日(E)", { locale: ja })}
                      </p>
                      <p className="text-sm text-gray-600">・日付が選択されました</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右側：時間選択 */}
            <div>
              <div className="mb-4">
                <h4 className="text-base font-medium text-gray-700 mb-3">時間を選択してください</h4>
                
                {preference?.date ? (
                  <div>
                    {/* 選択された時間の表示エリア */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                      {preference?.timeSlot ? (() => {
                        // 選択された時間スロットに対応するslotを見つける
                        const selectedSlot = timeSlots.find(slot => slot.start_time === preference.timeSlot);
                        const startTime = selectedSlot?.start_time ? selectedSlot.start_time.slice(0, 5) : preference.timeSlot.slice(0, 5);
                        const endTime = selectedSlot?.end_time ? selectedSlot.end_time.slice(0, 5) : '';
                        
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">
                                {startTime}{endTime ? ` - ${endTime}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-600 text-sm">時間が選択されました</span>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="flex items-center justify-center text-gray-500">
                          <span>時間を選択してください</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      選択日: {format(preference.date, "yyyy年MM月dd日(E)", { locale: ja })}
                    </div>

                    {/* 時間選択グリッド */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {isLoadingSlots ? (
                          <div className="col-span-2 text-center py-4 text-gray-500">
                            時間枠を読み込み中...
                          </div>
                        ) : timeSlots.length > 0 ? (
                          timeSlots.map((slot) => {
                            const isCurrentlySelected = preference?.timeSlot === slot.start_time;
                            
                            // 同日の他の希望で既に選択されている時間かチェック
                            const isTimeSlotTakenOnSameDay = preference?.date && preferredDates.some((pref, i) => 
                              i !== index && 
                              pref?.date && 
                              pref?.timeSlot &&
                              format(pref.date, 'yyyy-MM-dd') === format(preference.date!, 'yyyy-MM-dd') &&
                              pref.timeSlot === slot.start_time
                            );
                            
                            const isAvailable = slot.is_available && !isTimeSlotTakenOnSameDay;
                            
                            return (
                              <button
                                key={slot.id}
                                className={cn(
                                  "rounded-md border p-2 text-sm transition-colors focus:outline-none",
                                  isCurrentlySelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : isTimeSlotTakenOnSameDay
                                    ? "bg-orange-100 text-orange-600 border-orange-300 cursor-not-allowed"
                                    : isAvailable
                                    ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (isAvailable) {
                                    handleTimeSlotSelect(slot.start_time, index);
                                  }
                                }}
                                disabled={!isAvailable}
                                type="button"
                                title={isTimeSlotTakenOnSameDay ? "この時間は同日の別の希望で既に選択されています" : ""}
                              >
                                <div className="flex flex-col items-center">
                                  <span>{slot.start_time.slice(0, 5)}</span>
                                  <span className="text-xs">-{slot.end_time.slice(0, 5)}</span>
                                  {isTimeSlotTakenOnSameDay && (
                                    <span className="text-xs text-orange-600">選択済み</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-center py-4 text-gray-500">
                            この日は予約を受け付けていません
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    まず日付を選択してください
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">予約日時の選択</h2>
        <p className="text-sm text-gray-600 mb-1">
          ※ 予約は2週間後〜6週間後まで選択可能です
        </p>
      </div>

      {/* 段階的にカレンダーを表示 */}
      <div>
        {[0, 1, 2].map((index) => {
          // maxVisiblePreferenceに基づいて表示を制御
          if (index > maxVisiblePreference) {
            return null;
          }
          return renderPreferenceSection(index);
        })}
      </div>

      {/* 選択状況サマリー（表示されている希望日のみ） */}
      {maxVisiblePreference >= 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <h3 className="font-medium mb-3">選択状況</h3>
          <div className="space-y-2">
            {[0, 1, 2].map((index) => {
              // 表示されている希望日のみサマリーに表示
              if (index > maxVisiblePreference) {
                return null;
              }
              const preference = preferredDates[index];
              const label = getPreferenceLabel(index);
              const isRequired = index < 2;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {label}
                  </span>
                  {preference?.date && preference?.timeSlot ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {format(preference.date, "M月d日")} {preference.timeSlot.slice(0, 5)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className={cn(
                      isRequired ? "text-red-500 border-red-300" : "text-gray-500 border-gray-300"
                    )}>
                      {isRequired ? "未選択（必須）" : "未選択（任意）"}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
