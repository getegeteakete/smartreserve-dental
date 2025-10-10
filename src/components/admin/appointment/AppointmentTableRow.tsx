
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Check, X } from "lucide-react";

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

interface AppointmentTableRowProps {
  appointment: Appointment;
  isSelected?: boolean;
  onCheckboxChange?: (appointmentId: string, checked: boolean) => void;
  onQuickApproval?: (appointment: Appointment) => void;
  onApproval?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointment: Appointment) => void;
  getStatusBadge?: (appointment: Appointment) => React.ReactNode;
  showCheckbox?: boolean;
  showStatus?: boolean;
  showEmail?: boolean;
  rowClassName?: string;
  isMobileCard?: boolean;
}

export function AppointmentTableRow({
  appointment,
  isSelected,
  onCheckboxChange,
  onQuickApproval,
  onApproval,
  onCancel,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusBadge,
  showCheckbox = false,
  showStatus = true,
  showEmail = true,
  rowClassName,
  isMobileCard = false,
}: AppointmentTableRowProps) {
  const formatDateTime = (dateString: string) => {
    // タイムゾーン変換を避けるため、文字列を直接解析
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0]; // YYYY-MM-DD部分を取得
      const timePart = dateString.split('T')[1]?.split('.')[0] || '00:00:00'; // HH:MM:SS部分を取得
      
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      return `${year}/${month}/${day} ${hour}:${minute}`;
    }
    
    // フォールバック：従来の方法
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const formattedDate = date.toLocaleDateString('ja-JP', dateOptions);
    const formattedTime = date.toLocaleTimeString('ja-JP', timeOptions);
    
    return `${formattedDate} ${formattedTime}`;
  };

  // モバイルカード表示の場合は操作ボタンのみを表示
  if (isMobileCard) {
    return (
      <div className="flex justify-end gap-1 pt-2">
        {appointment.status === 'pending' && onQuickApproval && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickApproval(appointment)}
            className="text-green-600 hover:text-green-700 text-xs px-2 py-1"
          >
            <Check className="h-3 w-3 mr-1" />
            承認
          </Button>
        )}
        {appointment.status === 'pending' && onApproval && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApproval(appointment)}
            className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            編集
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(appointment)}
            className="text-xs px-2 py-1"
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
        {appointment.status === 'pending' && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(appointment)}
            className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(appointment.id)}
            className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <TableRow className={rowClassName}>
      {showCheckbox && (
        <TableCell>
          <Checkbox
            checked={isSelected || false}
            onCheckedChange={(checked) => 
              onCheckboxChange?.(appointment.id, checked as boolean)
            }
          />
        </TableCell>
      )}
      {showStatus && (
        <TableCell>{getStatusBadge?.(appointment)}</TableCell>
      )}
      <TableCell className="font-medium">{appointment.patient_name}</TableCell>
      <TableCell>{appointment.phone}</TableCell>
      {showEmail && <TableCell>{appointment.email}</TableCell>}
      <TableCell>{appointment.treatment_name}</TableCell>
      <TableCell>¥{appointment.fee?.toLocaleString()}</TableCell>
      <TableCell>{formatDateTime(appointment.created_at)}</TableCell>
      <TableCell className="space-x-2">
        {appointment.status === 'pending' && onQuickApproval && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuickApproval(appointment)}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        {appointment.status === 'pending' && onApproval && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onApproval(appointment)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(appointment)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {appointment.status === 'pending' && onCancel && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onCancel(appointment)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(appointment.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
