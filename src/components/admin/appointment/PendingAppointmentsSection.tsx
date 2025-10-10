
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppointmentTable } from "./AppointmentTable";

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

interface PendingAppointmentsSectionProps {
  pendingAppointments: Appointment[];
  selectedAppointments: Set<string>;
  onCheckboxChange: (appointmentId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkApproval: () => void;
  onQuickApproval: (appointment: Appointment) => void; 
  onApproval: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onPreferenceApproval?: (appointment: Appointment, preferenceId: string) => void;
}

export function PendingAppointmentsSection({
  pendingAppointments,
  selectedAppointments,
  onCheckboxChange,
  onSelectAll,
  onBulkApproval,
  onQuickApproval,
  onApproval,
  onCancel,
  onPreferenceApproval,
}: PendingAppointmentsSectionProps) {
  const allSelected = pendingAppointments.length > 0 && 
    pendingAppointments.every(apt => selectedAppointments.has(apt.id));

  return (
    <div className="space-y-4">
      {pendingAppointments.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm font-medium">
              全て選択 ({selectedAppointments.size}件選択中)
            </span>
          </div>
          <Button
            onClick={onBulkApproval}
            disabled={selectedAppointments.size === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            一括承認 ({selectedAppointments.size}件)
          </Button>
        </div>
      )}

      {pendingAppointments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">承認待ちの予約はありません</p>
        </div>
      ) : (
        <AppointmentTable
          appointments={pendingAppointments}
          selectedAppointments={selectedAppointments}
          onCheckboxChange={onCheckboxChange}
          onQuickApproval={onQuickApproval}
          onApproval={onApproval}
          onCancel={onCancel}
          onPreferenceApproval={onPreferenceApproval}
          showCheckboxes={true}
          showStatusColumn={false}
          showDetailedView={true}
        />
      )}
    </div>
  );
}
