import { usePatients, Patient } from "@/hooks/usePatients";
import { usePatientManagementAuth } from "@/hooks/usePatientManagementAuth";
import { usePatientManagementState } from "@/hooks/usePatientManagementState";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PatientManagementHeader } from "@/components/admin/patient/PatientManagementHeader";
import { PatientSearchCard } from "@/components/admin/patient/PatientSearchCard";
import { PatientStatsCard } from "@/components/admin/patient/PatientStatsCard";
import { PatientDialogsContainer } from "@/components/admin/patient/PatientDialogsContainer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function PatientManagement() {
  const { loading, handleLogout, handleBackToAdmin } = usePatientManagementAuth();
  
  const { 
    patients, 
    loading: patientsLoading,
    searchPatients, 
    createPatient, 
    updatePatient, 
    deletePatient,
    fetchPatients
  } = usePatients();

  const {
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
  } = usePatientManagementState();

  console.log("PatientManagement: 患者データの状態:", {
    patientsCount: patients?.length || 0,
    patientsLoading,
    patients: patients
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchPatients(query);
  };

  const handleCreatePatient = async (patientData: Omit<Patient, "id" | "created_at" | "updated_at">) => {
    try {
      await createPatient(patientData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      // エラーハンドリングはusePatients内で行われる
    }
  };

  const handleUpdatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      await updatePatient(id, patientData);
      setIsEditDialogOpen(false);
      closeDialogs();
    } catch (error) {
      // エラーハンドリングはusePatients内で行われる
    }
  };

  const handleDeletePatient = async () => {
    if (selectedPatient) {
      try {
        await deletePatient(selectedPatient.id);
        setIsDeleteDialogOpen(false);
        closeDialogs();
      } catch (error) {
        // エラーハンドリングはusePatients内で行われる
      }
    }
  };

  const handleSyncComplete = () => {
    fetchPatients();
  };

  if (loading || patientsLoading) {
    console.log("PatientManagement: ローディング中...", { loading, patientsLoading });
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {loading ? "認証確認中..." : "患者データを取得中..."}
          </p>
        </div>
      </div>
    );
  }

  console.log("PatientManagement: メインコンテンツを表示");

  return (
    <>
      <AdminHeader title="患者情報管理" />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container max-w-6xl mx-auto py-8 px-4">
        <PatientManagementHeader
          onBackToAdmin={handleBackToAdmin}
          onLogout={handleLogout}
        />

        <PatientSearchCard
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onCreatePatient={() => setIsCreateDialogOpen(true)}
          onSyncComplete={handleSyncComplete}
        />

        <PatientStatsCard
          patients={patients}
          onPatientView={handlePatientView}
          onPatientEdit={handlePatientEdit}
          onPatientDelete={handlePatientDelete}
        />

        <PatientDialogsContainer
          selectedPatient={selectedPatient}
          isDetailDialogOpen={isDetailDialogOpen}
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          onDetailDialogClose={() => {
            setIsDetailDialogOpen(false);
            closeDialogs();
          }}
          onCreateDialogClose={() => setIsCreateDialogOpen(false)}
          onEditDialogClose={() => {
            setIsEditDialogOpen(false);
            closeDialogs();
          }}
          onDeleteDialogClose={() => {
            setIsDeleteDialogOpen(false);
            closeDialogs();
          }}
          onCreatePatient={handleCreatePatient}
          onUpdatePatient={handleUpdatePatient}
          onDeletePatient={handleDeletePatient}
        />
      </div>
    </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </>
  );
}
