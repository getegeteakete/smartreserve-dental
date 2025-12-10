import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { TreatmentManagementTable } from "@/components/admin/treatment-limits/TreatmentManagementTable";
import { TreatmentEditWithCategoryDialog } from "@/components/admin/treatment-limits/TreatmentEditWithCategoryDialog";
import { TreatmentCreateDialog } from "@/components/admin/treatment-limits/TreatmentCreateDialog";
import { useTreatmentsWithCategories, TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";

const AdminTreatments = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { treatments, updateTreatment, createTreatment, deleteTreatment, refetch } = useTreatmentsWithCategories();
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      console.log("管理者認証チェック:", { isAdminLoggedIn, adminUsername });
      
      if (!isAdminLoggedIn || adminUsername !== "sup@ei-life.co.jp") {
        console.log("管理者認証が必要です");
        navigate("/admin-login");
        return;
      }
      
      console.log("管理者認証済み");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleEditTreatment = (treatment: TreatmentWithCategory) => {
    setEditingTreatment(treatment);
    setIsEditDialogOpen(true);
  };

  const handleSaveTreatment = async (updatedTreatment: TreatmentWithCategory) => {
    console.log("🟡 TreatmentManagement - 治療保存開始:", updatedTreatment);
    
    try {
      await updateTreatment(updatedTreatment);
      console.log("🟡 TreatmentManagement - 治療更新成功");
      
      // 強制的にデータを再取得
      await refetch();
      console.log("🟡 TreatmentManagement - データ再取得完了");
      
      // データ更新を待ってからダイアログを閉じる
      setTimeout(() => {
        console.log("🟡 TreatmentManagement - ダイアログクローズ");
        setEditingTreatment(null);
        setIsEditDialogOpen(false);
      }, 200);
      
    } catch (error) {
      console.error("🟡 TreatmentManagement - 治療更新エラー:", error);
      setEditingTreatment(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleCreateTreatment = (newTreatment: Omit<TreatmentWithCategory, "id" | "created_at" | "updated_at" | "category">) => {
    createTreatment(newTreatment);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (confirm("この診療メニューを削除してもよろしいですか？")) {
      try {
        await deleteTreatment(treatmentId);
        // 削除後にデータを再取得
        await refetch();
        console.log("治療メニュー削除・再取得完了");
      } catch (error) {
        console.error("治療メニュー削除エラー:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">認証確認中...</p>
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
          subtitle="診療メニュー管理"
          onMenuToggle={toggleMobileMenu}
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ヘッダーセクション */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">診療メニュー管理</h1>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-4 w-4" />
                新規メニュー作成
              </Button>
            </div>

            {/* コンテンツ */}
            <Card>
              <CardHeader>
                <CardTitle>診療メニュー・カテゴリー管理</CardTitle>
                <CardDescription>
                  診療メニューとカテゴリーの管理ができます。カテゴリーごとに画像を設定でき、診療メニューをカテゴリー別に整理できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentManagementTable
                  treatments={treatments}
                  onEdit={handleEditTreatment}
                  onDelete={handleDeleteTreatment}
                />
              </CardContent>
            </Card>

            {/* ダイアログ */}
            <TreatmentEditWithCategoryDialog
              treatment={editingTreatment}
              isOpen={isEditDialogOpen}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEditingTreatment(null);
              }}
              onSave={handleSaveTreatment}
              existingTreatments={treatments}
            />

            <TreatmentCreateDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
              onSave={handleCreateTreatment}
              existingTreatments={treatments}
            />
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
};

export default AdminTreatments;
