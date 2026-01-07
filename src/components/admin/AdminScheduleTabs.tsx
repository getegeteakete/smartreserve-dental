
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "./MonthSelector";
import { InteractiveBusinessCalendar } from "./InteractiveBusinessCalendar";
import { BusinessCalendarPreview } from "./BusinessCalendarPreview";
import { BookingTimeScheduleManager } from "./BookingTimeScheduleManager";
import { BasicScheduleManager } from "./BasicScheduleManager";
import WeeklyBusinessCalendar from "@/components/WeeklyBusinessCalendar";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // 基本営業時間の設定状況をチェック
  const { data: clinicSchedules = [] } = useQuery({
    queryKey: ["clinicSchedules", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await supabase
        .from("clinic_schedules")
        .select("*")
        .eq("year", selectedYear)
        .eq("month", selectedMonth);
      return data || [];
    },
  });

  // 予約受付時間の設定状況をチェック
  const { data: bookingSchedules = [] } = useQuery({
    queryKey: ["bookingTimeSchedules", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await supabase
        .from("booking_time_schedules")
        .select("*")
        .eq("year", selectedYear)
        .eq("month", selectedMonth);
      return data || [];
    },
  });

  const hasBasicSchedule = clinicSchedules.length > 0;
  const hasBookingSchedule = bookingSchedules.length > 0;

  return (
    <div className="w-full">
      {/* 進捗インジケーター */}
      <div className="mb-6 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-gray-800">📊 設定進捗</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-2 ${hasBasicSchedule ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
            <div className="flex items-center gap-2 mb-1">
              {hasBasicSchedule ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              <span className="font-semibold text-sm">ステップ1</span>
            </div>
            <p className="text-xs font-medium">基本営業時間</p>
            <Badge variant={hasBasicSchedule ? "default" : "secondary"} className="mt-2">
              {hasBasicSchedule ? `✓ 設定済み (${clinicSchedules.length}件)` : '未設定（必須）'}
            </Badge>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${hasBookingSchedule ? 'bg-green-50 border-green-300' : hasBasicSchedule ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}`}>
            <div className="flex items-center gap-2 mb-1">
              {hasBookingSchedule ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : hasBasicSchedule ? (
                <AlertCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-semibold text-sm">ステップ2</span>
            </div>
            <p className="text-xs font-medium">予約受付時間</p>
            <Badge variant={hasBookingSchedule ? "default" : hasBasicSchedule ? "outline" : "secondary"} className="mt-2">
              {hasBookingSchedule ? `✓ 設定済み (${bookingSchedules.length}件)` : hasBasicSchedule ? '設定可能' : 'ロック中'}
            </Badge>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${hasBasicSchedule ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}`}>
            <div className="flex items-center gap-2 mb-1">
              {hasBasicSchedule ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-semibold text-sm">ステップ3</span>
            </div>
            <p className="text-xs font-medium">カレンダー調整</p>
            <Badge variant={hasBasicSchedule ? "outline" : "secondary"} className="mt-2">
              {hasBasicSchedule ? '設定可能' : 'ロック中'}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic-schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-schedule" className="flex items-center gap-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">1</span>
            基本営業時間
          </TabsTrigger>
          <TabsTrigger value="booking-time" disabled={!hasBasicSchedule} className="flex items-center gap-2">
            <span className={`rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold ${hasBasicSchedule ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>2</span>
            予約受付時間
            {!hasBasicSchedule && <Lock className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="business-calendar" disabled={!hasBasicSchedule} className="flex items-center gap-2">
            <span className={`rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold ${hasBasicSchedule ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>3</span>
            カレンダー調整
            {!hasBasicSchedule && <Lock className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        
        {/* ステップ1: 基本営業時間 */}
        <TabsContent value="basic-schedule" className="space-y-6">
          <BasicScheduleManager
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </TabsContent>

        {/* ステップ2: 予約受付時間 */}
        <TabsContent value="booking-time" className="space-y-6">
          {hasBasicSchedule ? (
            <BookingTimeScheduleManager
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          ) : (
            <Card className="border-2 border-red-300">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">予約受付時間は設定できません</h3>
                  <p className="text-gray-600 mb-4">
                    まず<strong className="text-orange-600">「基本営業時間」</strong>を設定してください。
                  </p>
                  <Badge variant="destructive" className="text-base px-4 py-2">
                    ⚠️ ステップ1を完了してください
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* ステップ3: カレンダー調整 */}
        <TabsContent value="business-calendar" className="space-y-6">
          {hasBasicSchedule ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>診療日カレンダー - 特別設定</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">📅 カレンダー調整について</h4>
                    <p className="text-sm text-purple-700 mb-2">
                      カレンダーの日付を<strong>クリック</strong>すると、その日付の営業時間を個別に調整できます。
                    </p>
                    <div className="text-sm text-purple-700 space-y-1">
                      <p>✅ <strong>日付をクリック</strong> → その日だけの営業時間をバーで調整</p>
                      <p>✅ <strong>複数の時間帯</strong> → 午前・午後など複数の営業時間を設定可能</p>
                      <p>✅ <strong>個別設定</strong> → 他の日付には影響しません</p>
                      <p>💡 例：祝日の休診、臨時営業、年末年始の特別営業時間など</p>
                    </div>
                  </div>
                  
                  {/* 今週の診療カレンダープレビュー */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">今週の診療カレンダープレビュー</h4>
                    <WeeklyBusinessCalendar />
                  </div>
                  
                  {/* 今週の診療カレンダー WordPress埋め込みコード */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      📋 今週の診療カレンダー WordPress用埋め込みコード
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      以下のコードをコピーして、WordPressのカスタムHTMLブロックに貼り付けてください。
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{`<div style="width: 100%; margin: 20px auto; overflow-x: auto;">
  <iframe 
    src="https://489.toyoshima-do.com/calendar-embed" 
    width="100%" 
    height="950" 
    frameborder="0" 
    style="border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 320px;"
    scrolling="no"
    loading="lazy">
  </iframe>
</div>`}</code>
                    </pre>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const code = `<div style="width: 100%; margin: 20px auto; overflow-x: auto;">
  <iframe 
    src="https://489.toyoshima-do.com/calendar-embed" 
    width="100%" 
    height="950" 
    frameborder="0" 
    style="border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 320px;"
    scrolling="no"
    loading="lazy">
  </iframe>
</div>`;
                          navigator.clipboard.writeText(code);
                          alert('コードをコピーしました！WordPressのカスタムHTMLブロックに貼り付けてください。');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                      >
                        📋 コードをコピー
                      </button>
                    </div>
                  </div>
                  
                  {/* 診療日カレンダー（月間） WordPress埋め込みコード */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      📋 診療日カレンダー（月間） WordPress用埋め込みコード
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      以下のコードをコピーして、WordPressのカスタムHTMLブロックに貼り付けてください。
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{`<div style="width: 100%; margin: 20px auto;">
  <iframe 
    src="https://489.toyoshima-do.com/calendar-month-embed" 
    width="100%" 
    height="650" 
    frameborder="0" 
    style="border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    scrolling="no"
    loading="lazy">
  </iframe>
</div>`}</code>
                    </pre>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const code = `<div style="width: 100%; margin: 20px auto;">
  <iframe 
    src="https://489.toyoshima-do.com/calendar-month-embed" 
    width="100%" 
    height="650" 
    frameborder="0" 
    style="border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    scrolling="no"
    loading="lazy">
  </iframe>
</div>`;
                          navigator.clipboard.writeText(code);
                          alert('コードをコピーしました！WordPressのカスタムHTMLブロックに貼り付けてください。');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        📋 コードをコピー
                      </button>
                    </div>
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
              <BusinessCalendarPreview />
            </>
          ) : (
            <Card className="border-2 border-red-300">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">カレンダー調整は設定できません</h3>
                  <p className="text-gray-600 mb-4">
                    まず<strong className="text-orange-600">「基本営業時間」</strong>を設定してください。
                  </p>
                  <Badge variant="destructive" className="text-base px-4 py-2">
                    ⚠️ ステップ1を完了してください
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
