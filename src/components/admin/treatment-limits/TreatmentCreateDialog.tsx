
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";

interface TreatmentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: Omit<TreatmentWithCategory, "id" | "created_at" | "updated_at" | "category">) => void;
}

export const TreatmentCreateDialog = ({
  isOpen,
  onClose,
  onSave
}: TreatmentCreateDialogProps) => {
  const { categories } = useTreatmentCategories();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fee: 0,
    duration: 30,
    category_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // カテゴリーIDの処理（"none"をnullに変換）
      const categoryId = formData.category_id === "" || formData.category_id === "none" ? null : formData.category_id;
      
      const treatmentData = {
        name: formData.name,
        description: formData.description || null,
        fee: formData.fee,
        duration: formData.duration,
        category_id: categoryId,
      };

      await onSave(treatmentData);
      
      // フォームをリセット
      setFormData({
        name: "",
        description: "",
        fee: 0,
        duration: 30,
        category_id: "",
      });
      
      onClose();
    } catch (error) {
      console.error("診療メニュー作成エラー:", error);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      fee: 0,
      duration: 30,
      category_id: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しい診療メニューを作成</DialogTitle>
          <DialogDescription>
            新しい診療メニューの詳細情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">メニュー名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="診療メニュー名を入力"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">カテゴリーなし</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">料金（円）</Label>
              <Input
                id="fee"
                type="number"
                min="0"
                value={formData.fee}
                onChange={(e) => setFormData(prev => ({ ...prev, fee: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">所要時間（分）</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                placeholder="30"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="診療内容の詳細説明を入力してください"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit">
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
