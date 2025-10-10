
import { useState, useEffect } from "react";
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
import { TreatmentCategory, useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { Upload, Image as ImageIcon } from "lucide-react";

interface CategoryManagementDialogProps {
  category: TreatmentCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CategoryManagementDialog = ({
  category,
  isOpen,
  onClose,
  onSuccess
}: CategoryManagementDialogProps) => {
  const { createCategory, updateCategory, uploadImage } = useTreatmentCategories();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        display_order: category.display_order
      });
      setImagePreview(category.image_url || null);
    } else {
      setFormData({
        name: "",
        description: "",
        display_order: 0
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = category?.image_url || null;

      if (category) {
        // 更新
        if (imageFile) {
          imageUrl = await uploadImage(imageFile, category.id);
        }
        await updateCategory(category.id, {
          ...formData,
          image_url: imageUrl
        });
      } else {
        // 新規作成
        const newCategory = await createCategory(formData);
        if (imageFile && newCategory) {
          imageUrl = await uploadImage(imageFile, newCategory.id);
          await updateCategory(newCategory.id, { image_url: imageUrl });
        }
      }

      console.log("🔵 カテゴリー保存成功 - onSuccess呼び出し");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("カテゴリー保存エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      display_order: 0
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "カテゴリーを編集" : "新しいカテゴリーを作成"}
          </DialogTitle>
          <DialogDescription>
            診療メニューのカテゴリー情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">カテゴリー名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="カテゴリー名を入力"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="カテゴリーの説明を入力してください"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_order">表示順序</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">カテゴリー画像</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    画像を選択
                  </Button>
                </div>
                {imagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full h-[200px] object-cover"
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">画像が選択されていません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : (category ? "更新" : "作成")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
