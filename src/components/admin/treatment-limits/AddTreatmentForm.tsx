
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddTreatmentFormProps {
  onAdd: (treatmentName: string, maxReservations: number) => Promise<void>;
}

export const AddTreatmentForm = ({ onAdd }: AddTreatmentFormProps) => {
  const [newTreatmentName, setNewTreatmentName] = useState("");
  const [newTreatmentLimit, setNewTreatmentLimit] = useState(1);

  const handleAdd = async () => {
    if (newTreatmentName.trim()) {
      await onAdd(newTreatmentName, newTreatmentLimit);
      setNewTreatmentName("");
      setNewTreatmentLimit(1);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">新しい診療種別を追加</h3>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="new-treatment">診療種別名</Label>
          <Input
            id="new-treatment"
            value={newTreatmentName}
            onChange={(e) => setNewTreatmentName(e.target.value)}
            placeholder="例: カウンセリング:初回相談"
          />
        </div>
        <div className="w-32">
          <Label htmlFor="new-limit">最大予約人数</Label>
          <Input
            id="new-limit"
            type="number"
            min="1"
            value={newTreatmentLimit}
            onChange={(e) => setNewTreatmentLimit(parseInt(e.target.value) || 1)}
          />
        </div>
        <Button onClick={handleAdd}>
          追加
        </Button>
      </div>
    </div>
  );
};
