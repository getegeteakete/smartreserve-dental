
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface TreatmentDetails {
  fee: number;
  duration: number;
}

interface TreatmentItemProps {
  treatmentName: string;
  maxReservations: number;
  details: TreatmentDetails | null;
  onUpdate: (maxReservations: number) => void;
  onDelete: () => void;
  onMaxReservationsChange: (newValue: number) => void;
}

export const TreatmentItem = ({
  treatmentName,
  maxReservations,
  details,
  onUpdate,
  onDelete,
  onMaxReservationsChange
}: TreatmentItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-medium">{treatmentName}</span>
        {details && (
          <span className="text-sm text-gray-600">
            {details.duration}分 - ¥{details.fee.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={maxReservations}
          onChange={(e) => onMaxReservationsChange(parseInt(e.target.value) || 1)}
          className="w-20"
        />
        <Button
          size="sm"
          onClick={() => onUpdate(maxReservations)}
        >
          更新
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
