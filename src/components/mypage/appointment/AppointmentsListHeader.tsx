
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface AppointmentsListHeaderProps {
  appointmentCount: number;
}

export function AppointmentsListHeader({ appointmentCount }: AppointmentsListHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        予約一覧
      </CardTitle>
      <CardDescription>
        {appointmentCount}件の予約があります
      </CardDescription>
    </CardHeader>
  );
}
