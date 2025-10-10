
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface TreatmentLimit {
  id: string;
  treatment_name: string;
  max_reservations_per_slot: number;
}

interface TreatmentDetails {
  fee: number;
  duration: number;
}

interface SubCourseTableProps {
  subCourses: (TreatmentLimit & { subCourse: string; isSubCourse: boolean })[];
  getTreatmentDetails: (treatmentName: string) => TreatmentDetails | null;
  onUpdate: (treatmentName: string, maxReservations: number) => Promise<void>;
  onDelete: (treatmentName: string) => Promise<void>;
  onMaxReservationsChange: (id: string, newValue: number) => void;
}

export const SubCourseTable = ({
  subCourses,
  getTreatmentDetails,
  onUpdate,
  onDelete,
  onMaxReservationsChange
}: SubCourseTableProps) => {
  const handleDelete = async (treatmentName: string) => {
    if (confirm(`「${treatmentName}」を削除してもよろしいですか？`)) {
      await onDelete(treatmentName);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>詳細コース</TableHead>
          <TableHead>料金・時間</TableHead>
          <TableHead>最大予約人数</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subCourses.map((subCourse) => {
          const details = getTreatmentDetails(subCourse.treatment_name);
          return (
            <TableRow key={subCourse.id}>
              <TableCell className="font-medium pl-8">
                ∟{subCourse.subCourse}【修正】
              </TableCell>
              <TableCell>
                {details ? (
                  <span className="text-sm">
                    {details.duration}分 - ¥{details.fee.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">詳細不明</span>
                )}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={subCourse.max_reservations_per_slot}
                  onChange={(e) => onMaxReservationsChange(subCourse.id, parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onUpdate(subCourse.treatment_name, subCourse.max_reservations_per_slot)}
                  >
                    更新
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(subCourse.treatment_name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
