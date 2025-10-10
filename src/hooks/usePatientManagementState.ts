
import { useState } from "react";
import { Patient } from "./usePatients";

export const usePatientManagementState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handlePatientView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailDialogOpen(true);
  };

  const handlePatientEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handlePatientDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const closeDialogs = () => {
    setSelectedPatient(null);
    setIsDetailDialogOpen(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedPatient,
    isDetailDialogOpen,
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    setIsCreateDialogOpen,
    handlePatientView,
    handlePatientEdit,
    handlePatientDelete,
    closeDialogs,
    setIsDetailDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
  };
};
