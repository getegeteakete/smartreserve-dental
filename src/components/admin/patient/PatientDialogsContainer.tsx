
import { PatientDetailDialog } from "./PatientDetailDialog";
import { PatientCreateDialog } from "./PatientCreateDialog";
import { PatientEditDialog } from "./PatientEditDialog";
import { PatientDeleteDialog } from "./PatientDeleteDialog";
import { Patient } from "@/hooks/usePatients";

interface PatientDialogsContainerProps {
  selectedPatient: Patient | null;
  isDetailDialogOpen: boolean;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  onDetailDialogClose: () => void;
  onCreateDialogClose: () => void;
  onEditDialogClose: () => void;
  onDeleteDialogClose: () => void;
  onCreatePatient: (patientData: Omit<Patient, "id" | "created_at" | "updated_at">) => Promise<void>;
  onUpdatePatient: (id: string, patientData: Partial<Patient>) => Promise<void>;
  onDeletePatient: () => Promise<void>;
}

export const PatientDialogsContainer = ({
  selectedPatient,
  isDetailDialogOpen,
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  onDetailDialogClose,
  onCreateDialogClose,
  onEditDialogClose,
  onDeleteDialogClose,
  onCreatePatient,
  onUpdatePatient,
  onDeletePatient,
}: PatientDialogsContainerProps) => {
  return (
    <>
      <PatientDetailDialog
        patient={selectedPatient}
        isOpen={isDetailDialogOpen}
        onClose={onDetailDialogClose}
      />

      <PatientCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={onCreateDialogClose}
        onSave={onCreatePatient}
      />

      <PatientEditDialog
        patient={selectedPatient}
        isOpen={isEditDialogOpen}
        onClose={onEditDialogClose}
        onSave={onUpdatePatient}
      />

      <PatientDeleteDialog
        patient={selectedPatient}
        isOpen={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
        onConfirm={onDeletePatient}
      />
    </>
  );
};
