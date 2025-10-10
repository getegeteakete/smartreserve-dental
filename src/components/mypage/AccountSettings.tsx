
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface AccountSettingsProps {
  userEmail?: string;
  onNavigateToProfile: () => void;
}

export function AccountSettings({ userEmail, onNavigateToProfile }: AccountSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          アカウント設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">メールアドレス</label>
            <p className="text-sm bg-gray-50 p-2 rounded">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={onNavigateToProfile} disabled>
            プロフィール編集（認証機能なし）
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
