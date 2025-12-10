import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, AlertCircle, Save, X, Trash2, ToggleLeft, ToggleRight, Building2, CheckCircle } from "lucide-react";
import { TimeRangeSlider } from "./TimeRangeSlider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BasicScheduleManagerProps {
  selectedYear: number;
  selectedMonth: number;
}

interface ClinicSchedule {
  id: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const BasicScheduleManager = ({
  selectedYear,
  selectedMonth
}: BasicScheduleManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "19:00",
    isAvailable: true
  });
  const [isAutoSetting, setIsAutoSetting] = useState(false);

  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

  // ワンクリック自動設定
  const handleAutoSetup = async () => {
    setIsAutoSetting(true);
    try {
      const defaultSchedules = [
        // 月曜〜金曜: 10:00-13:30, 15:00-19:00
        { dayOfWeek: 1, startTime: "10:00", endTime: "13:30", isAvailable: true },
        { dayOfWeek: 1, startTime: "15:00", endTime: "19:00", isAvailable: true },
        { dayOfWeek: 2, startTime: "10:00", endTime: "13:30", isAvailable: true },
        { dayOfWeek: 2, startTime: "15:00", endTime: "19:00", isAvailable: true },
        { dayOfWeek: 3, startTime: "10:00", endTime: "13:30", isAvailable: true },
        { dayOfWeek: 3, startTime: "15:00", endTime: "19:00", isAvailable: true },
        { dayOfWeek: 5, startTime: "10:00", endTime: "13:30", isAvailable: true },
        { dayOfWeek: 5, startTime: "15:00", endTime: "19:00", isAvailable: true },
        // 土曜: 9:00-12:30, 14:00-17:30
        { dayOfWeek: 6, startTime: "09:00", endTime: "12:30", isAvailable: true },
        { dayOfWeek: 6, startTime: "14:00", endTime: "17:30", isAvailable: true },
      ];

      for (const schedule of defaultSchedules) {
        await supabase
          .from("clinic_schedules")
          .insert({
            year: selectedYear,
            month: selectedMonth,
            day_of_week: schedule.dayOfWeek,
            start_time: schedule.startTime + ":00",
            end_time: schedule.endTime + ":00",
            is_available: schedule.isAvailable,
          });
      }

      queryClient.invalidateQueries({ queryKey: ["clinicSchedules"] });
      toast({
        title: "✅ 自動設定完了！",
        description: "一般的な歯科医院の営業時間を設定しました。必要に応じて編集してください。",
      });
    } catch (error) {
      console.error("自動設定エラー:", error);
      toast({
        variant: "destructive",
        title: "自動設定に失敗しました",
        description: "手動で設定してください。",
      });
    } finally {
      setIsAutoSetting(false);
    }
  };

  // データ取得
  const { data: clinicSchedules = [], isLoading } = useQuery({
    queryKey: ["clinicSchedules", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_schedules")
        .select("*")
        .eq("year", selectedYear)
        .eq("month", selectedMonth)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("基本営業時間取得エラー:", error);
        return [] as ClinicSchedule[];
      }

      return (data || []) as ClinicSchedule[];
    },
  });

  // 追加
  const insertMutation = useMutation({
    mutationFn: async (schedule: typeof newSchedule) => {
      const { data, error } = await supabase
        .from("clinic_schedules")
        .insert({
          year: selectedYear,
          month: selectedMonth,
          day_of_week: schedule.dayOfWeek,
          start_time: schedule.startTime + ":00",
          end_time: schedule.endTime + ":00",
          is_available: schedule.isAvailable,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "基本営業時間を追加しました" });
      queryClient.invalidateQueries({ queryKey: ["clinicSchedules"] });
      setNewSchedule({
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "19:00",
        isAvailable: true
      });
    },
    onError: () => {
      toast({ variant: "destructive", title: "追加に失敗しました" });
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: async ({ id, startTime, endTime, isAvailable }: any) => {
      const { error } = await supabase
        .from("clinic_schedules")
        .update({
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          is_available: isAvailable,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "基本営業時間を更新しました" });
      queryClient.invalidateQueries({ queryKey: ["clinicSchedules"] });
      setEditingSchedule(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "更新に失敗しました" });
    },
  });

  // 削除
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clinic_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "基本営業時間を削除しました" });
      queryClient.invalidateQueries({ queryKey: ["clinicSchedules"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "削除に失敗しました" });
    },
  });

  const handleCreate = async () => {
    await insertMutation.mutateAsync(newSchedule);
  };

  const handleUpdate = async (id: string, startTime: string, endTime: string, isAvailable: boolean) => {
    await updateMutation.mutateAsync({ id, startTime, endTime, isAvailable });
  };

  const handleToggle = async (schedule: ClinicSchedule) => {
    await updateMutation.mutateAsync({
      id: schedule.id,
      startTime: schedule.start_time.substring(0, 5),
      endTime: schedule.end_time.substring(0, 5),
      isAvailable: !schedule.is_available,
    });
  };

  const handleDelete = async (id: string, schedule: ClinicSchedule) => {
    if (!window.confirm(`${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)} を削除しますか？`)) return;
    await deleteMutation.mutateAsync(id);
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return clinicSchedules.filter(s => s.day_of_week === dayOfWeek);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">基本営業時間を読み込み中...</p>
      </div>
    );
  }

  const hasAnySchedule = clinicSchedules.length > 0;

  return (
    <div className="space-y-6">
      {/* ワンクリックセットアップ */}
      {!hasAnySchedule && (
        <Card className="border-4 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-blue-900 mb-3">🚀 簡単スタート！</h2>
                <p className="text-lg text-blue-800 mb-2">
                  たった<strong className="text-2xl text-blue-600">1クリック</strong>で営業時間を設定できます
                </p>
                <p className="text-sm text-blue-700">
                  一般的な歯科医院の営業時間を自動設定します（後で編集可能）
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-inner mb-6 max-w-2xl mx-auto">
                <h4 className="font-bold text-gray-800 mb-3">📋 自動設定される内容：</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-left">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold text-blue-900">月〜金曜日</p>
                    <p className="text-xs text-blue-700">午前 10:00-13:30</p>
                    <p className="text-xs text-blue-700">午後 15:00-19:00</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-semibold text-green-900">土曜日</p>
                    <p className="text-xs text-green-700">午前 9:00-12:30</p>
                    <p className="text-xs text-green-700">午後 14:00-17:30</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 col-span-2">
                    <p className="font-semibold text-gray-900">日曜・木曜</p>
                    <p className="text-xs text-gray-700">休診日（設定なし）</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAutoSetup}
                disabled={isAutoSetting}
                size="lg"
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
              >
                {isAutoSetting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    設定中...
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 mr-3" />
                    ワンクリックで営業時間を設定する
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                ※ 設定後、各曜日ごとに自由に編集・削除できます
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 説明カード（設定済みの場合のみ表示） */}
      {hasAnySchedule && (
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 text-lg">✅ 基本営業時間が設定されています</h4>
                <p className="text-sm text-green-800">
                  下の各曜日カードで編集・削除できます。営業/休業の切り替えもワンクリックです。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-3">この曜日には営業時間が設定されていません</p>
                    <Button
                      variant="outline"
                      className="border-2 border-dashed border-blue-300 text-blue-600"
                      onClick={async () => {
                        await insertMutation.mutateAsync({
                          dayOfWeek: dayIndex,
                          startTime: dayIndex === 6 ? "09:00" : "10:00",
                          endTime: dayIndex === 6 ? "17:00" : "19:00",
                          isAvailable: true
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {dayName}の営業時間を追加
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 全体バー表示 */}
                    <div className={`relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 p-2 ${
                      daySchedules.length === 1 ? 'h-16' : daySchedules.length === 2 ? 'h-20' : 'h-24'
                    }`}>
                      <div className="absolute top-0 left-0 right-0 flex justify-between px-2 text-[10px] text-gray-500">
                        <span>6:00</span>
                        <span>9:00</span>
                        <span>12:00</span>
                        <span>15:00</span>
                        <span>18:00</span>
                        <span>22:00</span>
                      </div>
                      
                      <div className="relative mt-4 flex-1" style={{ height: `${daySchedules.length * 28}px` }}>
                        {daySchedules.map((schedule, idx) => {
                          const timeToPercent = (time: string) => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const totalMinutes = hours * 60 + minutes;
                            return ((totalMinutes - 6 * 60) / (16 * 60)) * 100;
                          };
                          
                          const startPercent = timeToPercent(schedule.start_time);
                          const endPercent = timeToPercent(schedule.end_time);
                          
                          return (
                            <div
                              key={schedule.id}
                              className={`absolute h-6 rounded shadow-sm ${
                                schedule.is_available 
                                  ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                                  : 'bg-gradient-to-r from-gray-300 to-gray-400'
                              }`}
                              style={{
                                left: `${startPercent}%`,
                                width: `${Math.max(1, endPercent - startPercent)}%`,
                                top: `${idx * 30}px`
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                                {schedule.start_time.substring(0, 5)}-{schedule.end_time.substring(0, 5)}
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
                          <EditForm
                            schedule={schedule}
                            onSave={handleUpdate}
                            onCancel={() => setEditingSchedule(null)}
                            isLoading={updateMutation.isPending}
                          />
                        ) : (
                          <>
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">営業時間 {idx + 1}</Badge>
                            </div>
                            
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
                              <span className="text-sm text-gray-600 font-medium">
                                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={schedule.is_available ? "default" : "secondary"}
                                  size="sm"
                                  onClick={() => handleToggle(schedule)}
                                  className={`flex items-center gap-2 ${
                                    schedule.is_available 
                                      ? 'bg-blue-600 hover:bg-blue-700' 
                                      : 'bg-gray-400 hover:bg-gray-500'
                                  }`}
                                >
                                  {schedule.is_available ? (
                                    <><ToggleRight className="h-4 w-4" />営業</>
                                  ) : (
                                    <><ToggleLeft className="h-4 w-4" />休業</>
                                  )}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSchedule(schedule.id)}
                                >
                                  <Edit className="h-4 w-4" />編集
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(schedule.id, schedule)}
                                  className="text-red-600 hover:bg-red-50 border-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />削除
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {daySchedules.length < 3 && (
                      <Button
                        variant="outline"
                        className="w-full border-2 border-dashed"
                        onClick={async () => {
                          const times = [
                            { start: "10:00", end: "13:00" },
                            { start: "15:00", end: "19:00" },
                            { start: "20:00", end: "21:00" }
                          ];
                          const time = times[daySchedules.length] || times[1];
                          await insertMutation.mutateAsync({
                            dayOfWeek: dayIndex,
                            startTime: time.start,
                            endTime: time.end,
                            isAvailable: true
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        時間帯を追加
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

interface EditFormProps {
  schedule: ClinicSchedule;
  onSave: (id: string, startTime: string, endTime: string, isAvailable: boolean) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditForm = ({ schedule, onSave, onCancel, isLoading }: EditFormProps) => {
  const [startTime, setStartTime] = useState(schedule.start_time.substring(0, 5));
  const [endTime, setEndTime] = useState(schedule.end_time.substring(0, 5));
  const [isAvailable, setIsAvailable] = useState(schedule.is_available);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <Label className="text-sm font-semibold text-blue-900 mb-3 block">
          バーをドラッグして時間を調整
        </Label>
        <TimeRangeSlider
          startTime={startTime}
          endTime={endTime}
          onChange={(s, e) => { setStartTime(s); setEndTime(e); }}
          minHour={6}
          maxHour={22}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          <Label>{isAvailable ? "診療日" : "休業日"}</Label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(schedule.id, startTime, endTime, isAvailable)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-1" />{isLoading ? "保存中..." : "保存"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
};

