import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentManagement } from "@/hooks/useAppointmentManagement";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isTomorrow, startOfWeek, endOfWeek, addDays, addMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Search, Eye, User, Calendar as CalendarIcon, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  notes: string;
  treatment_name: string;
  fee: number;
  appointment_date: string;
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface DayAppointment {
  date: string;
  count: number;
  appointments: Appointment[];
}

export function ReservationCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dayAppointments, setDayAppointments] = useState<DayAppointment[]>([]);
  const [nextMonthDayAppointments, setNextMonthDayAppointments] = useState<DayAppointment[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayAppointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("patient_name");
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const { toast } = useToast();
  const { handleCancel, handleDelete } = useAppointmentManagement();

  // カレンダー共通スタイル定義
  const commonCalendarStyles = {
    table: { width: '100%', maxWidth: '100%' },
    head_cell: { 
      width: '14.2857%', 
      textAlign: 'center' as const, 
      padding: '8px 4px', 
      fontWeight: 'bold',
      fontSize: '14px'
    },
    row: { display: 'flex', width: '100%', marginBottom: '2px' },
    cell: { 
      width: '14.2857%', 
      textAlign: 'center' as const, 
      padding: '2px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60px',
      minHeight: '60px',
      maxHeight: '60px'
    },
    day: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '40px',
      minHeight: '40px'
    }
  };

  const commonModifiersStyles = {
    hasAppointments: { backgroundColor: '#e0f2fe' },
    sunday: { 
      backgroundColor: '#fce7f3',
      border: '1px solid #f9a8d4',
      borderRadius: '6px'
    },
    saturday: { 
      backgroundColor: '#e0f7fa',
      border: '1px solid #7dd3fc',
      borderRadius: '6px'
    },
    past: {
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      border: '1px solid #d1d5db'
    }
  };

  const commonModifiers = {
    sunday: (date: Date) => date.getDay() === 0,
    saturday: (date: Date) => date.getDay() === 6,
    past: (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
      processCalendarData(data || []);
    } catch (error: any) {
      console.error("予約データ取得エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約データの取得に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const processCalendarData = (appointmentData: Appointment[]) => {
    // 現在の月のデータ処理
    const currentMonth = startOfMonth(selectedDate);
    const endCurrentMonth = endOfMonth(selectedDate);
    const currentMonthDays = eachDayOfInterval({ start: currentMonth, end: endCurrentMonth });

    const currentMonthData: DayAppointment[] = currentMonthDays.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayAppointments = appointmentData.filter(apt => 
        apt.confirmed_date === dayString || 
        (apt.appointment_date && apt.appointment_date.startsWith(dayString))
      );

      return {
        date: dayString,
        count: dayAppointments.length,
        appointments: dayAppointments
      };
    });

    // 次の月のデータ処理
    const nextMonth = addMonths(selectedDate, 1);
    const nextMonthStart = startOfMonth(nextMonth);
    const nextMonthEnd = endOfMonth(nextMonth);
    const nextMonthDays = eachDayOfInterval({ start: nextMonthStart, end: nextMonthEnd });

    const nextMonthData: DayAppointment[] = nextMonthDays.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayAppointments = appointmentData.filter(apt => 
        apt.confirmed_date === dayString || 
        (apt.appointment_date && apt.appointment_date.startsWith(dayString))
      );

      return {
        date: dayString,
        count: dayAppointments.length,
        appointments: dayAppointments
      };
    });

    setDayAppointments(currentMonthData);
    setNextMonthDayAppointments(nextMonthData);
  };

  const handleSearch = () => {
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setFilteredAppointments([]);
      return;
    }

    const filtered = appointments.filter(appointment => {
      const value = appointment[searchField as keyof Appointment]?.toString().toLowerCase() || "";
      return value.includes(searchQuery.toLowerCase());
    });

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">承認待ち</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">確定</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">キャンセル</Badge>;
      default:
        return <Badge variant="secondary">不明</Badge>;
    }
  };

  const getDayContent = (date: Date, monthAppointments: DayAppointment[]) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = monthAppointments.find(day => day.date === dateString);
    
    if (dayData && dayData.count > 0) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <span className="text-sm">{format(date, 'd')}</span>
          <Badge variant="secondary" className="text-xs mt-1 bg-blue-100 text-blue-800">
            {dayData.count}件
          </Badge>
        </div>
      );
    }
    
    return <span>{format(date, 'd')}</span>;
  };

  const handleDateClick = (date: Date, monthAppointments: DayAppointment[]) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = monthAppointments.find(day => day.date === dateString);
    setSelectedDayData(dayData || null);
  };

  const getTodayAppointments = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.confirmed_date === today || 
      (apt.appointment_date && apt.appointment_date.startsWith(today))
    );
  };

  const getTomorrowAppointments = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.confirmed_date === tomorrowStr || 
      (apt.appointment_date && apt.appointment_date.startsWith(tomorrowStr))
    );
  };

  const getThisWeekAppointments = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 日曜日開始
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    return appointments.filter(apt => {
      const appointmentDate = apt.confirmed_date || apt.appointment_date?.split('T')[0];
      if (!appointmentDate) return false;
      
      const date = new Date(appointmentDate);
      return date >= weekStart && date <= weekEnd;
    });
  };

  const getWeeklyAppointments = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 日曜日開始
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayAppointments = appointments.filter(apt => 
        apt.confirmed_date === dateStr || 
        (apt.appointment_date && apt.appointment_date.startsWith(dateStr))
      );
      
      weekDays.push({
        date: dateStr,
        dayName: format(date, 'EEEE', { locale: ja }),
        dayNumber: format(date, 'MM/dd'),
        appointments: dayAppointments,
        isToday: format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      });
    }
    
    return weekDays;
  };

  const renderAppointmentTable = (appointmentList: Appointment[], title: string, showDate?: boolean) => (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({appointmentList.length}件)</CardTitle>
      </CardHeader>
      <CardContent>
        {appointmentList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">予約がありません</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {showDate && <TableHead>日時</TableHead>}
                <TableHead>時間</TableHead>
                <TableHead>患者名</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>コース</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentList.map((appointment) => (
                <TableRow key={appointment.id}>
                  {showDate && (
                    <TableCell>
                      {appointment.confirmed_date 
                        ? (() => {
                            // タイムゾーン変換を避けるため、日付文字列を直接解析
                            const [year, month, day] = appointment.confirmed_date.split('-');
                            return `${month}月${day}日`;
                          })()
                        : "未定"
                      }
                    </TableCell>
                  )}
                  <TableCell>
                    {appointment.confirmed_time_slot || "未定"}
                  </TableCell>
                  <TableCell>{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.phone}</TableCell>
                  <TableCell>{appointment.treatment_name}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>予約者情報</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>患者名</Label>
                              <p className="text-sm">{appointment.patient_name}</p>
                            </div>
                            <div>
                              <Label>年齢</Label>
                              <p className="text-sm">{appointment.age}歳</p>
                            </div>
                            <div>
                              <Label>電話番号</Label>
                              <p className="text-sm">{appointment.phone}</p>
                            </div>
                            <div>
                              <Label>メール</Label>
                              <p className="text-sm">{appointment.email}</p>
                            </div>
                            <div>
                              <Label>コース</Label>
                              <p className="text-sm">{appointment.treatment_name}</p>
                            </div>
                            <div>
                              <Label>料金</Label>
                              <p className="text-sm">¥{appointment.fee?.toLocaleString()}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>申込日</Label>
                              <p className="text-sm">
                                {format(new Date(appointment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                              </p>
                            </div>
                            {appointment.notes && (
                              <div className="col-span-2">
                                <Label>備考</Label>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const getAllAppointmentsSorted = () => {
    return appointments
      .filter(apt => apt.status !== 'cancelled')
      .sort((a, b) => {
        const dateA = a.confirmed_date || a.appointment_date?.split('T')[0] || '9999-12-31';
        const dateB = b.confirmed_date || b.appointment_date?.split('T')[0] || '9999-12-31';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    await handleCancel(appointment);
    fetchAppointments();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    await handleDelete(appointmentId);
    fetchAppointments();
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(addMonths(selectedDate, -1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    processCalendarData(appointments);
  }, [selectedDate, appointments]);

  return (
    <div className="space-y-6">
      {/* 予約数サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">今週の予約</p>
                <p className="text-2xl font-bold text-blue-600">{getThisWeekAppointments().length}件</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">明日の予約</p>
                <p className="text-2xl font-bold text-orange-600">{getTomorrowAppointments().length}件</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">今日の予約</p>
                <p className="text-2xl font-bold text-green-600">{getTodayAppointments().length}件</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 予約一覧表示ボタン */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setShowAllAppointments(!showAllAppointments)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {showAllAppointments ? "予約一覧を閉じる" : "予約一覧表示"}
        </Button>
      </div>

      {/* 全予約一覧 */}
      {showAllAppointments && (
        <Card>
          <CardHeader>
            <CardTitle>全予約一覧（日付順）</CardTitle>
            <CardDescription>
              キャンセル済みを除く全ての予約を日付の近い順に表示しています
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getAllAppointmentsSorted().length === 0 ? (
              <div className="text-center py-4 text-gray-500">予約がありません</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>予約日</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>患者名</TableHead>
                    <TableHead>コース名</TableHead>
                    <TableHead>電話番号</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>詳細</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getAllAppointmentsSorted().map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {appointment.confirmed_date 
                          ? (() => {
                              // タイムゾーン変換を避けるため、日付文字列を直接解析
                              const [year, month, day] = appointment.confirmed_date.split('-');
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              const weekday = date.toLocaleDateString('ja-JP', { weekday: 'long' });
                              return `${month}月${day}日（${weekday}）`;
                            })()
                          : "未定"
                        }
                      </TableCell>
                      <TableCell>
                        {appointment.confirmed_time_slot || "未定"}
                      </TableCell>
                      <TableCell>{appointment.patient_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {appointment.treatment_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.phone}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>予約者情報</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>患者名</Label>
                                  <p className="text-sm">{appointment.patient_name}</p>
                                </div>
                                <div>
                                  <Label>年齢</Label>
                                  <p className="text-sm">{appointment.age}歳</p>
                                </div>
                                <div>
                                  <Label>電話番号</Label>
                                  <p className="text-sm">{appointment.phone}</p>
                                </div>
                                <div>
                                  <Label>メール</Label>
                                  <p className="text-sm">{appointment.email}</p>
                                </div>
                                <div>
                                  <Label>コース</Label>
                                  <p className="text-sm">{appointment.treatment_name}</p>
                                </div>
                                <div>
                                  <Label>料金</Label>
                                  <p className="text-sm">¥{appointment.fee?.toLocaleString()}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label>申込日</Label>
                                  <p className="text-sm">
                                    {format(new Date(appointment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                                  </p>
                                </div>
                                {appointment.notes && (
                                  <div className="col-span-2">
                                    <Label>備考</Label>
                                    <p className="text-sm">{appointment.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {appointment.status !== 'cancelled' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                                キャンセル
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>予約をキャンセルしますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {appointment.patient_name}さんの予約をキャンセルします。この操作は取り消すことができます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelAppointment(appointment)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  予約をキャンセル
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              削除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>予約を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                {appointment.patient_name}さんの予約を完全に削除します。この操作は取り消すことができません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2ヶ月分のカレンダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>予約状況カレンダー（2ヶ月表示）</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            日付をクリックすると、その日の予約詳細を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 現在の月のカレンダー */}
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-semibold text-center">
                  {format(selectedDate, 'yyyy年MM月', { locale: ja })}
                </h3>
                <div className="w-full max-w-full">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    locale={ja}
                    className="rounded-md border w-full"
                    month={selectedDate}
                    modifiers={{
                      hasAppointments: (date) => {
                        const dateString = format(date, 'yyyy-MM-dd');
                        const dayData = dayAppointments.find(day => day.date === dateString);
                        return dayData ? dayData.count > 0 : false;
                      },
                      ...commonModifiers
                    }}
                    modifiersStyles={commonModifiersStyles}
                    components={{
                      DayContent: ({ date }) => getDayContent(date, dayAppointments)
                    }}
                    onDayClick={(date) => handleDateClick(date, dayAppointments)}
                    styles={commonCalendarStyles}
                  />
                </div>
              </div>

              {/* 次の月のカレンダー */}
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-semibold text-center">
                  {format(addMonths(selectedDate, 1), 'yyyy年MM月', { locale: ja })}
                </h3>
                <div className="w-full max-w-full">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    locale={ja}
                    className="rounded-md border w-full"
                    month={addMonths(selectedDate, 1)}
                    modifiers={{
                      hasAppointments: (date) => {
                        const dateString = format(date, 'yyyy-MM-dd');
                        const dayData = nextMonthDayAppointments.find(day => day.date === dateString);
                        return dayData ? dayData.count > 0 : false;
                      },
                      ...commonModifiers
                    }}
                    modifiersStyles={commonModifiersStyles}
                    components={{
                      DayContent: ({ date }) => getDayContent(date, nextMonthDayAppointments)
                    }}
                    onDayClick={(date) => handleDateClick(date, nextMonthDayAppointments)}
                    styles={commonCalendarStyles}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 予約検索 */}
      <Card>
        <CardHeader>
          <CardTitle>予約検索</CardTitle>
          <CardDescription>
            名前、メール、電話番号、コースで検索できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-field">検索項目</Label>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient_name">患者名</SelectItem>
                  <SelectItem value="email">メールアドレス</SelectItem>
                  <SelectItem value="phone">電話番号</SelectItem>
                  <SelectItem value="treatment_name">コース</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-2">
              <Label htmlFor="search-query">検索キーワード</Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索キーワードを入力"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {hasSearched && (
            <div className="max-h-60 overflow-y-auto">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {searchQuery.trim() ? "検索結果がありません" : "検索キーワードを入力してください"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>患者名</TableHead>
                      <TableHead>コース</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.patient_name}</TableCell>
                        <TableCell>{appointment.treatment_name}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>予約詳細</DialogTitle>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>患者名</Label>
                                      <p className="text-sm">{selectedAppointment.patient_name}</p>
                                    </div>
                                    <div>
                                      <Label>年齢</Label>
                                      <p className="text-sm">{selectedAppointment.age}歳</p>
                                    </div>
                                    <div>
                                      <Label>電話番号</Label>
                                      <p className="text-sm">{selectedAppointment.phone}</p>
                                    </div>
                                    <div>
                                      <Label>メール</Label>
                                      <p className="text-sm">{selectedAppointment.email}</p>
                                    </div>
                                    <div>
                                      <Label>コース</Label>
                                      <p className="text-sm">{selectedAppointment.treatment_name}</p>
                                    </div>
                                    <div>
                                      <Label>料金</Label>
                                      <p className="text-sm">¥{selectedAppointment.fee?.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label>ステータス</Label>
                                      <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                                    </div>
                                    {selectedAppointment.confirmed_date && (
                                      <div className="col-span-2">
                                        <Label>確定日時</Label>
                                        <p className="text-sm">
                                          {format(new Date(selectedAppointment.confirmed_date), 'yyyy年MM月dd日', { locale: ja })}
                                          {selectedAppointment.confirmed_time_slot && ` ${selectedAppointment.confirmed_time_slot}`}
                                        </p>
                                      </div>
                                    )}
                                    {selectedAppointment.notes && (
                                      <div className="col-span-2">
                                        <Label>備考</Label>
                                        <p className="text-sm">{selectedAppointment.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 本日・明日・今週の予約タブ */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">本日の予約（{getTodayAppointments().length}）</TabsTrigger>
          <TabsTrigger value="tomorrow">明日の予約（{getTomorrowAppointments().length}）</TabsTrigger>
          <TabsTrigger value="thisweek">今週の予約（{getThisWeekAppointments().length}）</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          {renderAppointmentTable(
            getTodayAppointments(), 
            `本日の予約 - ${format(new Date(), 'yyyy年MM月dd日（EEEE）', { locale: ja })}`
          )}
        </TabsContent>

        <TabsContent value="tomorrow">
          {renderAppointmentTable(
            getTomorrowAppointments(), 
            `明日の予約 - ${format(addDays(new Date(), 1), 'yyyy年MM月dd日（EEEE）', { locale: ja })}`
          )}
        </TabsContent>

        <TabsContent value="thisweek">
          <div className="space-y-4">
            {getWeeklyAppointments().map((dayData) => (
              <Card key={dayData.date} className={dayData.isToday ? "border-blue-500 bg-blue-50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {dayData.dayNumber} ({dayData.dayName})
                    {dayData.isToday && <Badge variant="secondary" className="bg-blue-100 text-blue-800">本日</Badge>}
                    <Badge variant="outline">{dayData.appointments.length}件</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayData.appointments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">予約がありません</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>時間</TableHead>
                          <TableHead>患者名</TableHead>
                          <TableHead>電話番号</TableHead>
                          <TableHead>コース</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead>詳細</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayData.appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {appointment.confirmed_time_slot || "未定"}
                            </TableCell>
                            <TableCell>{appointment.patient_name}</TableCell>
                            <TableCell>{appointment.phone}</TableCell>
                            <TableCell>{appointment.treatment_name}</TableCell>
                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAppointment(appointment)}
                                  >
                                    <User className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>予約者情報</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>患者名</Label>
                                        <p className="text-sm">{appointment.patient_name}</p>
                                      </div>
                                      <div>
                                        <Label>年齢</Label>
                                        <p className="text-sm">{appointment.age}歳</p>
                                      </div>
                                      <div>
                                        <Label>電話番号</Label>
                                        <p className="text-sm">{appointment.phone}</p>
                                      </div>
                                      <div>
                                        <Label>メール</Label>
                                        <p className="text-sm">{appointment.email}</p>
                                      </div>
                                      <div>
                                        <Label>コース</Label>
                                        <p className="text-sm">{appointment.treatment_name}</p>
                                      </div>
                                      <div>
                                        <Label>料金</Label>
                                        <p className="text-sm">¥{appointment.fee?.toLocaleString()}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label>申込日</Label>
                                        <p className="text-sm">
                                          {format(new Date(appointment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                                        </p>
                                      </div>
                                      {appointment.notes && (
                                        <div className="col-span-2">
                                          <Label>備考</Label>
                                          <p className="text-sm">{appointment.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 選択日の予約詳細 */}
      {selectedDayData && selectedDayData.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(new Date(selectedDayData.date), 'yyyy年MM月dd日', { locale: ja })}の予約 
              ({selectedDayData.count}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>患者名</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>コース</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDayData.appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.confirmed_time_slot || "未定"}
                    </TableCell>
                    <TableCell>{appointment.patient_name}</TableCell>
                    <TableCell>{appointment.phone}</TableCell>
                    <TableCell>{appointment.treatment_name}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>予約者情報</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>患者名</Label>
                                <p className="text-sm">{appointment.patient_name}</p>
                              </div>
                              <div>
                                <Label>年齢</Label>
                                <p className="text-sm">{appointment.age}歳</p>
                              </div>
                              <div>
                                <Label>電話番号</Label>
                                <p className="text-sm">{appointment.phone}</p>
                              </div>
                              <div>
                                <Label>メール</Label>
                                <p className="text-sm">{appointment.email}</p>
                              </div>
                              <div>
                                <Label>コース</Label>
                                <p className="text-sm">{appointment.treatment_name}</p>
                              </div>
                              <div>
                                <Label>料金</Label>
                                <p className="text-sm">¥{appointment.fee?.toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <Label>申込日</Label>
                                <p className="text-sm">
                                  {format(new Date(appointment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                                </p>
                              </div>
                              {appointment.notes && (
                                <div className="col-span-2">
                                  <Label>備考</Label>
                                  <p className="text-sm">{appointment.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
