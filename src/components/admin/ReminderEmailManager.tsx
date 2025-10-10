
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Clock, CheckCircle } from "lucide-react";

export function ReminderEmailManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendReminderEmails = async (reminderType: 'day_before' | 'morning_of') => {
    setIsLoading(true);
    
    try {
      console.log(`リマインダーメール送信開始: ${reminderType}`);
      
      const { data, error } = await supabase.functions.invoke('send-reminder-emails', {
        body: { reminderType }
      });

      if (error) {
        console.error("リマインダーメール送信エラー:", error);
        throw error;
      }

      console.log("リマインダーメール送信結果:", data);

      toast({
        title: "リマインダーメール送信完了",
        description: data.message,
      });

    } catch (error: any) {
      console.error("リマインダーメール送信処理エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リマインダーメールの送信に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          リマインダーメール送信
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 自動送信状況表示 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">自動送信設定済み</h4>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>✓ 前日リマインダー：毎日18時に自動送信</p>
            <p>✓ 当日リマインダー：毎日8時に自動送信</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">前日リマインダー（手動送信）</h3>
            <p className="text-sm text-gray-600">
              明日予約の患者様に事前のお知らせメールを手動送信
            </p>
            <Button
              onClick={() => sendReminderEmails('day_before')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              前日リマインダー送信
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">当日リマインダー（手動送信）</h3>
            <p className="text-sm text-gray-600">
              本日予約の患者様に当日のお知らせメールを手動送信
            </p>
            <Button
              onClick={() => sendReminderEmails('morning_of')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              当日リマインダー送信
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">自動送信について</h4>
          <p className="text-sm text-blue-700">
            Supabaseのcron機能により、毎日18時と8時に自動実行されます。<br/>
            上記のボタンは、必要に応じて手動で追加送信する場合にご使用ください。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
