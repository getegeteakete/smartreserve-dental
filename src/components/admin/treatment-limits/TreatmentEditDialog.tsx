
import React, { useState, useEffect } from "react";
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
import { TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";

interface TreatmentEditDialogProps {
  treatment: TreatmentWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: TreatmentWithCategory) => void;
}

export const TreatmentEditDialog = ({
  treatment,
  isOpen,
  onClose,
  onSave
}: TreatmentEditDialogProps) => {
  console.log("TreatmentEditDialog - Props received:", { treatment, isOpen });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fee: 0,
    duration: 30
  });

  useEffect(() => {
    console.log("TreatmentEditDialog - useEffect triggered", { treatment, isOpen });
    if (treatment) {
      try {
        const newFormData = {
          name: treatment.name || "",
          description: treatment.description || "",
          fee: treatment.fee || 0,
          duration: treatment.duration || 30
        };
        console.log("フォームデータ初期化:", newFormData);
        setFormData(newFormData);
      } catch (error) {
        console.error("フォームデータ初期化エラー:", error);
      }
    }
  }, [treatment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("TreatmentEditDialog - handleSubmit開始");
    console.log("現在のformData:", formData);
    console.log("元のtreatment:", treatment);
    
    try {
      if (treatment) {
        const updatedTreatment: TreatmentWithCategory = {
          ...treatment,
          ...formData
        };
        console.log("更新されるtreatment:", updatedTreatment);
        onSave(updatedTreatment);
        console.log("onSave呼び出し完了");
        onClose();
      } else {
        console.error("treatmentが存在しません");
      }
    } catch (error) {
      console.error("handleSubmitエラー:", error);
    }
  };

  const handleClose = () => {
    try {
      console.log("TreatmentEditDialog - handleClose");
      onClose();
      if (treatment) {
        setFormData({
          name: treatment.name || "",
          description: treatment.description || "",
          fee: treatment.fee || 0,
          duration: treatment.duration || 30
        });
      }
    } catch (error) {
      console.error("handleCloseエラー:", error);
    }
  };

  // 早期リターンでエラーケースをハンドル
  if (!isOpen) {
    return null;
  }

  if (!treatment) {
    console.warn("TreatmentEditDialog - treatmentがnullです");
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>診療メニューを編集</DialogTitle>
          <DialogDescription>
            診療メニューの詳細情報を編集できます。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">メニュー名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  try {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                  } catch (error) {
                    console.error("名前変更エラー:", error);
                  }
                }}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">料金（円）</Label>
              <Input
                id="fee"
                type="number"
                min="0"
                value={formData.fee === 0 ? "" : formData.fee.toString()}
                onChange={(e) => {
                  try {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      fee: value === "" ? 0 : parseInt(value) || 0 
                    }));
                  } catch (error) {
                    console.error("料金変更エラー:", error);
                  }
                }}
                placeholder="料金を入力してください"
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
                onChange={(e) => {
                  try {
                    setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }));
                  } catch (error) {
                    console.error("時間変更エラー:", error);
                  }
                }}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  try {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                  } catch (error) {
                    console.error("説明変更エラー:", error);
                  }
                }}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit">
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
