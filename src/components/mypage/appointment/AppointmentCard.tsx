
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, FileText } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatDate, formatDateTime, formatTimeSlot } from "@/utils/dateFormatUtils";
import { getStatusText, getStatusColor } from "@/utils/appointmentStatusUtils";
import { AppointmentActions } from "./AppointmentActions";

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

interface AppointmentCardProps {
  appointment: Appointment;
  cancellingAppointmentId: string | null;
  onCancelAppointment: (appointment: Appointment) => void;
  onModifyAppointment: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  cancellingAppointmentId,
  onCancelAppointment,
  onModifyAppointment,
}: AppointmentCardProps) {
  return (
    <Card key={appointment.id} className="border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">予約日時</span>
              <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
            
            {appointment.status === 'confirmed' && appointment.confirmed_date && appointment.confirmed_time_slot ? (
              <div className="ml-6 space-y-1">
                <p className="text-lg font-semibold text-green-600">
                  確定: {formatDateTime(appointment.confirmed_date, appointment.confirmed_time_slot)}
                </p>
              </div>
            ) : (
              <div className="ml-6 space-y-1">
                <p className="text-lg font-semibold text-blue-600">
                  {formatDate(appointment.appointment_date)}
                </p>
                {appointment.appointment_preferences && appointment.appointment_preferences.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">希望時間：</p>
                    {appointment.appointment_preferences
                      .sort((a, b) => a.preference_order - b.preference_order)
                      .map((pref, index) => (
                        <p key={index} className="text-sm text-gray-800 ml-2">
                          第{pref.preference_order}希望: {formatTimeSlot(pref.preferred_time_slot)}
                        </p>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Tel: {appointment.phone}</span>
            </div>
          </div>

          <div className="space-y-3">
            {appointment.treatment_name && (
              <div>
                <p className="text-sm text-gray-600">治療内容</p>
                <p className="text-sm font-medium">{appointment.treatment_name}</p>
              </div>
            )}
            
            {appointment.fee > 0 && (
              <div>
                <p className="text-sm text-gray-600">料金</p>
                <p className="text-sm font-medium">¥{appointment.fee.toLocaleString()}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-600">予約日</p>
              <p className="text-sm">{format(new Date(appointment.created_at), "yyyy年MM月dd日", { locale: ja })}</p>
            </div>
            
            {appointment.notes && (
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">備考</span>
                </div>
                <p className="text-sm ml-6">{appointment.notes}</p>
              </div>
            )}

            <AppointmentActions
              appointment={appointment}
              cancellingAppointmentId={cancellingAppointmentId}
              onCancelAppointment={onCancelAppointment}
              onModifyAppointment={onModifyAppointment}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
