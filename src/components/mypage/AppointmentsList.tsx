
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCard } from "./appointment/AppointmentCard";
import { EmptyAppointmentsState } from "./appointment/EmptyAppointmentsState";
import { LoadingAppointmentsState } from "./appointment/LoadingAppointmentsState";
import { AppointmentsListHeader } from "./appointment/AppointmentsListHeader";

interface AppointmentPreference {
  preferred_date: string;
  preferred_time_slot: string;
  preference_order: number;
}

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
  appointment_preferences?: AppointmentPreference[];
}

interface AppointmentsListProps {
  appointments: Appointment[];
  appointmentsLoading: boolean;
  cancellingAppointmentId: string | null;
  onCancelAppointment: (appointment: Appointment) => void;
  onModifyAppointment: (appointment: Appointment) => void;
  onNavigateToBooking: () => void;
}

export function AppointmentsList({
  appointments,
  appointmentsLoading,
  cancellingAppointmentId,
  onCancelAppointment,
  onModifyAppointment,
  onNavigateToBooking,
}: AppointmentsListProps) {
  if (appointmentsLoading) {
    return <LoadingAppointmentsState />;
  }

  if (appointments.length === 0) {
    return <EmptyAppointmentsState onNavigateToBooking={onNavigateToBooking} />;
  }

  return (
    <Card>
      <AppointmentsListHeader appointmentCount={appointments.length} />
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              cancellingAppointmentId={cancellingAppointmentId}
              onCancelAppointment={onCancelAppointment}
              onModifyAppointment={onModifyAppointment}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
