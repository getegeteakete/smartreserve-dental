import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContentHeader } from "@/components/admin/AdminContentHeader";
import { ChatHistoryManager } from "@/components/admin/ChatHistoryManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function AdminChatHistory() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 管理者認証チェック
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
      const adminUsername = localStorage.getItem("admin_username");
      
      console.log("管理者認証チェック:", { isAdminLoggedIn, adminUsername });
      
      if (isAdminLoggedIn !== "true" || adminUsername !== "sup@ei-life.co.jp") {
        console.log("管理者認証が必要です");
        navigate("/admin-login");
        return;
      }
      
      console.log("管理者認証済み");
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <AdminContentHeader 
          title="チャット履歴管理" 
          subtitle="ユーザーからの問い合わせと返信履歴" 
        />
        
        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <ChatHistoryManager />
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  );
}
