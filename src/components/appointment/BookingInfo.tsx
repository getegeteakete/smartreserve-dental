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
    <Card className="mb-8 bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-white/20 rounded-lg">
            <Info className="h-6 w-6" />
          </div>
          予約について
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* 予約期間 */}
        <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">予約期間</p>
            <p className="text-slate-600">予約は2週間先から6週間先まで可能です</p>
          </div>
        </div>

        {/* 診療時間 */}
        <div className="p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="h-5 w-5 text-emerald-700" />
            </div>
            <p className="font-semibold text-slate-800 text-lg">診療時間</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="font-medium text-slate-700">月曜日</span>
              <span className="text-orange-700 font-medium">午前中休診 / 15:00〜19:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-slate-700">火・水・金</span>
              <span className="text-green-700 font-medium">10:00〜13:30 / 15:00〜19:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-medium text-slate-700">土曜日</span>
              <span className="text-blue-700 font-medium">9:00〜12:30 / 14:00〜17:30</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="font-medium text-slate-700">日曜日</span>
              <span className="text-purple-700 font-medium">月一度日曜診療あり</span>
            </div>
          </div>
        </div>

        {/* 休診日 */}
        <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="h-5 w-5 text-red-700" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">休診日</p>
            <p className="text-slate-600">
              月曜午前・木・日・祝日（祝日がある週の木曜日は診療）
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Timer className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">キャンセルについて</p>
              <p className="text-slate-600">
                キャンセルは予約日の24時間前まで可能です
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm">
            <div className="p-2 bg-green-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">初診の方へ</p>
              <p className="text-slate-600">
                初診の方は10分早めにお越しください
              </p>
            </div>
          </div>
        </div>

        {/* 緊急時連絡 */}
        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-lg">
          <div className="p-3 bg-red-100 rounded-xl">
            <Phone className="h-6 w-6 text-red-700" />
          </div>
          <div>
            <p className="font-bold text-red-800 text-lg mb-2">緊急時について</p>
            <p className="text-red-700">
              急な痛みなどの緊急時は直接お電話ください：
              <span className="font-bold text-red-800 text-lg ml-2">092-406-2119</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingInfo;
