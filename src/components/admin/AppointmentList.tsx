
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { AppointmentApprovalDialog } from "./AppointmentApprovalDialog";
import { CreateAppointmentDialog } from "./CreateAppointmentDialog";
import { PendingAppointmentsSection } from "./appointment/PendingAppointmentsSection";
import { AllAppointmentsSection } from "./appointment/AllAppointmentsSection";
import { useAppointmentManagement } from "@/hooks/useAppointmentManagement";
import { useAppointmentSelection } from "@/hooks/useAppointmentSelection";
import { StatusBadge } from "./StatusBadge";
import { createStatusChangeHandler } from "@/utils/appointmentStatusUtils";
import { useToast } from "@/hooks/use-toast";
import { ReminderEmailManager } from "./ReminderEmailManager";
import { supabase } from "@/integrations/supabase/client";
import { checkConfirmedTimeConflict } from "@/utils/treatmentReservationUtils";

interface AppointmentPreference {
  id: string;
  preference_order: number;
  preferred_date: string;
  preferred_time_slot: string;
}

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
  appointment_preferences?: AppointmentPreference[];
}

export function AppointmentList() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [appointmentsWithPreferences, setAppointmentsWithPreferences] = useState<Appointment[]>([]);
  const { toast } = useToast();

  const {
    appointments,
    fetchAppointments,
    handleDelete,
    handleQuickApproval,
    handleCancel,
    handleBulkApproval,
    syncWithGoogleCalendar,
  } = useAppointmentManagement();

  const {
    selectedAppointments,
    setSelectedAppointments,
    handleCheckboxChange,
    handleSelectAll,
  } = useAppointmentSelection();

  // 予約希望日時を含めて取得
  useEffect(() => {
    const fetchAppointmentsWithPreferences = async () => {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (appointmentsError) {
        console.error("予約取得エラー:", appointmentsError);
        return;
      }

      const appointmentsWithPrefs = await Promise.all(
        appointmentsData.map(async (appointment) => {
          const { data: preferencesData, error: preferencesError } = await supabase
            .from("appointment_preferences")
            .select("*")
            .eq("appointment_id", appointment.id)
            .order("preference_order");

          if (preferencesError) {
            console.error("予約希望取得エラー:", preferencesError);
          }

          // デバッグ用ログ
          if (appointment.status === 'pending') {
            console.log(`予約ID ${appointment.id} (${appointment.patient_name}) の希望日時:`, preferencesData);
          }

          return {
            ...appointment,
            appointment_preferences: preferencesData || []
          };
        })
      );

      setAppointmentsWithPreferences(appointmentsWithPrefs);
    };

    fetchAppointmentsWithPreferences();
  }, [appointments]);

  const pendingAppointments = appointmentsWithPreferences.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointmentsWithPreferences.filter(apt => apt.status === 'confirmed');
  const cancelledAppointments = appointmentsWithPreferences.filter(apt => apt.status === 'cancelled');

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleApproval = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsApprovalDialogOpen(true);
  };

  // 希望日時選択での承認（メール送信なし）
  const handlePreferenceApproval = async (appointment: Appointment, preferenceId: string) => {
    try {
      // 選択された希望日時を取得
      const selectedPreference = appointment.appointment_preferences?.find(p => p.id === preferenceId);
      if (!selectedPreference) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "選択された希望日時が見つかりません",
        });
        return;
      }

      // 確定済み予約との重複チェック
      const { canConfirm, error: conflictError } = await checkConfirmedTimeConflict(
        appointment.email,
        selectedPreference.preferred_date,
        selectedPreference.preferred_time_slot,
        appointment.id
      );

      if (conflictError || !canConfirm) {
        toast({
          variant: "destructive",
          title: "予約重複エラー",
          description: "この患者様は同じ日時に既に別の確定予約があります。別の希望日時を選択してください。",
        });
        return;
      }

      // 予約を承認し、選択された希望日時で確定（メール送信なし）
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          status: 'confirmed',
          confirmed_date: selectedPreference.preferred_date,
          confirmed_time_slot: selectedPreference.preferred_time_slot
        })
        .eq("id", appointment.id);

      if (updateError) {
        throw updateError;
      }

      console.log("予約承認完了（AppointmentList）- 確定メール送信開始");

      // 確定メール送信
      const emailData = {
        patientName: appointment.patient_name,
        patientEmail: appointment.email,
        phone: appointment.phone,
        treatmentName: appointment.treatment_name,
        fee: appointment.fee,
        confirmedDate: selectedPreference.preferred_date,
        confirmedTimeSlot: selectedPreference.preferred_time_slot
      };

      console.log("確定メール送信開始（handlePreferenceApproval）:", emailData);

      // Vercel API Routeを使用して確定メールを送信
      const emailResponse = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const emailResult = await emailResponse.json();
      console.log("確定メール送信レスポンス（handlePreferenceApproval）:", emailResult);

      if (!emailResponse.ok || !emailResult.success) {
        console.error("確定メール送信エラー（handlePreferenceApproval）:", emailResult.error);
        toast({
          title: "予約承認完了",
          description: `${appointment.patient_name}様の予約を第${selectedPreference.preference_order}希望で承認しましたが、確定メールの送信に失敗しました。${emailResult.error ? `エラー: ${emailResult.error}` : ''}`,
          variant: "destructive",
        });
      } else {
        console.log("確定メール送信成功（handlePreferenceApproval）:", emailResult);
        toast({
          title: "承認完了",
          description: `${appointment.patient_name}様の予約を第${selectedPreference.preference_order}希望で承認し、確定メールを送信しました`,
        });
      }

      fetchAppointments();
    } catch (error: any) {
      console.error("予約承認エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の承認に失敗しました",
      });
    }
  };

  const handleStatusChange = createStatusChangeHandler(toast, fetchAppointments);

  const getStatusBadge = (appointment: Appointment) => {
    return <StatusBadge appointment={appointment} onStatusChange={handleStatusChange} />;
  };

  const onDialogComplete = () => {
    setIsEditDialogOpen(false);
    setIsApprovalDialogOpen(false);
    setIsCreateDialogOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleBulkApprovalWrapper = () => {
    handleBulkApproval();
  };

  const handleSelectAllWrapper = (checked: boolean) => {
    handleSelectAll(checked, pendingAppointments);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          予約管理【承認待ち{pendingAppointments.length}件】
        </h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新規予約作成
        </Button>
      </div>

      {/* リマインダーメール管理セクションを追加 */}
      <ReminderEmailManager />
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="text-yellow-700">
            承認待ち ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-green-700">
            承認済み ({confirmedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-red-700">
            キャンセル済み ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingAppointmentsSection
            pendingAppointments={pendingAppointments}
            selectedAppointments={selectedAppointments}
            onCheckboxChange={handleCheckboxChange}
            onSelectAll={handleSelectAllWrapper}
            onBulkApproval={handleBulkApprovalWrapper}
            onQuickApproval={handleQuickApproval}
            onApproval={handleApproval}
            onCancel={handleCancel}
            onPreferenceApproval={handlePreferenceApproval}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <AllAppointmentsSection
            appointments={confirmedAppointments}
            onApproval={handleApproval}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <AllAppointmentsSection
            appointments={cancelledAppointments}
            onApproval={handleApproval}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <EditAppointmentDialog
        appointment={selectedAppointment}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onComplete={onDialogComplete}
      />

      <AppointmentApprovalDialog
        appointment={selectedAppointment}
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        onComplete={onDialogComplete}
      />

      <CreateAppointmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onComplete={onDialogComplete}
      />
    </div>
  );
}
