
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BookingHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-20">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          診療内容選択に戻る
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        予約フォーム
      </h1>
    </div>
  );
};

export default BookingHeader;
