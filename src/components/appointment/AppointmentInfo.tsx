
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const AppointmentInfo = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">予約について</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• 予約は2週間先から6週間先まで可能です</li>
          <li>• 診療時間</li>
          <li className="ml-4">- 月曜日：午前中休診 / 15:00〜19:00</li>
          <li className="ml-4">- 火・水・金：10:00〜13:30 / 15:00〜19:00</li>
          <li className="ml-4">- 土曜日：9:00〜12:30 / 14:00〜17:30</li>
          <li className="ml-4">- 月一度日曜診療あり</li>
          <li>• 休診日：月曜午前・木・日・祝日（祝日がある週の木曜日は診療）</li>
          <li>• キャンセルは予約日の24時間前まで可能です</li>
          <li>• 初診の方は10分早めにお越しください</li>
          <li>• 急な痛みなどの緊急時は直接お電話ください</li>
        </ul>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-login')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <Shield className="h-4 w-4" />
            管理者用
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentInfo;
