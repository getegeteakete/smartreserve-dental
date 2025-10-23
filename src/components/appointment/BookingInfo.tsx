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
    <Card className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white font-semibold">
          <Info className="h-5 w-5" />
          予約について
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* 予約期間 */}
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="p-2 bg-blue-100 rounded-full">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">予約期間</p>
            <p className="text-sm text-slate-600">予約は2週間先から6週間先まで可能です</p>
          </div>
        </div>

        {/* 診療時間 */}
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="p-2 bg-green-100 rounded-full">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 mb-3">診療時間</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">月曜日：</span>
                <span className="text-orange-600 font-medium">午前中休診 / 15:00〜19:00</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">火・水・金：</span>
                <span className="text-green-600 font-medium">10:00〜13:30 / 15:00〜19:00</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">土曜日：</span>
                <span className="text-blue-600 font-medium">9:00〜12:30 / 14:00〜17:30</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">日曜日：</span>
                <span className="text-purple-600 font-medium">月一度日曜診療あり</span>
              </div>
            </div>
          </div>
        </div>

        {/* 休診日 */}
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">休診日</p>
            <p className="text-sm text-slate-600">
              月曜午前・木・日・祝日（祝日がある週の木曜日は診療）
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="p-2 bg-orange-100 rounded-full">
              <Timer className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">キャンセルについて</p>
              <p className="text-sm text-slate-600">
                キャンセルは予約日の24時間前まで可能です
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="p-2 bg-emerald-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">初診の方へ</p>
              <p className="text-sm text-slate-600">
                初診の方は10分早めにお越しください
              </p>
            </div>
          </div>
        </div>

        {/* 緊急時連絡 */}
        <div className="flex items-start gap-4 bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200 shadow-sm">
          <div className="p-2 bg-red-100 rounded-full">
            <Phone className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800 mb-1">緊急時について</p>
            <p className="text-sm text-red-700">
              急な痛みなどの緊急時は直接お電話ください：<span className="font-bold text-lg">092-406-2119</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingInfo;
