
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const AdminScheduleHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login");
  };

  return (
    <div className="pt-20 bg-white border-b">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">スケジュール設定</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                管理画面に戻る
              </Button>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
};
