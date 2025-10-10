
import { AppointmentTable } from "./AppointmentTable";

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

interface AllAppointmentsSectionProps {
  appointments: Appointment[];
  onApproval: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  getStatusBadge: (appointment: Appointment) => React.ReactNode;
}

export function AllAppointmentsSection({
  appointments,
  onApproval,
  onEdit,
  onCancel,
  onDelete,
  getStatusBadge,
}: AllAppointmentsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        全予約一覧 ({appointments.length}件)
      </h2>
      <AppointmentTable
        appointments={appointments}
        onApproval={onApproval}
        onEdit={onEdit}
        onCancel={onCancel}
        onDelete={onDelete}
        getStatusBadge={getStatusBadge}
        showCheckboxes={false}
        showStatusColumn={true}
      />
    </div>
  );
}
