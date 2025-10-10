import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { useSpecialBookingTimeSchedules } from "@/hooks/useBookingTimeSchedules";
import { useBookingTimeOperations } from "@/hooks/useBookingTimeOperations";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface SpecialBookingTimeManagerProps {
  selectedYear: number;
  selectedMonth: number;
}

export const SpecialBookingTimeManager = ({
  selectedYear,
  selectedMonth
}: SpecialBookingTimeManagerProps) => {
  const { data: specialSchedules = [], isLoading } = useSpecialBookingTimeSchedules(selectedYear, selectedMonth);
  const {
    insertSpecialBookingTimeSchedule,
    updateSpecialBookingTimeSchedule,
    deleteSpecialBookingTimeSchedule
  } = useBookingTimeOperations(selectedYear, selectedMonth);

  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    specificDate: format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true
  });

  const handleCreateSchedule = async () => {
    await insertSpecialBookingTimeSchedule.mutateAsync(newSchedule);
    setNewSchedule({
      specificDate: format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd'),
      startTime: "09:00",
      endTime: "18:00",
      isAvailable: true
    });
  };

  const handleUpdateSchedule = async (scheduleId: string, startTime: string, endTime: string, isAvailable: boolean) => {
    await updateSpecialBookingTimeSchedule.mutateAsync({
      scheduleId,
      startTime,
      endTime,
      isAvailable
    });
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('この特別予約受付時間設定を削除しますか？')) {
      await deleteSpecialBookingTimeSchedule.mutateAsync(scheduleId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'M月d日(E)', { locale: ja });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM形式
  };

  // 日付順にソート
  const sortedSchedules = [...specialSchedules].sort((a, b) => 
    a.specific_date.localeCompare(b.specific_date)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">特別予約受付時間を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 説明カード */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">📅 特別予約受付時間について</h4>
              <p className="text-sm text-green-700 mb-2">
                特定の日付で<strong>通常とは異なる予約受付時間</strong>を設定できます。
              </p>
              <div className="text-xs text-green-600 space-y-1">
                <p>• 祝日の短縮営業：10:00-15:00で予約受付</p>
                <p>• 特別診療日：14:00-20:00で予約受付</p>
                <p>• 休診日：予約受付停止</p>
                <p>• 特別設定は週間設定より優先されます</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新規作成フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            特別予約受付時間を追加
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>対象日</Label>
              <Input
                type="date"
                value={newSchedule.specificDate}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, specificDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>開始時間</Label>
              <Input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label>終了時間</Label>
              <Input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-center space-x-2 mb-2">
                <Switch
                  checked={newSchedule.isAvailable}
                  onCheckedChange={(checked) => setNewSchedule(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label>受付可能</Label>
              </div>
              <Button
                onClick={handleCreateSchedule}
                disabled={insertSpecialBookingTimeSchedule.isPending}
                className="w-full"
              >
                {insertSpecialBookingTimeSchedule.isPending ? "追加中..." : "追加"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 特別スケジュール一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            特別予約受付時間一覧
            <Badge variant="secondary">{sortedSchedules.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedSchedules.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              特別予約受付時間が設定されていません
            </p>
          ) : (
            <div className="space-y-3">
              {sortedSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {editingSchedule === schedule.id ? (
                    <EditSpecialScheduleForm
                      schedule={schedule}
                      onSave={(startTime, endTime, isAvailable) => 
                        handleUpdateSchedule(schedule.id, startTime, endTime, isAvailable)
                      }
                      onCancel={() => setEditingSchedule(null)}
                      isLoading={updateSpecialBookingTimeSchedule.isPending}
                    />
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-lg">
                            {formatDate(schedule.specific_date)}
                          </span>
                          <Badge variant={schedule.is_available ? "default" : "secondary"}>
                            {schedule.is_available ? "受付可能" : "受付停止"}
                          </Badge>
                        </div>
                        <div className="text-gray-600">
                          {schedule.is_available ? (
                            <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                          ) : (
                            <span>予約受付停止</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSchedule(schedule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={deleteSpecialBookingTimeSchedule.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// 特別スケジュール編集フォームコンポーネント
interface EditSpecialScheduleFormProps {
  schedule: any;
  onSave: (startTime: string, endTime: string, isAvailable: boolean) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditSpecialScheduleForm = ({ schedule, onSave, onCancel, isLoading }: EditSpecialScheduleFormProps) => {
  const [startTime, setStartTime] = useState(schedule.start_time.substring(0, 5));
  const [endTime, setEndTime] = useState(schedule.end_time.substring(0, 5));
  const [isAvailable, setIsAvailable] = useState(schedule.is_available);

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="min-w-fit">
        <span className="font-medium">
          {format(new Date(schedule.specific_date + 'T00:00:00'), 'M月d日(E)', { locale: ja })}
        </span>
      </div>
      
      {isAvailable ? (
        <>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-32"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-32"
          />
        </>
      ) : (
        <span className="text-gray-500 flex-1">予約受付停止</span>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label className="text-xs whitespace-nowrap">受付可能</Label>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave(startTime, endTime, isAvailable)}
          disabled={isLoading}
        >
          {isLoading ? "保存中..." : "保存"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
};