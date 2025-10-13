
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";
import { TreatmentManagementTable } from "@/components/admin/treatment-limits/TreatmentManagementTable";
import { TreatmentEditWithCategoryDialog } from "@/components/admin/treatment-limits/TreatmentEditWithCategoryDialog";
import { TreatmentCreateDialog } from "@/components/admin/treatment-limits/TreatmentCreateDialog";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useTreatmentsWithCategories, TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function TreatmentManagement() {
  const [loading, setLoading] = useState(true);
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
      
      if (isAdminLoggedIn !== "true" || adminUsername !== "sup@ei-life.co.jp") {
        console.log("管理者認証が必要です");
        navigate("/admin-login");
        return;
      }
      
      console.log("管理者認証済み");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
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
    <>
      <AdminHeader title="診療メニュー管理" />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className={`container ${isMobile ? 'max-w-full px-2' : 'max-w-6xl'} mx-auto py-8 px-4`}>
        <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'} mb-6`}>
          <div className={`${isMobile ? 'space-y-2' : 'flex items-center gap-4'}`}>
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="h-4 w-4" />
              {isMobile ? '戻る' : '管理画面に戻る'}
            </Button>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              {isMobile ? '診療管理' : '診療メニュー管理'}
            </h1>
          </div>
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'flex gap-2'}`}>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              {isMobile ? '新規作成' : '新規メニュー作成'}
            </Button>
            <Button variant="outline" onClick={handleLogout} size={isMobile ? "sm" : "default"}>
              ログアウト
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>
              {isMobile ? '診療メニュー管理' : '診療メニュー・カテゴリー管理'}
            </CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : ''}>
              {isMobile 
                ? '診療メニューとカテゴリーの管理ができます。'
                : '診療メニューとカテゴリーの管理ができます。カテゴリーごとに画像を設定でき、診療メニューをカテゴリー別に整理できます。'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? 'px-2' : ''}>
            <TreatmentManagementTable
              treatments={treatments}
              onEdit={handleEditTreatment}
              onDelete={handleDeleteTreatment}
            />
          </CardContent>
        </Card>

        <TreatmentEditWithCategoryDialog
          treatment={editingTreatment}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingTreatment(null);
          }}
          onSave={handleSaveTreatment}
        />

        <TreatmentCreateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleCreateTreatment}
        />
      </div>
    </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </>
  );
}
