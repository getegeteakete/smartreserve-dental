import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Calendar, AlertCircle } from "lucide-react";
import { useBookingTimeSchedules } from "@/hooks/useBookingTimeSchedules";
import { useBookingTimeOperations } from "@/hooks/useBookingTimeOperations";
import { SpecialBookingTimeManager } from "./SpecialBookingTimeManager";

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
    updateBookingTimeSchedule
  } = useBookingTimeOperations(selectedYear, selectedMonth);

  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true
  });

  const dayNames = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

  const handleCreateSchedule = async () => {
    await insertBookingTimeSchedule.mutateAsync(newSchedule);
    setNewSchedule({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "18:00",
      isAvailable: true
    });
  };

  const handleUpdateSchedule = async (scheduleId: string, startTime: string, endTime: string, isAvailable: boolean) => {
    await updateBookingTimeSchedule.mutateAsync({
      scheduleId,
      startTime,
      endTime,
      isAvailable
    });
    setEditingSchedule(null);
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return bookingTimeSchedules.filter(schedule => schedule.day_of_week === dayOfWeek);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM形式
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">予約受付時間を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 説明カード */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">💡 予約受付時間設定について</h4>
              <p className="text-sm text-blue-700 mb-2">
                <strong>診療時間</strong>とは別に、実際に<strong>予約を受け付ける時間</strong>を細かく設定できます。
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>• 診療時間: 10:00-19:00（クリニックが開いている時間）</p>
                <p>• 予約受付時間: 10:30-18:30（患者が予約できる時間）</p>
                <p>• 準備・片付け時間を除外したり、昼休み時間を設定したりできます</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          {/* 新規作成フォーム */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新しい予約受付時間を追加
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>曜日</Label>
                  <select
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {dayNames.map((name, index) => (
                      <option key={index} value={index}>{name}</option>
                    ))}
                  </select>
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
                    disabled={insertBookingTimeSchedule.isPending}
                    className="w-full"
                  >
                    {insertBookingTimeSchedule.isPending ? "追加中..." : "追加"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <div className="space-y-3">
                        {daySchedules.map((schedule) => (
                          <div key={schedule.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
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
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={schedule.is_available ? "default" : "secondary"}>
                                      {schedule.is_available ? "受付可能" : "受付停止"}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSchedule(schedule.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
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

  return (
    <div className="flex items-center gap-3 w-full">
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
      <div className="flex items-center space-x-2">
        <Switch
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label className="text-xs">受付可能</Label>
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