
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface EmptyAppointmentsStateProps {
  onNavigateToBooking: () => void;
}

export function EmptyAppointmentsState({ onNavigateToBooking }: EmptyAppointmentsStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          予約一覧
        </CardTitle>
        <CardDescription>まだ予約はありません</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">予約がありません</p>
          <p className="text-gray-500 mb-4">新しい予約を作成しましょう</p>
          <Button onClick={onNavigateToBooking}>
            予約する
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
