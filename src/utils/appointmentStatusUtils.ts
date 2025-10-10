import { VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";

type ToastFunction = (config: {
  title: string;
  description: string;
}) => void;

export const getStatusBadgeVariant = (status: string): VariantProps<typeof Badge>["variant"] => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'completed':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'pending':
      return '承認待ち';
    case 'confirmed':
      return '確定済み';
    case 'cancelled':
      return 'キャンセル';
    case 'completed':
      return '完了';
    default:
      return status;
  }
};

export const createStatusChangeHandler = (toast: ToastFunction, fetchAppointments: () => void) => {
  return (appointment: { id: string; status: string; patient_name: string }) => {
    // ステータス変更のロジックをここに実装
    toast({
      title: "ステータス変更",
      description: "ステータス変更機能は開発中です",
    });
  };
};
