import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export const AdminHeader = ({ title, showBackButton = false }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴエリア */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => navigate("/admin")}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-primary leading-tight">
                    SmartReserve
                  </span>
                  <span className="text-sm md:text-base font-medium text-gray-600 leading-tight">
                    管理システム
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ページタイトル（オプション） */}
          {title && (
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
            </div>
          )}

          {/* 戻るボタン（オプション） */}
          {showBackButton && (
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

