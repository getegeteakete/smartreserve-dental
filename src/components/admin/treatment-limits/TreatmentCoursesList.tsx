
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, ExternalLink, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Treatment } from "@/hooks/useTreatments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { TreatmentEditWithCategoryDialog } from "./TreatmentEditWithCategoryDialog";
import { useTreatmentsWithCategories, TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import { ensureDefaultTreatments } from "@/utils/defaultTreatmentData";

interface TreatmentLimit {
  id: string;
  treatment_name: string;
  max_reservations_per_slot: number;
}

interface TreatmentCoursesListProps {
  treatments: Treatment[];
  treatmentLimits: TreatmentLimit[];
  onUpdate: (treatmentName: string, maxReservations: number) => Promise<void>;
  onAdd: (treatmentName: string, maxReservations: number) => Promise<void>;
  onDelete: (treatmentName: string) => Promise<void>;
  onMaxReservationsChange: (id: string, newValue: number) => void;
  onTreatmentUpdate?: (treatment: TreatmentWithCategory) => void;
  onTreatmentDelete?: (treatmentId: string) => Promise<void>;
}

export const TreatmentCoursesList = ({
  treatments,
  treatmentLimits,
  onUpdate,
  onAdd,
  onDelete,
  onMaxReservationsChange,
  onTreatmentUpdate,
  onTreatmentDelete
}: TreatmentCoursesListProps) => {
  const navigate = useNavigate();
  const { treatments: treatmentsWithCategories = [] } = useTreatmentsWithCategories();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithCategory | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const temporaryLimitsRef = useRef<Record<string, number>>({});
  const [inputValueMap, setInputValueMap] = useState<Record<string, number>>({});

  // 新規コース追加関連の状態
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseFee, setNewCourseFee] = useState("");
  const [newCourseDuration, setNewCourseDuration] = useState("");
  const [newCourseMaxReservations, setNewCourseMaxReservations] = useState("1");

  // デフォルトデータ確保 - 一時的に無効化
  useEffect(() => {
    // 重複データ問題を防ぐため一時的にコメントアウト
    console.log("デフォルトデータ確保処理は一時的に無効化されています");
    /*
    if (treatmentsWithCategories.length === 0) {
      console.log("診療メニューが空のため、デフォルトデータを確保します");
      ensureDefaultTreatments().catch(error => {
        console.error("デフォルトデータ確保エラー:", error);
      });
    }
    */
  }, [treatmentsWithCategories]);

  const toggleCourse = (courseName: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseName)) {
      newExpanded.delete(courseName);
    } else {
      newExpanded.add(courseName);
    }
    setExpandedCourses(newExpanded);
    console.log(`Toggled ${courseName}, expanded courses:`, Array.from(newExpanded));
  };

  const handleDelete = async (treatmentName: string) => {
    if (confirm(`「${treatmentName}」を削除してもよろしいですか？`)) {
      await onDelete(treatmentName);
    }
  };

  const handleEditTreatment = useCallback((treatment: TreatmentWithCategory) => {
    console.log("🔴 編集開始 - handleEditTreatment呼び出し:", treatment);
    console.log("🔴 treatment型確認:", typeof treatment, treatment);
    setEditingTreatment(treatment);
    setIsEditDialogOpen(true);
    console.log("🔴 ダイアログ状態更新完了");
  }, []);

  const handleTreatmentDelete = useCallback(async (treatment: TreatmentWithCategory) => {
    if (confirm(`「${treatment.name}」を削除してもよろしいですか？`)) {
      if (onTreatmentDelete) {
        try {
          await onTreatmentDelete(treatment.id);
          console.log("治療メニュー削除完了:", treatment.name);
          // 強制更新でUIに反映
          setForceUpdateKey(prev => prev + 1);
        } catch (error) {
          console.error("治療メニュー削除エラー:", error);
        }
      }
    }
  }, [onTreatmentDelete]);

  const handleSaveTreatment = async (updatedTreatment: TreatmentWithCategory) => {
    console.log("TreatmentCoursesList - handleSaveTreatment開始");
    console.log("更新された診療メニュー:", updatedTreatment);
    console.log("onTreatmentUpdate存在チェック:", !!onTreatmentUpdate);
    
    if (onTreatmentUpdate) {
      console.log("onTreatmentUpdate呼び出し");
      
      // すでにTreatmentWithCategory型なので変換不要
      const treatmentWithCategory = updatedTreatment;
      
      try {
        // 非同期でデータ更新を実行
        await onTreatmentUpdate(treatmentWithCategory);
        console.log("✅ 治療データ更新成功 - キャッシュ無効化を待機");
        
        // React Queryのキャッシュ無効化とデータ再取得を待つ
        setTimeout(() => {
          console.log("🟠 500ms後：キャッシュ無効化完了 - 強制更新とダイアログクローズ");
          console.log("🟠 現在のforceUpdateKey:", forceUpdateKey);
          setForceUpdateKey(prev => {
            const newKey = prev + 1;
            console.log("🟠 forceUpdateKey更新:", prev, "→", newKey);
            return newKey;
          });
          
          // さらに短い遅延でダイアログクローズ
          setTimeout(() => {
            console.log("🟠 ダイアログクローズ実行");
            setEditingTreatment(null);
            setIsEditDialogOpen(false);
          }, 100);
          
        }, 800); // より長い時間でキャッシュ更新を待つ
        
      } catch (error) {
        console.error("❌ 治療データ更新エラー:", error);
        setEditingTreatment(null);
        setIsEditDialogOpen(false);
      }
    } else {
      console.error("onTreatmentUpdateが存在しません");
      setEditingTreatment(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleAddNewCourse = async () => {
    const treatmentName = selectedCourse ? `${selectedCourse}:${newCourseName}` : newCourseName;
    await onAdd(treatmentName, parseInt(newCourseMaxReservations) || 1);
    
    // フォームをリセット
    setNewCourseName("");
    setNewCourseDescription("");
    setNewCourseFee("");
    setNewCourseDuration("");
    setNewCourseMaxReservations("1");
    setSelectedCourse("");
    setIsAddDialogOpen(false);
  };

  const handleViewCourseDetail = (courseCategory: string) => {
    navigate(`/course/${encodeURIComponent(courseCategory)}`);
  };

  // 現在の診療メニューデータを使用（重複を防ぐため優先順位を設定）
  const currentTreatments = treatmentsWithCategories.length > 0 ? treatmentsWithCategories : treatments;

  console.log("Current treatments data:", currentTreatments);
  console.log("treatmentsWithCategories count:", treatmentsWithCategories.length);
  console.log("treatments count:", treatments.length);
  console.log("Actual treatment names:", currentTreatments.map(t => t.name));
  console.log("Treatment IDs and names:", currentTreatments.map(t => ({ id: t.id, name: t.name, created_at: t.created_at })));

  // 動的コース分類：実際のデータに基づいてカテゴリーを生成
  const generateDynamicCategories = useCallback(() => {
    const categories: Record<string, string[]> = {};
    
    console.log("🔴 カテゴリー生成開始 - forceUpdateKey:", forceUpdateKey);
    console.log("🔴 利用可能なtreatmentsWithCategories:", treatmentsWithCategories.length);
    console.log("🔴 treatmentsWithCategories詳細:", treatmentsWithCategories.map(t => ({
      name: t.name,
      category_id: t.category_id,
      category_name: t.category?.name
    })));
    
    // カテゴリーなしの治療
    const uncategorizedTreatments = treatmentsWithCategories
      .filter(t => !t.category_id || !t.category)
      .map(t => t.name);
    
    console.log("🔴 カテゴリーなしの治療:", uncategorizedTreatments);
    
    if (uncategorizedTreatments.length > 0) {
      categories["カテゴリーなし"] = uncategorizedTreatments;
    }
    
    // カテゴリー別の治療をグループ化
    treatmentsWithCategories
      .filter(t => t.category_id && t.category)
      .forEach(treatment => {
        const categoryName = treatment.category.name;
        console.log(`🔴 カテゴリー処理: ${treatment.name} → ${categoryName}`);
        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        if (!categories[categoryName].includes(treatment.name)) {
          categories[categoryName].push(treatment.name);
        }
      });
    
    console.log("動的カテゴリー生成結果:", categories);
    return categories;
  }, [treatmentsWithCategories, forceUpdateKey]);
  
  const courseCategories = generateDynamicCategories();

  // 設定済みの診療制限から該当する治療を取得
  const getTreatmentLimit = (treatmentName: string) => {
    console.log("getTreatmentLimit呼び出し:", { treatmentName, treatmentLimitsCount: treatmentLimits.length });
    console.log("利用可能なtreatmentLimits:", treatmentLimits);
    const result = treatmentLimits.find(tl => tl.treatment_name === treatmentName);
    console.log("マッチング結果:", result);
    return result;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">診療コース別設定</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規コース追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規コース追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="parentCourse">親コース（子カテゴリを作成する場合）</Label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">新規メインコース</option>
                  {Object.keys(courseCategories).map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="courseName">コース名</Label>
                <Input
                  id="courseName"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="コース名を入力"
                />
              </div>
              
              <div>
                <Label htmlFor="courseDescription">説明</Label>
                <Textarea
                  id="courseDescription"
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="コースの説明を入力"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseFee">料金</Label>
                  <Input
                    id="courseFee"
                    type="number"
                    value={newCourseFee}
                    onChange={(e) => setNewCourseFee(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="courseDuration">時間（分）</Label>
                  <Input
                    id="courseDuration"
                    type="number"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="maxReservations">最大予約人数</Label>
                <Input
                  id="maxReservations"
                  type="number"
                  min="1"
                  value={newCourseMaxReservations}
                  onChange={(e) => setNewCourseMaxReservations(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddNewCourse} disabled={!newCourseName}>
                  追加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {Object.entries(courseCategories).map(([courseCategory, treatmentNames]) => {
          const isExpanded = expandedCourses.has(courseCategory);
          
          // より正確なマッチングロジック（treatmentsWithCategoriesを使用）
          const allMatchedTreatments = treatmentsWithCategories.filter(t => {
            // 完全一致を優先
            if (treatmentNames.includes(t.name)) {
              console.log(`完全一致: ${courseCategory} - ${t.name}`);
              return true;
            }
            
            // 部分マッチング（カテゴリーごとに特化）
            let match = false;
            switch (courseCategory) {
              case "初診":
                match = t.name.includes("初診") && (t.name.includes("無料") || t.name.includes("有料"));
                break;
              case "精密検査":
                match = t.name.includes("精密検査");
                break;
              case "ホワイトニング":
                match = t.name.includes("ホワイトニング") && 
                       (t.name.includes("ホーム") || t.name.includes("オフィス") || t.name.includes("ダブル"));
                break;
              case "PMTC":
                match = t.name.includes("PMTC");
                break;
              default:
                match = false;
            }
            
            if (match) {
              console.log(`部分一致: ${courseCategory} - ${t.name}`);
            }
            return match;
          });

          // 重複除去：同じ名前の診療メニューがある場合は最新のもの（created_atが最新）を使用
          const relevantTreatments = allMatchedTreatments.reduce((unique, current) => {
            const existing = unique.find(t => t.name === current.name);
            if (!existing) {
              unique.push(current);
            } else {
              // より新しいデータで置き換え
              if (new Date(current.created_at) > new Date(existing.created_at)) {
                const index = unique.findIndex(t => t.name === current.name);
                unique[index] = current;
              }
            }
            return unique;
          }, [] as TreatmentWithCategory[]);
          
          console.log(`カテゴリー「${courseCategory}」のマッチ結果:`, {
            expectedNames: treatmentNames,
            beforeDeduplication: allMatchedTreatments.length,
            afterDeduplication: relevantTreatments.length,
            foundNames: relevantTreatments.map(t => t.name),
            isExpanded
          });
          
          console.log(`🔍 relevantTreatments詳細:`, relevantTreatments);
          console.log(`🔍 isExpanded状態:`, isExpanded);
          console.log(`🔍 テーブル表示条件 (relevantTreatments.length > 0):`, relevantTreatments.length > 0);
          
          return (
            <div key={courseCategory} className="border rounded-lg">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCourse(courseCategory)}
                    className="p-0 h-auto"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="font-medium text-lg">{courseCategory}</span>
                  <span className="text-sm text-gray-500">({relevantTreatments.length}件)</span>
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCourseDetail(courseCategory)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      詳細ページ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(courseCategory);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      子カテゴリ追加
                    </Button>
                  </div>
                </div>
              </div>

              <Collapsible open={isExpanded}>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4">
                    {(() => {
                      console.log(`🔍 テーブル条件チェック - ${courseCategory}: ${relevantTreatments.length} > 0 = ${relevantTreatments.length > 0}`);
                      return relevantTreatments.length > 0;
                    })() ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>診療メニュー</TableHead>
                            <TableHead>料金・時間</TableHead>
                            <TableHead>説明</TableHead>
                            <TableHead>最大予約人数</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relevantTreatments.map((treatment) => {
                            console.log("🟢 テーブル行レンダリング:", treatment.name, treatment.id);
                            
                            // 毎回最新のtreatmentLimitを取得して、リアルタイム更新に対応
                            const treatmentLimit = getTreatmentLimit(treatment.name);
                            const currentLimit = treatmentLimit?.max_reservations_per_slot || 1;
                            const tempKey = `treatment_${treatment.id}`;
                            const displayValue = inputValueMap[tempKey] !== undefined ? inputValueMap[tempKey] : currentLimit;
                            
                            console.log("🔍 テーブル行描画:", { 
                              treatmentName: treatment.name, 
                              treatmentId: treatment.id,
                              currentLimit,
                              tempKey,
                              inputValue: inputValueMap[tempKey],
                              displayValue 
                            });
                            
                            return (
                              <TableRow key={treatment.id}>
                                <TableCell className="font-medium">
                                  {treatment.name}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{treatment.duration}分</div>
                                    <div className="font-medium">
                                      {treatment.fee === 0 ? "無料" : `¥${treatment.fee.toLocaleString()}`}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="text-xs text-gray-600 line-clamp-2">
                                    {treatment.description || "説明なし"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    console.log("🔍 最大予約人数セル描画:", { 
                                      treatmentName: treatment.name, 
                                      displayValue, 
                                      tempKey,
                                      treatmentLimit: treatmentLimit?.id 
                                    });
                                    return (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          min="1"
                                          value={displayValue}
                                          onFocus={() => {
                                            console.log("🟦 入力欄フォーカス:", { treatmentName: treatment.name, tempKey, currentValue: displayValue });
                                          }}
                                          onBlur={() => {
                                            console.log("🟫 入力欄ブラー:", { treatmentName: treatment.name, tempKey, currentValue: displayValue });
                                          }}
                                          onClick={() => {
                                            console.log("🟩 入力欄クリック:", { treatmentName: treatment.name, tempKey, currentValue: displayValue });
                                          }}
                                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || 1;
                                            console.log("🔄 入力値変更:", { treatmentName: treatment.name, newValue, oldValue: displayValue, tempKey });
                                            setInputValueMap(prev => {
                                              console.log("🔄 状態更新前:", prev);
                                              const newState = { ...prev, [tempKey]: newValue };
                                              console.log("🔄 状態更新後:", newState);
                                              return newState;
                                            });
                                          }}
                                          className="w-20"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={async () => {
                                            console.log("🔵 保存ボタンクリック開始");
                                            const valueToSave = inputValueMap[tempKey] !== undefined ? inputValueMap[tempKey] : currentLimit;
                                            console.log("保存実行:", { treatmentName: treatment.name, valueToSave, treatmentLimit });
                                            
                                                                        try {
                              if (treatmentLimit) {
                                console.log("🟢 既存制限の更新:", treatmentLimit.id);
                                await onUpdate(treatment.name, valueToSave);
                              } else {
                                console.log("🟡 新規制限の追加:", treatment.name);
                                await onAdd(treatment.name, valueToSave);
                              }
                              
                              console.log("✅ 保存成功 - データ更新を待機");
                              
                              // データ更新を待つために少し遅延
                              setTimeout(() => {
                                const updatedLimit = getTreatmentLimit(treatment.name);
                                console.log("🔄 遅延後の最新treatmentLimit:", updatedLimit);
                                
                                // 更新が確認できたら入力マップをクリア
                                if (updatedLimit && updatedLimit.max_reservations_per_slot === valueToSave) {
                                  console.log("✅ データ更新確認 - 一時的な値をクリア");
                                  setInputValueMap(prev => {
                                    const newState = { ...prev };
                                    delete newState[tempKey];
                                    console.log("🔄 入力マップクリア後:", newState);
                                    return newState;
                                  });
                                } else {
                                  console.log("⚠️ データ更新未確認 - 入力値を保持");
                                }
                              }, 100);
                              
                            } catch (error) {
                              console.error("❌ 保存エラー:", error);
                              // エラー時は一時的な値を保持
                            }
                                            
                                            console.log("🔵 保存ボタンクリック完了");
                                          }}
                                        >
                                          保存
                                        </Button>
                                      </div>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        console.log("🟡 編集ボタンクリック:", treatment);
                                        handleEditTreatment(treatment);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      編集
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTreatmentDelete(treatment as TreatmentWithCategory)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      削除
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>このカテゴリーには診療メニューがありません</p>
                        <p className="text-sm mt-2">
                          診療メニューを作成するか、既存のメニューがこのカテゴリーに正しく分類されていることを確認してください。
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>

      <TreatmentEditWithCategoryDialog
        treatment={editingTreatment}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTreatment(null);
        }}
        onSave={handleSaveTreatment}
      />
    </div>
  );
};
