
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { TreatmentItem } from "./TreatmentItem";
import { SubCourseTable } from "./SubCourseTable";

interface TreatmentLimit {
  id: string;
  treatment_name: string;
  max_reservations_per_slot: number;
}

interface TreatmentDetails {
  fee: number;
  duration: number;
}

interface GroupedTreatmentsListProps {
  groupedTreatments: Record<string, (TreatmentLimit & { subCourse: string; isSubCourse: boolean })[]>;
  getTreatmentDetails: (treatmentName: string) => TreatmentDetails | null;
  onUpdate: (treatmentName: string, maxReservations: number) => Promise<void>;
  onDelete: (treatmentName: string) => Promise<void>;
  onMaxReservationsChange: (id: string, newValue: number) => void;
}

export const GroupedTreatmentsList = ({
  groupedTreatments,
  getTreatmentDetails,
  onUpdate,
  onDelete,
  onMaxReservationsChange
}: GroupedTreatmentsListProps) => {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const toggleCourse = (courseName: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseName)) {
      newExpanded.delete(courseName);
    } else {
      newExpanded.add(courseName);
    }
    setExpandedCourses(newExpanded);
  };

  const handleDelete = async (treatmentName: string) => {
    if (confirm(`「${treatmentName}」を削除してもよろしいですか？`)) {
      await onDelete(treatmentName);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">既存の診療種別</h3>
      <div className="space-y-2">
        {Object.entries(groupedTreatments).map(([mainCourse, treatments]) => {
          const hasSubCourses = treatments.some(t => t.isSubCourse);
          const mainCourseItem = treatments.find(t => !t.isSubCourse);
          const subCourses = treatments.filter(t => t.isSubCourse);
          const isExpanded = expandedCourses.has(mainCourse);

          return (
            <div key={mainCourse} className="border rounded-lg">
              <div className="p-4">
                {mainCourseItem ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasSubCourses && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCourse(mainCourse)}
                          className="p-0 h-auto"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <TreatmentItem
                        treatmentName={mainCourse}
                        maxReservations={mainCourseItem.max_reservations_per_slot}
                        details={getTreatmentDetails(mainCourseItem.treatment_name)}
                        onUpdate={(maxReservations) => onUpdate(mainCourseItem.treatment_name, maxReservations)}
                        onDelete={() => handleDelete(mainCourseItem.treatment_name)}
                        onMaxReservationsChange={(newValue) => onMaxReservationsChange(mainCourseItem.id, newValue)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {hasSubCourses && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCourse(mainCourse)}
                        className="p-0 h-auto"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <span className="font-medium">{mainCourse}</span>
                  </div>
                )}
              </div>

              {hasSubCourses && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <div className="border-t px-4 pb-4">
                      <SubCourseTable
                        subCourses={subCourses}
                        getTreatmentDetails={getTreatmentDetails}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMaxReservationsChange={onMaxReservationsChange}
                      />
                      <div className="mt-4 pl-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => {
                            // This would trigger the add form with pre-filled main course name
                            const newCourseName = prompt(`「${mainCourse}」の新しいサブコース名を入力してください：`);
                            if (newCourseName && newCourseName.trim()) {
                              onUpdate(`${mainCourse}:${newCourseName.trim()}`, 1);
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          新規作成
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
