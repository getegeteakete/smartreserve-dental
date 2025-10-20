import { 
  Calendar, 
  Clock, 
  Phone, 
  XCircle, 
  AlertCircle, 
  Timer,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BookingInfo = () => {
  return (
    <Card className="mb-8 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          予約について
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 予約期間 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800">予約期間</p>
            <p className="text-sm text-gray-600">予約は2週間先から6週間先まで可能です</p>
          </div>
        </div>

        {/* 診療時間 */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-gray-800 mb-2">診療時間</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>月曜日：</span>
                <span className="text-orange-600">午前中休診 / 15:00〜19:00</span>
              </div>
              <div className="flex justify-between">
                <span>火・水・金：</span>
                <span className="text-green-600">10:00〜13:30 / 15:00〜19:00</span>
              </div>
              <div className="flex justify-between">
                <span>土曜日：</span>
                <span className="text-blue-600">9:00〜12:30 / 14:00〜17:30</span>
              </div>
              <div className="flex justify-between">
                <span>日曜日：</span>
                <span className="text-purple-600">月一度日曜診療あり</span>
              </div>
            </div>
          </div>
        </div>

        {/* 休診日 */}
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800">休診日</p>
            <p className="text-sm text-gray-600">
              月曜午前・木・日・祝日（祝日がある週の木曜日は診療）
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-3">
            <Timer className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">キャンセルについて</p>
              <p className="text-sm text-gray-600">
                キャンセルは予約日の24時間前まで可能です
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">初診の方へ</p>
              <p className="text-sm text-gray-600">
                初診の方は10分早めにお越しください
              </p>
            </div>
          </div>
        </div>

        {/* 緊急時連絡 */}
        <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-200">
          <Phone className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">緊急時について</p>
            <p className="text-sm text-red-700">
              急な痛みなどの緊急時は直接お電話ください：<span className="font-medium">092-406-2119</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingInfo;
