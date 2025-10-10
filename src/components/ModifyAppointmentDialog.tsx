
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAppointmentModificationEmail } from "@/utils/appointmentModificationUtils";
import AppointmentCalendar from "@/components/appointment/AppointmentCalendar";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  treatment_name: string;
  fee: number;
  appointment_date: string;
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
}

interface PreferredDate {
  date: Date | undefined;
  timeSlot: string | undefined;
}

interface ModifyAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ModifyAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onComplete,
}: ModifyAppointmentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferredDates, setPreferredDates] = useState<PreferredDate[]>([
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
    { date: undefined, timeSlot: undefined },
  ]);

  const form = useForm({
    defaultValues: {
      modificationReason: "",
    },
  });

  useEffect(() => {
    if (open) {
      // ダイアログが開かれた時にリセット
      setPreferredDates([
        { date: undefined, timeSlot: undefined },
        { date: undefined, timeSlot: undefined },
        { date: undefined, timeSlot: undefined },
      ]);
      form.reset({
        modificationReason: "",
      });
    }
  }, [open, form]);

  const handleDateSelect = (index: number, date: Date | undefined) => {
    setPreferredDates(prev => {
      const newDates = [...prev];
      newDates[index] = { ...newDates[index], date };
      return newDates;
    });
  };

  const handleTimeSlotSelect = (index: number, timeSlot: string) => {
    setPreferredDates(prev => {
      const newDates = [...prev];
      newDates[index] = { ...newDates[index], timeSlot };
      return newDates;
    });
  };

  const isFormValid = () => {
    // 最低1つの希望日時が入力されている
    return preferredDates.some(pd => pd.date && pd.timeSlot);
  };

  const onSubmit = async (values: { modificationReason: string }) => {
    if (!appointment || !isFormValid()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "最低1つの希望日時を選択してください",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 有効な希望日時のみを抽出
      const validPreferredDates = preferredDates
        .filter(pd => pd.date && pd.timeSlot)
        .map((pd, index) => ({
          date: pd.date!.toISOString().split('T')[0],
          timeSlot: pd.timeSlot!,
          order: index + 1
        }));

      // 予約を pending 状態に戻す（修正中として）
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ 
          status: 'pending',
          confirmed_date: null,
          confirmed_time_slot: null
        })
        .eq("id", appointment.id);

      if (updateError) {
        throw updateError;
      }

      // 既存の予約希望を削除
      const { error: deleteError } = await supabase
        .from("appointment_preferences")
        .delete()
        .eq("appointment_id", appointment.id);

      if (deleteError) {
        console.error("既存予約希望削除エラー:", deleteError);
        // 削除エラーは続行を妨げない
      }

      // 新しい予約希望を保存
      const preferencesData = validPreferredDates.map(pref => ({
        appointment_id: appointment.id,
        preference_order: pref.order,
        preferred_date: pref.date,
        preferred_time_slot: pref.timeSlot
      }));

      const { error: insertError } = await supabase
        .from("appointment_preferences")
        .insert(preferencesData);

      if (insertError) {
        throw insertError;
      }

      // 修正メールを送信
      await sendAppointmentModificationEmail({
        patientName: appointment.patient_name,
        patientEmail: appointment.email,
        phone: appointment.phone,
        treatmentName: appointment.treatment_name,
        fee: appointment.fee,
        originalDate: appointment.confirmed_date || appointment.appointment_date,
        originalTimeSlot: appointment.confirmed_time_slot || "未確定",
        newPreferredDates: validPreferredDates,
        modificationReason: values.modificationReason || undefined
      }, toast);

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("予約修正エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `予約の修正に失敗しました: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>予約の修正</DialogTitle>
        </DialogHeader>
        
        {appointment && (
          <div className="space-y-6">
            {/* 現在の予約情報 */}
            <div className="bg-yellow-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-yellow-800 mb-2">現在の予約</h3>
              <p><strong>診療内容:</strong> {appointment.treatment_name}</p>
              <p><strong>現在の日時:</strong> {
                appointment.confirmed_date && appointment.confirmed_time_slot
                  ? `${appointment.confirmed_date} ${appointment.confirmed_time_slot}`
                  : appointment.appointment_date
              }</p>
            </div>

            {/* 新しい希望日時選択 */}
            <div>
              <h3 className="font-semibold mb-4">新しい希望日時を選択してください</h3>
              <AppointmentCalendar
                preferredDates={preferredDates}
                onDateSelect={handleDateSelect}
                onTimeSlotSelect={handleTimeSlotSelect}
              />
            </div>

            {/* 修正理由入力 */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="modificationReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>修正理由（任意）</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="修正の理由があればお聞かせください"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isFormValid() || isLoading}
                  >
                    {isLoading ? "修正申請中..." : "修正を申請する"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
