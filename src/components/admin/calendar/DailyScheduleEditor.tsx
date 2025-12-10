import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimeRangeSlider } from "../TimeRangeSlider";
import { Plus, Trash2, Save, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DailyScheduleEditorProps {
  selectedDate: Date;
  onClose: () => void;
  onScheduleUpdated: () => void;
}

interface TimeSlot {
  id?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DailyMemo {
  id?: string;
  date: string;
  memo: string;
}

export const DailyScheduleEditor = ({ 
  selectedDate, 
  onClose, 
  onScheduleUpdated 
}: DailyScheduleEditorProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [memo, setMemo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // 初期データの読み込み
  useEffect(() => {
    loadDailySchedule();
    loadMemo();
  }, [selectedDate]);

  const loadDailySchedule = async () => {
    try {
      setLoading(true);
      
      // 特別診療日のスケジュールを取得
      const { data: specialSchedules, error: specialError } = await supabase
        .from('special_clinic_schedules')
        .select('*')
        .eq('specific_date', dateString);

      if (specialError) {
        console.error('特別診療日取得エラー:', specialError);
      }

      // 基本診療日のスケジュールを取得（曜日ベース）
      const dayOfWeek = selectedDate.getDay();
      const { data: basicSchedules, error: basicError } = await supabase
        .from('clinic_schedules')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('year', selectedDate.getFullYear())
        .eq('month', selectedDate.getMonth() + 1);

      if (basicError) {
        console.error('基本診療日取得エラー:', basicError);
      }

      // 特別診療日があればそれを使用、なければ基本診療日を使用
      let schedules: TimeSlot[] = [];
      
      if (specialSchedules && specialSchedules.length > 0) {
        schedules = specialSchedules.map(s => ({
          id: s.id,
          start_time: s.start_time.substring(0, 5), // HH:MM形式
          end_time: s.end_time.substring(0, 5),
          is_available: s.is_available
        }));
      } else if (basicSchedules && basicSchedules.length > 0) {
        schedules = basicSchedules.map(s => ({
          id: s.id,
          start_time: s.start_time.substring(0, 5),
          end_time: s.end_time.substring(0, 5),
          is_available: s.is_available
        }));
      }

      setTimeSlots(schedules);
    } catch (error) {
      console.error('スケジュール読み込みエラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "スケジュールの読み込みに失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMemo = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_memos')
        .select('*')
        .eq('date', dateString)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('メモ取得エラー:', error);
      } else if (data) {
        setMemo(data.memo || '');
      }
    } catch (error) {
      console.error('メモ読み込みエラー:', error);
    }
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      start_time: "10:00",
      end_time: "12:00",
      is_available: true
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const toggleAvailability = (index: number) => {
    const updated = [...timeSlots];
    updated[index].is_available = !updated[index].is_available;
    setTimeSlots(updated);
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      
      // まず既存の特別診療日スケジュールを削除
      await supabase
        .from('special_clinic_schedules')
        .delete()
        .eq('specific_date', dateString);

      // 新しいスケジュールを挿入
      const scheduleData = timeSlots.map(slot => ({
        specific_date: dateString,
        start_time: slot.start_time + ":00",
        end_time: slot.end_time + ":00",
        is_available: slot.is_available
      }));

      const { error: scheduleError } = await supabase
        .from('special_clinic_schedules')
        .insert(scheduleData);

      if (scheduleError) {
        throw scheduleError;
      }

      // メモの保存
      if (memo.trim()) {
        // メモが存在する場合は upsert
        const { error: memoError } = await supabase
          .from('daily_memos')
          .upsert({
            date: dateString,
            memo: memo.trim()
          });

        if (memoError) {
          console.error('メモ保存エラー:', memoError);
        }
      } else {
        // メモが空の場合は削除
        await supabase
          .from('daily_memos')
          .delete()
          .eq('date', dateString);
      }

      toast({
        title: "保存完了",
        description: `${format(selectedDate, 'MM月dd日', { locale: ja })}のスケジュールとメモを更新しました`,
      });

      onScheduleUpdated();
      onClose();
    } catch (error) {
      console.error('スケジュール保存エラー:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "スケジュールの保存に失敗しました",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">スケジュールを読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📅 {format(selectedDate, 'yyyy年MM月dd日(E)', { locale: ja })} のスケジュール調整
          </CardTitle>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>この日のみのスケジュール調整</strong><br/>
            選択した日付の営業時間を個別に設定できます。他の日付には影響しません。
          </p>
        </div>

        {/* 時間帯一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">営業時間帯</h3>
            <Button onClick={addTimeSlot} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              時間帯を追加
            </Button>
          </div>

          {timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>営業時間帯が設定されていません</p>
              <p className="text-sm">「時間帯を追加」ボタンで追加してください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">時間帯 {index + 1}</span>
                      <Button
                        variant={slot.is_available ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAvailability(index)}
                        className={`${
                          slot.is_available 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {slot.is_available ? '✓ 営業中' : '✕ 休業中'}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {slot.is_available && (
                    <p className="text-xs text-gray-500 mb-2">
                      💡 バーをドラッグして時間帯を移動、左右のハンドルで開始・終了時間を調整できます
                    </p>
                  )}
                  
                  <TimeRangeSlider
                    startTime={slot.start_time}
                    endTime={slot.end_time}
                    onChange={(start, end) => {
                      console.log('🔄 DailyScheduleEditor onChange呼び出し:', { index, start, end, currentStart: slot.start_time, currentEnd: slot.end_time });
                      // 一度に両方の値を更新
                      const updated = [...timeSlots];
                      updated[index] = { 
                        ...updated[index], 
                        start_time: start,
                        end_time: end
                      };
                      console.log('🔄 timeSlots更新:', updated[index]);
                      setTimeSlots(updated);
                    }}
                    disabled={!slot.is_available}
                    minHour={0}
                    maxHour={24}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* メモ機能 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">メモ</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-memo" className="text-sm text-gray-600">
              この日の特別な予定や注意事項を記録できます
            </Label>
            <Textarea
              id="daily-memo"
              placeholder="例：祝日のため短縮営業、スタッフ研修のため午後休診、特別イベント開催など..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500">
              💡 メモはカレンダー上でも表示され、スタッフ間での情報共有に活用できます
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button 
            onClick={saveSchedule} 
            disabled={saving || timeSlots.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                スケジュールとメモを保存
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
