import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Calendar, AlertCircle, Save, X, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useBookingTimeSchedules } from "@/hooks/useBookingTimeSchedules";
import { useBookingTimeOperations } from "@/hooks/useBookingTimeOperations";
import { SpecialBookingTimeManager } from "./SpecialBookingTimeManager";
import { TimeRangeSlider } from "./TimeRangeSlider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";

interface BookingTimeScheduleManagerProps {
  selectedYear: number;
  selectedMonth: number;
}

export const BookingTimeScheduleManager = ({
  selectedYear,
  selectedMonth
}: BookingTimeScheduleManagerProps) => {
  const { data: bookingTimeSchedules = [], isLoading } = useBookingTimeSchedules(selectedYear, selectedMonth);
  const {
    insertBookingTimeSchedule,
    updateBookingTimeSchedule,
    deleteBookingTimeSchedule
  } = useBookingTimeOperations(selectedYear, selectedMonth);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true
  });
  const [isAutoSetting, setIsAutoSetting] = useState(false);

  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

  // 基本営業時間から予約受付時間を自動生成
  const handleAutoSetupFromClinic = async () => {
    setIsAutoSetting(true);
    try {
      // 基本営業時間を取得
      const { data: clinicSchedules } = await supabase
        .from("clinic_schedules")
        .select("*")
        .eq("year", selectedYear)
        .eq("month", selectedMonth)
        .eq("is_available", true);

      if (!clinicSchedules || clinicSchedules.length === 0) {
        toast({
          variant: "destructive",
          title: "基本営業時間が未設定です",
          description: "先に基本営業時間を設定してください。",
        });
        return;
      }

      // 各基本営業時間に対して、予約受付時間を作成（30分後開始、30分前終了）
      for (const clinic of clinicSchedules) {
        const startMinutes = parseInt(clinic.start_time.split(':')[0]) * 60 + parseInt(clinic.start_time.split(':')[1]);
        const endMinutes = parseInt(clinic.end_time.split(':')[0]) * 60 + parseInt(clinic.end_time.split(':')[1]);
        
        const bookingStartMinutes = startMinutes + 30; // 30分後に開始
        const bookingEndMinutes = endMinutes - 30; // 30分前に終了
        
        if (bookingEndMinutes > bookingStartMinutes) {
          const startTime = `${String(Math.floor(bookingStartMinutes / 60)).padStart(2, '0')}:${String(bookingStartMinutes % 60).padStart(2, '0')}`;
          const endTime = `${String(Math.floor(bookingEndMinutes / 60)).padStart(2, '0')}:${String(bookingEndMinutes % 60).padStart(2, '0')}`;
          
          await supabase
            .from("booking_time_schedules")
            .insert({
              year: selectedYear,
              month: selectedMonth,
              day_of_week: clinic.day_of_week,
              start_time: startTime + ":00",
              end_time: endTime + ":00",
              is_available: true,
            });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["bookingTimeSchedules"] });
      toast({
        title: "✅ 自動設定完了！",
        description: "基本営業時間から予約受付時間を自動生成しました。",
      });
    } catch (error) {
      console.error("自動設定エラー:", error);
      toast({
        variant: "destructive",
        title: "自動設定に失敗しました",
      });
    } finally {
      setIsAutoSetting(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      console.log("新規予約受付時間を追加:", newSchedule);
      await insertBookingTimeSchedule.mutateAsync(newSchedule);
      setNewSchedule({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true
      });
    } catch (error) {
      console.error("予約受付時間の追加に失敗:", error);
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, startTime: string, endTime: string, isAvailable: boolean) => {
    try {
      await updateBookingTimeSchedule.mutateAsync({
        scheduleId,
        startTime,
        endTime,
        isAvailable
      });
      setEditingSchedule(null);
    } catch (error) {
      console.error("予約受付時間の更新に失敗:", error);
    }
  };

  const handleToggleAvailable = async (schedule: any) => {
    try {
      await updateBookingTimeSchedule.mutateAsync({
        scheduleId: schedule.id,
        startTime: schedule.start_time.substring(0, 5),
        endTime: schedule.end_time.substring(0, 5),
        isAvailable: !schedule.is_available
      });
      toast({
        title: schedule.is_available ? "受付停止にしました" : "受付可能にしました",
        description: `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`,
      });
    } catch (error) {
      console.error("受付可否の切り替えに失敗:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, schedule: any) => {
    if (!window.confirm(`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)} の設定を削除しますか？`)) {
      return;
    }

    try {
      await deleteBookingTimeSchedule.mutateAsync(scheduleId);
      toast({
        title: "削除しました",
        description: "予約受付時間の設定を削除しました",
      });
    } catch (error) {
      console.error("予約受付時間の削除に失敗:", error);
    }
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return bookingTimeSchedules.filter(schedule => schedule.day_of_week === dayOfWeek);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM形式
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">予約受付時間を読み込み中...</p>
        <p className="text-sm text-gray-500 mt-2">データベースに接続しています</p>
      </div>
    );
  }

  const hasAnyBookingSchedule = bookingTimeSchedules.length > 0;

  return (
    <div className="space-y-6">
      {/* ワンクリックセットアップ（未設定の場合のみ） */}
      {!hasAnyBookingSchedule && (
        <Card className="border-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-green-900 mb-3">🚀 簡単セットアップ！</h2>
                <p className="text-lg text-green-800 mb-2">
                  基本営業時間から<strong className="text-2xl text-green-600">自動で</strong>予約受付時間を設定
                </p>
                <p className="text-sm text-green-700">
                  準備・片付け時間を除いた予約受付時間を自動計算します
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-inner mb-6 max-w-xl mx-auto">
                <h4 className="font-bold text-gray-800 mb-3">📋 自動設定のルール：</h4>
                <div className="space-y-2 text-sm text-left">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    基本営業時間の<strong>30分後</strong>から予約受付開始
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    基本営業時間の<strong>30分前</strong>まで予約受付
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    準備・片付け時間を自動確保
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    例：営業時間 10:00-19:00 → 予約受付 10:30-18:30
                  </p>
                </div>
              </div>

              <Button
                onClick={handleAutoSetupFromClinic}
                disabled={isAutoSetting}
                size="lg"
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                {isAutoSetting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    設定中...
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 mr-3" />
                    基本営業時間から自動設定する
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                ※ 設定後、各時間帯を自由に編集・削除できます
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 説明カード（設定済みの場合） */}
      {hasAnyBookingSchedule && (
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 text-lg">✅ 予約受付時間が設定されています</h4>
                <p className="text-sm text-green-800">
                  下の各曜日カードで編集・削除できます。受付可能/不可の切り替えもワンクリックです。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            週間設定
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            特別設定
          </TabsTrigger>
        </TabsList>

        {/* 週間設定タブ */}
        <TabsContent value="weekly" className="space-y-6">
          {/* 曜日別スケジュール表示 */}
          <div className="grid gap-4">
            {dayNames.map((dayName, dayIndex) => {
              const daySchedules = getScheduleForDay(dayIndex);
              return (
                <Card key={dayIndex}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{dayName}</span>
                      <Badge variant={daySchedules.length > 0 ? "default" : "secondary"}>
                        {daySchedules.length}件の設定
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {daySchedules.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        この曜日には予約受付時間が設定されていません
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* 全体の時間軸表示 */}
                        <div className={`relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 p-2 ${
                          daySchedules.length === 1 ? 'h-16' : daySchedules.length === 2 ? 'h-20' : 'h-24'
                        }`}>
                          {/* 時間ラベル */}
                          <div className="absolute top-0 left-0 right-0 flex justify-between px-2 text-[10px] text-gray-500">
                            <span>6:00</span>
                            <span>9:00</span>
                            <span>12:00</span>
                            <span>15:00</span>
                            <span>18:00</span>
                            <span>22:00</span>
                          </div>
                          
                          {/* 時間帯バー */}
                          <div className="relative mt-4 flex-1" style={{ height: `${daySchedules.length * 28}px` }}>
                            {daySchedules.map((schedule, idx) => {
                              const timeToPercent = (time: string) => {
                                try {
                                  const [hours, minutes] = time.split(':').map(Number);
                                  if (isNaN(hours) || isNaN(minutes)) return 0;
                                  const totalMinutes = hours * 60 + minutes;
                                  const startMinutes = 6 * 60;
                                  const endMinutes = 22 * 60;
                                  return Math.max(0, Math.min(100, ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100));
                                } catch (error) {
                                  console.error('時間変換エラー:', error);
                                  return 0;
                                }
                              };
                              
                              const startPercent = timeToPercent(schedule.start_time);
                              const endPercent = timeToPercent(schedule.end_time);
                              
                              return (
                                <div
                                  key={schedule.id}
                                  className={`absolute h-6 rounded transition-all cursor-pointer hover:opacity-80 shadow-sm ${
                                    schedule.is_available 
                                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                      : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                  }`}
                                  style={{
                                    left: `${startPercent}%`,
                                    width: `${Math.max(1, endPercent - startPercent)}%`,
                                    top: `${idx * 30}px`
                                  }}
                                  title={`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold whitespace-nowrap px-1">
                                    {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 各設定の詳細 */}
                        {daySchedules.map((schedule, idx) => (
                          <div key={schedule.id} className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                            {editingSchedule === schedule.id ? (
                              <EditScheduleForm
                                schedule={schedule}
                                onSave={(startTime, endTime, isAvailable) => 
                                  handleUpdateSchedule(schedule.id, startTime, endTime, isAvailable)
                                }
                                onCancel={() => setEditingSchedule(null)}
                                isLoading={updateBookingTimeSchedule.isPending}
                              />
                            ) : (
                              <>
                                {/* ラベル */}
                                <div className="mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    時間帯 {idx + 1}
                                  </Badge>
                                </div>
                                
                                {/* バー表示 */}
                                <div className="mb-3">
                                  <TimeRangeSlider
                                    startTime={schedule.start_time.substring(0, 5)}
                                    endTime={schedule.end_time.substring(0, 5)}
                                    onChange={() => {}}
                                    disabled={true}
                                    minHour={6}
                                    maxHour={22}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium">
                                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* 受付可否トグルボタン */}
                                    <Button
                                      variant={schedule.is_available ? "default" : "secondary"}
                                      size="sm"
                                      onClick={() => handleToggleAvailable(schedule)}
                                      disabled={updateBookingTimeSchedule.isPending}
                                      className={`flex items-center gap-2 ${
                                        schedule.is_available 
                                          ? 'bg-green-600 hover:bg-green-700' 
                                          : 'bg-gray-400 hover:bg-gray-500'
                                      }`}
                                    >
                                      {schedule.is_available ? (
                                        <>
                                          <ToggleRight className="h-4 w-4" />
                                          受付可能
                                        </>
                                      ) : (
                                        <>
                                          <ToggleLeft className="h-4 w-4" />
                                          受付不可
                                        </>
                                      )}
                                    </Button>
                                    
                                    {/* 編集ボタン */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingSchedule(schedule.id)}
                                      className="flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      編集
                                    </Button>
                                    
                                    {/* 削除ボタン */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteSchedule(schedule.id, schedule)}
                                      disabled={deleteBookingTimeSchedule?.isPending}
                                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      削除
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}

                        {/* 時間帯追加ボタン */}
                        {daySchedules.length < 3 && (
                          <Button
                            variant="outline"
                            className="w-full border-2 border-dashed border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-500 h-14 text-base font-bold shadow-sm"
                            onClick={async () => {
                              const defaultTimes = [
                                { start: "10:00", end: "13:00" },
                                { start: "15:00", end: "19:00" },
                                { start: "20:00", end: "21:00" }
                              ];
                              
                              const defaultTime = defaultTimes[daySchedules.length] || defaultTimes[1];
                              
                              await insertBookingTimeSchedule.mutateAsync({
                                dayOfWeek: dayIndex,
                                startTime: defaultTime.start,
                                endTime: defaultTime.end,
                                isAvailable: true
                              });
                            }}
                            disabled={insertBookingTimeSchedule.isPending}
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            {insertBookingTimeSchedule.isPending 
                              ? "追加中..." 
                              : daySchedules.length === 0 
                                ? `${dayName}に時間帯を追加`
                                : daySchedules.length === 1
                                  ? "🍽️ 午後の時間帯を追加（休憩時間を設定）"
                                  : "➕ 3つ目の時間帯を追加"
                            }
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 特別設定タブ */}
        <TabsContent value="special">
          <SpecialBookingTimeManager
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 編集フォームコンポーネント
interface EditScheduleFormProps {
  schedule: any;
  onSave: (startTime: string, endTime: string, isAvailable: boolean) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditScheduleForm = ({ schedule, onSave, onCancel, isLoading }: EditScheduleFormProps) => {
  const [startTime, setStartTime] = useState(schedule.start_time.substring(0, 5));
  const [endTime, setEndTime] = useState(schedule.end_time.substring(0, 5));
  const [isAvailable, setIsAvailable] = useState(schedule.is_available);

  const handleTimeChange = (newStartTime: string, newEndTime: string) => {
    setStartTime(newStartTime);
    setEndTime(newEndTime);
  };

  return (
    <div className="space-y-4">
      {/* バースライダー */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <Label className="text-sm font-semibold text-blue-900 mb-3 block">
          バーをドラッグして時間を調整
        </Label>
        <TimeRangeSlider
          startTime={startTime}
          endTime={endTime}
          onChange={handleTimeChange}
          minHour={6}
          maxHour={22}
          disabled={isLoading}
        />
      </div>

      {/* 受付可能スイッチとボタン */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Switch
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
            disabled={isLoading}
          />
          <Label className="text-sm font-medium">
            {isAvailable ? "受付可能" : "受付停止"}
          </Label>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onSave(startTime, endTime, isAvailable)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "保存中..." : "保存"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
};