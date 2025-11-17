// 管理者認証用のユーティリティ

// 環境変数から認証情報を取得（デフォルト値あり）
export const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "sup@ei-life.co.jp";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aA-793179";

// 許可された管理者ユーザー名のリスト
export const ALLOWED_ADMIN_USERNAMES = [
  "sup@ei-life.co.jp",
  "admin@smartreserve.com",
  ADMIN_USERNAME, // 環境変数で設定されたユーザー名も追加
].filter((value, index, self) => self.indexOf(value) === index); // 重複を除去

/**
 * 管理者がログインしているかチェック
 * @returns ログインしている場合はtrue、そうでない場合はfalse
 */
export const isAdminLoggedIn = (): boolean => {
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
  const adminUsername = localStorage.getItem("admin_username");
  
  if (isAdminLoggedIn !== "true" || !adminUsername) {
    return false;
  }
  
  // 許可されたユーザー名リストに含まれているかチェック
  return ALLOWED_ADMIN_USERNAMES.includes(adminUsername);
};

/**
 * 管理者認証をチェックし、ログインしていない場合はログインページにリダイレクト
 * @param navigate ナビゲーション関数
 * @returns ログインしている場合はtrue、そうでない場合はfalse
 */
export const checkAdminAuth = (navigate: (path: string) => void): boolean => {
  const isLoggedIn = isAdminLoggedIn();
  
  if (!isLoggedIn) {
    console.log("管理者認証が必要です");
    navigate("/admin-login");
    return false;
  }
  
  console.log("管理者認証済み");
  return true;
};

/**
 * 管理者のユーザー名を取得
 * @returns 管理者のユーザー名、ログインしていない場合はnull
 */
export const getAdminUsername = (): string | null => {
  if (!isAdminLoggedIn()) {
    return null;
  }
  return localStorage.getItem("admin_username");
};




