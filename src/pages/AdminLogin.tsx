
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "@/utils/adminAuth";

// 開発環境用の追加認証情報（ドキュメントに記載されていたもの）
const DEV_ADMIN_CREDENTIALS = [
  { username: "sup@ei-life.co.jp", password: "aA793179aa" },
  { username: "sup@ei-life.co.jp", password: "aA-793179" },
  { username: "sup@ei-life.co.jp", password: "pass" },
  { username: "admin@smartreserve.com", password: "admin123" },
];

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("ログイン試行:", { username, password });
    console.log("期待される認証情報:", { ADMIN_USERNAME, ADMIN_PASSWORD });

    try {
      // 入力値の検証
      if (!username || !password) {
        throw new Error("IDとパスワードを入力してください");
      }

      console.log("入力値検証完了");

      // 管理者認証（環境変数またはデフォルト値）
      const isAuthenticated = 
        (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) ||
        DEV_ADMIN_CREDENTIALS.some(
          cred => cred.username === username && cred.password === password
        );

      if (isAuthenticated) {
        console.log("認証成功、ローカルストレージに保存");
        
        // ローカルストレージに管理者フラグを保存
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_username", username);
        
        console.log("ローカルストレージ保存完了:", {
          admin_logged_in: localStorage.getItem("admin_logged_in"),
          admin_username: localStorage.getItem("admin_username")
        });
        
        toast({
          title: "ログイン成功",
          description: "管理画面にリダイレクトします",
        });
        
        console.log("リダイレクト開始");
        
        // 少し待ってからリダイレクト
        setTimeout(() => {
          console.log("navigate実行");
          navigate("/admin", { replace: true });
        }, 1000);
      } else {
        console.log("認証失敗:", { 
          username, 
          password,
          expectedUsername: ADMIN_USERNAME,
          expectedPassword: ADMIN_PASSWORD ? "***" : "未設定"
        });
        throw new Error("IDまたはパスワードが正しくありません");
      }
    } catch (error: any) {
      console.error("管理者ログインエラー:", error);
      toast({
        variant: "destructive",
        title: "ログインエラー",
        description: error.message || "ログインに失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  // 開発環境かどうかを判定
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>管理者ログイン</CardTitle>
          <CardDescription>
            管理者IDとパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">管理者ID</Label>
              <Input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
          {isDevelopment && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
              <p className="font-semibold text-yellow-800 mb-2">開発環境用の認証情報:</p>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                <li>ID: <code className="bg-yellow-100 px-1 rounded">sup@ei-life.co.jp</code> / パスワード: <code className="bg-yellow-100 px-1 rounded">aA-793179</code></li>
                <li>ID: <code className="bg-yellow-100 px-1 rounded">sup@ei-life.co.jp</code> / パスワード: <code className="bg-yellow-100 px-1 rounded">pass</code></li>
                <li>ID: <code className="bg-yellow-100 px-1 rounded">admin@smartreserve.com</code> / パスワード: <code className="bg-yellow-100 px-1 rounded">admin123</code></li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={() => navigate("/")}>
          トップページに戻る
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
