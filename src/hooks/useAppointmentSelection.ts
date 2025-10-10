
import { useState } from "react";

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

export const useAppointmentSelection = () => {
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (appointmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAppointments);
    if (checked) {
      newSelected.add(appointmentId);
    } else {
      newSelected.delete(appointmentId);
    }
    setSelectedAppointments(newSelected);
  };

  const handleSelectAll = (checked: boolean, pendingAppointments: Appointment[]) => {
    if (checked) {
      const pendingIds = pendingAppointments.map(apt => apt.id);
      setSelectedAppointments(new Set(pendingIds));
    } else {
      setSelectedAppointments(new Set());
    }
  };

  return {
    selectedAppointments,
    setSelectedAppointments,
    handleCheckboxChange,
    handleSelectAll,
  };
};
