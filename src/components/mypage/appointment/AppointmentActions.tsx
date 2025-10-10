
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  appointment_date: string;
  created_at: string;
  status: string;
  treatment_name: string;
  fee: number;
  notes: string;
  confirmed_date: string | null;
  confirmed_time_slot: string | null;
  appointment_preferences?: any[];
}

interface AppointmentActionsProps {
  appointment: Appointment;
  cancellingAppointmentId: string | null;
  onCancelAppointment: (appointment: Appointment) => void;
  onModifyAppointment: (appointment: Appointment) => void;
}

export function AppointmentActions({
  appointment,
  cancellingAppointmentId,
  onCancelAppointment,
  onModifyAppointment,
}: AppointmentActionsProps) {
  // Only show actions for non-cancelled appointments
  if (appointment.status === 'cancelled') {
    return null;
  }

  return (
    <div className="pt-2 space-y-2">
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2 w-full"
        onClick={() => onModifyAppointment(appointment)}
      >
        <Calendar className="h-4 w-4" />
        予約を修正する
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        disabled={cancellingAppointmentId === appointment.id}
        className="flex items-center gap-2 w-full"
        onClick={() => onCancelAppointment(appointment)}
      >
        <X className="h-4 w-4" />
        {cancellingAppointmentId === appointment.id ? "処理中..." : "キャンセル"}
      </Button>
    </div>
  );
}
