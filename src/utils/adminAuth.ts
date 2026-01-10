// 管理者認証用のユーティリティ

// 環境変数から認証情報を取得（デフォルト値あり）
export const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "sup@ei-life.co.jp";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aA793179aa";

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
  try {
    const isAdminLoggedIn = localStorage.getItem("admin_logged_in");
    const adminUsername = localStorage.getItem("admin_username");
    
    // 厳密なチェック：両方の値が存在し、値が正しい形式であることを確認
    if (isAdminLoggedIn !== "true" || !adminUsername || typeof adminUsername !== 'string' || adminUsername.trim() === '') {
      console.log("認証チェック失敗: localStorageの値が無効", { isAdminLoggedIn, adminUsername });
      return false;
    }
    
    // 許可されたユーザー名リストに含まれているかチェック
    const isValid = ALLOWED_ADMIN_USERNAMES.includes(adminUsername);
    if (!isValid) {
      console.log("認証チェック失敗: 許可されていないユーザー名", { adminUsername, allowedUsers: ALLOWED_ADMIN_USERNAMES });
      // 無効なユーザー名の場合はlocalStorageをクリア
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_username");
    }
    
    return isValid;
  } catch (error) {
    console.error("認証チェックエラー:", error);
    // エラーが発生した場合は安全のためfalseを返す
    return false;
  }
};

/**
 * 管理者認証をチェックし、ログインしていない場合はログインページにリダイレクト
 * @param navigate ナビゲーション関数
 * @returns ログインしている場合はtrue、そうでない場合はfalse
 */
export const checkAdminAuth = (navigate: (path: string) => void): boolean => {
  try {
    const isLoggedIn = isAdminLoggedIn();
    
    if (!isLoggedIn) {
      console.log("管理者認証が必要です - ログインページにリダイレクト");
      // localStorageをクリアしてからリダイレクト
      localStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_username");
      navigate("/admin-login", { replace: true });
      return false;
    }
    
    console.log("管理者認証済み");
    return true;
  } catch (error) {
    console.error("認証チェックエラー:", error);
    // エラーが発生した場合は安全のためログインページにリダイレクト
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    navigate("/admin-login", { replace: true });
    return false;
  }
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




