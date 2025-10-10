
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, FolderPlus } from "lucide-react";
import { TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { useState, useEffect } from "react";
import { CategoryManagementDialog } from "./CategoryManagementDialog";
import { TreatmentEditWithCategoryDialog } from "./TreatmentEditWithCategoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TreatmentManagementTableProps {
  treatments: TreatmentWithCategory[];
  onEdit: (treatment: TreatmentWithCategory) => void;
  onDelete: (treatmentId: string) => void;
}

export const TreatmentManagementTable = ({
  treatments,
  onEdit,
  onDelete
}: TreatmentManagementTableProps) => {
  const { categories, deleteCategory, fetchCategories } = useTreatmentCategories();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<Array<{ name: string; treatments: TreatmentWithCategory[] }>>([]);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [categoryDuplicates, setCategoryDuplicates] = useState<Array<{ name: string; categories: any[] }>>([]);
  const [isCleaningCategoryDuplicates, setIsCleaningCategoryDuplicates] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("🔥 TreatmentManagementTable useEffect - forceUpdateKey:", forceUpdateKey);
    console.log("TreatmentManagementTable - treatments:", treatments);
    console.log("TreatmentManagementTable - categories:", categories);
    console.log("Detailed treatments with IDs:", treatments.map(t => ({ 
      id: t.id, 
      name: t.name, 
      created_at: t.created_at,
      category_id: t.category_id 
    })));
    
    // 重複チェック
    const nameGroups = treatments.reduce((acc, treatment) => {
      if (!acc[treatment.name]) {
        acc[treatment.name] = [];
      }
      acc[treatment.name].push(treatment);
      return acc;
    }, {} as Record<string, typeof treatments>);
    
    const duplicatesList = Object.entries(nameGroups)
      .filter(([name, treatments]) => treatments.length > 1)
      .map(([name, treatments]) => ({ name, treatments }));
    
    setDuplicates(duplicatesList);
    
    if (duplicatesList.length > 0) {
      console.log("🚨 重複データが見つかりました:", duplicatesList);
      duplicatesList.forEach(({ name, treatments }) => {
        console.log(`重複: "${name}" - ${treatments.length}件`, treatments.map(t => ({ id: t.id, created_at: t.created_at })));
      });
    }

    // カテゴリの重複チェック
    const categoryNameGroups = categories.reduce((acc, category) => {
      if (!acc[category.name]) {
        acc[category.name] = [];
      }
      acc[category.name].push(category);
      return acc;
    }, {} as Record<string, typeof categories>);
    
    const categoryDuplicatesList = Object.entries(categoryNameGroups)
      .filter(([name, categories]) => categories.length > 1)
      .map(([name, categories]) => ({ name, categories }));
    
    setCategoryDuplicates(categoryDuplicatesList);
    
    if (categoryDuplicatesList.length > 0) {
      console.log("🚨 重複カテゴリが見つかりました:", categoryDuplicatesList);
      categoryDuplicatesList.forEach(({ name, categories }) => {
        console.log(`重複カテゴリ: "${name}" - ${categories.length}件`, categories.map(c => ({ id: c.id, created_at: c.created_at })));
      });
    }
  }, [treatments, categories, forceUpdateKey]);

  const cleanupDuplicates = async () => {
    if (duplicates.length === 0) return;
    
    setIsCleaningDuplicates(true);
    try {
      for (const { name, treatments: duplicateTreatments } of duplicates) {
        // 最新のもの（created_atが最新）を残して、古いものを削除
        const sorted = duplicateTreatments.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`${name}: 保持するID=${toKeep.id}, 削除するID=[${toDelete.map(t => t.id).join(', ')}]`);
        
        for (const treatment of toDelete) {
          const { error } = await supabase
            .from('treatments')
            .delete()
            .eq('id', treatment.id);
          
          if (error) {
            console.error(`削除エラー (${treatment.id}):`, error);
            throw error;
          }
        }
      }
      
      toast({
        title: "成功",
        description: "重複データを削除しました",
      });
      
      // TOPページのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["treatments-with-categories"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      
      // ページをリロードして最新状態を取得
      window.location.reload();
      
    } catch (error) {
      console.error("重複削除エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "重複データの削除に失敗しました",
      });
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  const cleanupCategoryDuplicates = async () => {
    if (categoryDuplicates.length === 0) return;
    
    setIsCleaningCategoryDuplicates(true);
    try {
      for (const { name, categories: duplicateCategories } of categoryDuplicates) {
        // 最古のもの（created_atが最古）を残して、新しいものを削除
        const sorted = duplicateCategories.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`カテゴリ${name}: 保持するID=${toKeep.id}, 削除するID=[${toDelete.map(c => c.id).join(', ')}]`);
        
        // 削除予定のカテゴリを参照している治療メニューを、保持するカテゴリに移行
        for (const categoryToDelete of toDelete) {
          // このカテゴリを参照している治療メニューを更新
          const { error: updateError } = await supabase
            .from('treatments')
            .update({ category_id: toKeep.id })
            .eq('category_id', categoryToDelete.id);
          
          if (updateError) {
            console.error(`治療メニューの移行エラー (カテゴリID: ${categoryToDelete.id}):`, updateError);
            throw updateError;
          }
          
          // カテゴリを削除
          const { error: deleteError } = await supabase
            .from('treatment_categories')
            .delete()
            .eq('id', categoryToDelete.id);
          
          if (deleteError) {
            console.error(`カテゴリ削除エラー (${categoryToDelete.id}):`, deleteError);
            throw deleteError;
          }
        }
      }
      
      toast({
        title: "成功",
        description: "重複カテゴリを削除しました",
      });
      
      // データを再取得
      await fetchCategories();
      setForceUpdateKey(prev => prev + 1);
      
      // TOPページのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["treatments-with-categories"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      
    } catch (error) {
      console.error("重複カテゴリ削除エラー:", error);
      toast({
        title: "エラー",
        description: "重複カテゴリの削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsCleaningCategoryDuplicates(false);
    }
  };

  // カテゴリー名に基づく診療メニューの柔軟なマッチング
  const getMatchingTreatments = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    
    // まずcategory_idでマッチングを試行
    const directMatches = treatments.filter(t => t.category_id === category?.id);
    
    if (directMatches.length > 0) {
      return directMatches;
    }
    
    // category_idでマッチしない場合、名前ベースでマッチング
    switch (categoryName) {
      case '初診':
        return treatments.filter(t => 
          t.name.includes('初診') || t.name.includes('初心')
        );
      case '精密検査':
        return treatments.filter(t => 
          t.name.includes('精密検査')
        );
      case 'ホワイトニング':
        return treatments.filter(t => 
          t.name.includes('ホワイトニング')
        );
      case 'PMTC':
        return treatments.filter(t => 
          t.name.includes('PMTC') || t.name.includes('クリーニング')
        );
      default:
        return [];
    }
  };

  // カテゴリー別にグループ化
  const groupedTreatments = categories.map(category => {
    const categoryTreatments = getMatchingTreatments(category.name);
    
    console.log(`カテゴリー「${category.name}」にマッチした診療メニュー:`, categoryTreatments);
    
    return {
      category,
      treatments: categoryTreatments
    };
  });

  // 使用済みの診療メニューIDを収集
  const usedTreatmentIds = new Set(
    groupedTreatments.flatMap(group => group.treatments.map(t => t.id))
  );

  // カテゴリーなしの診療メニュー
  const uncategorizedTreatments = treatments.filter(t => !usedTreatmentIds.has(t.id));

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('このカテゴリーを削除してもよろしいですか？')) {
      try {
        await deleteCategory(categoryId);
        toast({
          title: "成功",
          description: "カテゴリーを削除しました",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "カテゴリーの削除に失敗しました",
        });
      }
    }
  };

  const handleEditCategory = (category: any) => {
    console.log("カテゴリー編集開始:", category);
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">診療メニュー管理</h3>
        <Button
          onClick={() => setIsCategoryDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          新規カテゴリー作成
        </Button>
      </div>

      {/* 重複データ警告 */}
      {duplicates.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ 重複データが検出されました</h4>
          <p className="text-sm text-red-700 mb-3">
            同じ名前の治療メニューが複数存在します：
            {duplicates.map(d => `「${d.name}」(${d.treatments.length}件)`).join(', ')}
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={cleanupDuplicates}
            disabled={isCleaningDuplicates}
          >
            {isCleaningDuplicates ? '削除中...' : '重複データを削除'}
          </Button>
        </div>
      )}

      {/* カテゴリ重複データ警告 */}
      {categoryDuplicates.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">⚠️ 重複カテゴリが検出されました</h4>
          <p className="text-sm text-orange-700 mb-3">
            同じ名前のカテゴリが複数存在します：
            {categoryDuplicates.map(d => `「${d.name}」(${d.categories.length}件)`).join(', ')}
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={cleanupCategoryDuplicates}
            disabled={isCleaningCategoryDuplicates}
          >
            {isCleaningCategoryDuplicates ? '削除中...' : '重複カテゴリを削除'}
          </Button>
        </div>
      )}



      {/* カテゴリー別表示 */}
      {groupedTreatments.map(({ category, treatments: categoryTreatments }) => (
        <div key={category.id} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              {category.image_url && (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-semibold text-lg">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {categoryTreatments.length}件の診療メニュー
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditCategory(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {categoryTreatments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>メニュー名</TableHead>
                  <TableHead>料金</TableHead>
                  <TableHead>所要時間</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryTreatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">
                      {treatment.name}
                    </TableCell>
                    <TableCell>
                      {treatment.fee === 0 ? (
                        <Badge variant="secondary">無料</Badge>
                      ) : (
                        `¥${treatment.fee.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell>{treatment.duration}分</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {treatment.description || "説明なし"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(treatment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(treatment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              このカテゴリーには診療メニューがありません
            </div>
          )}
        </div>
      ))}

      {/* カテゴリーなしの診療メニュー */}
      {uncategorizedTreatments.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h4 className="font-semibold text-lg">カテゴリーなし</h4>
            <p className="text-xs text-gray-500">
              {uncategorizedTreatments.length}件の診療メニュー
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メニュー名</TableHead>
                <TableHead>料金</TableHead>
                <TableHead>所要時間</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uncategorizedTreatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">
                    {treatment.name}
                  </TableCell>
                  <TableCell>
                    {treatment.fee === 0 ? (
                      <Badge variant="secondary">無料</Badge>
                    ) : (
                      `¥${treatment.fee.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell>{treatment.duration}分</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {treatment.description || "説明なし"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(treatment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(treatment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryManagementDialog
        category={editingCategory}
        isOpen={isCategoryDialogOpen}
        onClose={handleCloseCategoryDialog}
        onSuccess={async () => {
          console.log("🔵 カテゴリー更新成功 - カテゴリーデータ再取得開始");
          await fetchCategories();
          console.log("🔵 カテゴリーデータ再取得完了");
          setForceUpdateKey(prev => prev + 1);
          console.log("🔵 TreatmentManagementTable 強制更新完了");
        }}
      />
    </div>
  );
};
