
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Patient } from "@/hooks/usePatients";

interface PatientDeleteDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PatientDeleteDialog = ({
  patient,
  isOpen,
  onClose,
  onConfirm
}: PatientDeleteDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>患者情報を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {patient && (
              <>
                患者「{patient.patient_name}」の情報を削除します。
                <br />
                この操作は取り消すことができません。
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
