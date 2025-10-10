import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendConfirmationEmail } from "@/utils/appointmentEmailUtils";
import { checkAppointmentTimeConflict } from "@/utils/appointmentConflictUtils";
import { checkConfirmedTimeConflict } from "@/utils/treatmentReservationUtils";

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
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  created_at: string;
}

export const useAppointmentManagement = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約データの取得に失敗しました",
      });
      return;
    }

    setAppointments(data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const syncWithGoogleCalendar = async (appointment: Appointment) => {
    try {
      console.log('Googleカレンダー同期開始:', appointment.id);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          appointmentId: appointment.id,
          patientName: appointment.patient_name,
          patientEmail: appointment.email,
          treatmentName: appointment.treatment_name,
          confirmedDate: appointment.confirmed_date,
          confirmedTimeSlot: appointment.confirmed_time_slot,
          notes: appointment.notes
        }
      });

      if (error) {
        console.error('Googleカレンダー同期エラー:', error);
        toast({
          variant: "destructive",
          title: "Googleカレンダー同期エラー",
          description: "Googleカレンダーへの追加に失敗しました。手動で追加してください。",
        });
        return false;
      }

      console.log('Googleカレンダー同期成功:', data);
      toast({
        title: "Googleカレンダー同期完了",
        description: "予約がGoogleカレンダーに追加されました。",
      });
      return true;
    } catch (error: any) {
      console.error('Googleカレンダー同期処理エラー:', error);
      toast({
        variant: "destructive",
        title: "Googleカレンダー同期エラー",
        description: "Googleカレンダーへの同期中にエラーが発生しました。",
      });
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の削除に失敗しました",
      });
      return;
    }

    toast({
      title: "削除完了",
      description: "予約を削除しました",
    });
    fetchAppointments();
  };

  const handleQuickApproval = async (appointment: Appointment) => {
    try {
      // 第一希望の日時を取得
      const { data: preferences, error: prefError } = await supabase
        .from("appointment_preferences")
        .select("*")
        .eq("appointment_id", appointment.id)
        .order("preference_order", { ascending: true })
        .limit(1);

      if (prefError) {
        console.error("予約希望取得エラー:", prefError);
      }

      const firstPreference = preferences?.[0];
      
      if (firstPreference) {
        // 予約時間重複チェック（確定済み予約との重複）
        const { canConfirm: canConfirmTime, error: timeConflictError } = await checkConfirmedTimeConflict(
          appointment.email,
          firstPreference.preferred_date,
          firstPreference.preferred_time_slot,
          appointment.id
        );

        if (timeConflictError || !canConfirmTime) {
          toast({
            variant: "destructive",
            title: "予約重複エラー",
            description: "この患者様は同じ日時に既に別の確定予約があります。別の希望日時で確定してください。",
          });
          return;
        }

        // 既存の予約時間重複チェック（全ての予約との重複）
        const { canConfirm, error: conflictError } = await checkAppointmentTimeConflict(
          appointment.email,
          firstPreference.preferred_date,
          firstPreference.preferred_time_slot,
          appointment.id
        );

        if (conflictError || !canConfirm) {
          toast({
            variant: "destructive",
            title: "予約重複エラー",
            description: "この患者様は同じ日時に既に別の予約があります。別の希望日時で確定してください。",
          });
          return;
        }
      }

      const updateData: any = { 
        status: 'confirmed' as const
      };
      
      if (firstPreference) {
        updateData.confirmed_date = firstPreference.preferred_date;
        updateData.confirmed_time_slot = firstPreference.preferred_time_slot;
      }

      const { error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", appointment.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "予約の承認に失敗しました",
        });
        return;
      }

      // 確定メールを送信（1回のみ、ここで実行）
      if (firstPreference) {
        const emailData = {
          patientName: appointment.patient_name,
          patientEmail: appointment.email,
          phone: appointment.phone,
          treatmentName: appointment.treatment_name,
          fee: appointment.fee,
          confirmedDate: firstPreference.preferred_date,
          confirmedTimeSlot: firstPreference.preferred_time_slot
        };

        console.log("クイック承認メール送信開始:", emailData);

        const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
          body: emailData
        });

        if (emailResponse.error) {
          console.error("確定メール送信エラー:", emailResponse.error);
        } else {
          console.log("確定メール送信成功:", emailResponse.data);
        }
      }

      // Googleカレンダーに同期
      const updatedAppointment = { ...appointment, ...updateData };
      await syncWithGoogleCalendar(updatedAppointment);

      toast({
        title: "承認完了",
        description: "予約を第一希望で承認し、確定メールを送信しました",
      });
      fetchAppointments();
    } catch (error) {
      console.error("承認エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の承認に失敗しました",
      });
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: 'cancelled' })
      .eq("id", appointment.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約のキャンセル処理に失敗しました",
      });
      return;
    }

    toast({
      title: "キャンセル完了",
      description: "予約をキャンセルしました",
    });
    fetchAppointments();
  };

  const handleBulkApproval = async () => {
    if (selectedAppointments.size === 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "承認する予約を選択してください",
      });
      return;
    }

    try {
      const selectedIds = Array.from(selectedAppointments);
      let successCount = 0;
      let conflictCount = 0;
      let syncSuccessCount = 0;
      
      // 各予約の第一希望を取得して承認
      for (const appointmentId of selectedIds) {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (!appointment) continue;

        // 第一希望の日時を取得
        const { data: preferences, error: prefError } = await supabase
          .from("appointment_preferences")
          .select("*")
          .eq("appointment_id", appointmentId)
          .order("preference_order", { ascending: true })
          .limit(1);

        if (prefError) {
          console.error("予約希望取得エラー:", prefError);
          continue;
        }

        const firstPreference = preferences?.[0];
        
        if (firstPreference) {
          // 確定済み予約との重複チェック
          const { canConfirm: canConfirmTime, error: timeConflictError } = await checkConfirmedTimeConflict(
            appointment.email,
            firstPreference.preferred_date,
            firstPreference.preferred_time_slot,
            appointment.id
          );

          if (timeConflictError || !canConfirmTime) {
            console.log(`確定済み予約重複のため ${appointment.patient_name}様の予約をスキップします`);
            conflictCount++;
            continue;
          }

          // 全ての予約との重複チェック
          const { canConfirm, error: conflictError } = await checkAppointmentTimeConflict(
            appointment.email,
            firstPreference.preferred_date,
            firstPreference.preferred_time_slot,
            appointment.id
          );

          if (conflictError || !canConfirm) {
            console.log(`予約重複のため ${appointment.patient_name}様の予約をスキップします`);
            conflictCount++;
            continue;
          }
        }

        // 予約を承認し、第一希望で確定
        const updateData: any = { 
          status: 'confirmed' as const
        };
        
        if (firstPreference) {
          updateData.confirmed_date = firstPreference.preferred_date;
          updateData.confirmed_time_slot = firstPreference.preferred_time_slot;
        }

        const { error } = await supabase
          .from("appointments")
          .update(updateData)
          .eq("id", appointmentId);

        if (error) {
          console.error("予約承認エラー:", error);
          continue;
        }

        // 確定メールを送信（各予約につき1回のみ）
        if (firstPreference) {
          const emailData = {
            patientName: appointment.patient_name,
            patientEmail: appointment.email,
            phone: appointment.phone,
            treatmentName: appointment.treatment_name,
            fee: appointment.fee,
            confirmedDate: firstPreference.preferred_date,
            confirmedTimeSlot: firstPreference.preferred_time_slot
          };

          console.log(`一括承認メール送信開始 (${appointment.patient_name}):`, emailData);

          const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
            body: emailData
          });

          if (emailResponse.error) {
            console.error("確定メール送信エラー:", emailResponse.error);
          } else {
            console.log("確定メール送信成功:", emailResponse.data);
          }
        }

        // Googleカレンダーに同期
        const updatedAppointment = { ...appointment, ...updateData };
        const syncSuccess = await syncWithGoogleCalendar(updatedAppointment);
        if (syncSuccess) {
          syncSuccessCount++;
        }

        successCount++;
      }

      let message = `${successCount}件の予約を第一希望で承認し、確定メールを送信しました`;
      if (syncSuccessCount > 0) {
        message += `。${syncSuccessCount}件をGoogleカレンダーに同期しました`;
      }
      if (conflictCount > 0) {
        message += `。${conflictCount}件の予約は時間重複のためスキップされました`;
      }

      toast({
        title: "一括承認完了",
        description: message,
        variant: conflictCount > 0 ? "destructive" : "default"
      });
      
      setSelectedAppointments(new Set());
      fetchAppointments();
    } catch (error) {
      console.error("一括承认エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "一括承認に失敗しました",
      });
    }
  };

  return {
    appointments,
    selectedAppointments,
    setSelectedAppointments,
    fetchAppointments,
    handleDelete,
    handleQuickApproval,
    handleCancel,
    handleBulkApproval,
    syncWithGoogleCalendar,
  };
};
