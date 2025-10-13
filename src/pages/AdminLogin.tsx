
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

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

    try {
      // 入力値の検証
      if (!username || !password) {
        throw new Error("IDとパスワードを入力してください");
      }

      // 管理者認証（デモ用認証情報）
      if (username === "admin@toyoshima-ortho.com" && password === "admin123") {
        // ローカルストレージに管理者フラグを保存
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_username", username);
        
        toast({
          title: "ログイン成功",
          description: "管理画面にリダイレクトします",
        });
        
        // 管理画面の予約状況タブにリダイレクト
        navigate("/admin");
      } else {
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
