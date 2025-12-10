import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePatients, Patient } from "@/hooks/usePatients";
import { usePatientManagementAuth } from "@/hooks/usePatientManagementAuth";
import { usePatientManagementState } from "@/hooks/usePatientManagementState";
import { PatientManagementHeader } from "@/components/admin/patient/PatientManagementHeader";
import { PatientSearchCard } from "@/components/admin/patient/PatientSearchCard";
import { PatientStatsCard } from "@/components/admin/patient/PatientStatsCard";
import { PatientDialogsContainer } from "@/components/admin/patient/PatientDialogsContainer";

const AdminPatients = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      {!isMobile && (
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      )}
      {isMobile && (
        <AdminSidebar 
          isCollapsed={false} 
          onToggle={toggleSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={closeMobileMenu}
        />
      )}
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* ヘッダー */}
        <AdminContentHeader 
          title="SmartReserve" 
          subtitle="患者管理"
          onMenuToggle={toggleMobileMenu}
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダーセクション */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-4 w-4" />
                管理画面に戻る
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">患者管理</h1>
            </div>

            {/* 患者管理コンポーネント */}
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
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
};

export default AdminPatients;
