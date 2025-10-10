
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { getStatusDisplayText, getStatusBadgeVariant } from "@/utils/appointmentStatusUtils";

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

interface StatusBadgeProps {
  appointment: Appointment;
  onStatusChange: (appointment: Appointment) => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ appointment, onStatusChange }) => {
  return (
    <Badge 
      variant={getStatusBadgeVariant(appointment.status)}
      className="cursor-pointer transition-colors"
      onClick={() => onStatusChange(appointment)}
    >
      {getStatusDisplayText(appointment.status)}
    </Badge>
  );
};
