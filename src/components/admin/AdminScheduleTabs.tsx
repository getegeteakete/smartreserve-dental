
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "./MonthSelector";
import { InteractiveBusinessCalendar } from "./InteractiveBusinessCalendar";

import { BusinessCalendarPreview } from "./BusinessCalendarPreview";
import { BookingTimeScheduleManager } from "./BookingTimeScheduleManager";

interface AdminScheduleTabsProps {
  selectedYear: number;
  selectedMonth: number;
  schedules: any[];
  specialSchedules: any[];
  loading: boolean;
  onYearMonthChange: (year: number, month: number) => void;
  onScheduleChange: (dayOfWeek: number, timeSlot: { start: string; end: string }, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleAdd: (selectedDate: Date, selectedTime: string) => Promise<void>;
  onSpecialScheduleToggle: (scheduleId: string, isAvailable: boolean) => Promise<void>;
  onSpecialScheduleDelete: (scheduleId: string) => Promise<void>;
}

export const AdminScheduleTabs = ({
  selectedYear,
  selectedMonth,
  schedules,
  specialSchedules,
  loading,
  onYearMonthChange,
  onScheduleChange,
  onSpecialScheduleAdd,
  onSpecialScheduleToggle,
  onSpecialScheduleDelete
}: AdminScheduleTabsProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">診療時間設定</TabsTrigger>
          <TabsTrigger value="booking-time">予約受付時間</TabsTrigger>
          <TabsTrigger value="business-calendar">営業日カレンダー</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>診療時間スケジュール設定</CardTitle>
              <div className="flex items-center gap-4">
                <MonthSelector
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onYearMonthChange={onYearMonthChange}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 診療時間設定について</h4>
                <p className="text-sm text-blue-700">
                  ここでは医院の<strong>診療時間</strong>を設定します。これはホームページや案内に表示される時間です。<br/>
                  実際の<strong>予約受付時間</strong>は「予約受付時間」タブで別途設定できます。
                </p>
              </div>
              <InteractiveBusinessCalendar
                schedules={schedules}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearMonthChange={onYearMonthChange}
                onScheduleChange={onScheduleChange}
                onSpecialScheduleAdd={onSpecialScheduleAdd}
                onSpecialScheduleDelete={onSpecialScheduleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking-time" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>予約受付時間設定</CardTitle>
              <div className="flex items-center gap-4">
                <MonthSelector
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onYearMonthChange={onYearMonthChange}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">⏰ 予約受付時間設定について</h4>
                <p className="text-sm text-green-700">
                  ここでは実際に<strong>予約を受け付ける時間</strong>を設定します。<br/>
                  診療時間内で、患者さんが実際に予約できる時間帯を調整できます。
                </p>
                <div className="mt-2 text-xs text-green-600">
                  例：診療時間 10:00-19:00 / 予約受付時間 10:30-18:30（準備・片付け時間を除外）
                </div>
              </div>
              <BookingTimeScheduleManager
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="business-calendar" className="space-y-6">
          <BusinessCalendarPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
};
