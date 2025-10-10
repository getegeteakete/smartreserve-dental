
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewBookingSectionProps {
  onNavigateToBooking: () => void;
}

export function NewBookingSection({ onNavigateToBooking }: NewBookingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          新規予約
        </CardTitle>
        <CardDescription>
          診療内容をお選びいただき、新しい予約を作成できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Plus className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">新しい予約を作成</p>
          <p className="text-gray-500 mb-4">診療内容を選択して予約を開始しましょう</p>
          <Button onClick={onNavigateToBooking} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            診療内容を選択
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
