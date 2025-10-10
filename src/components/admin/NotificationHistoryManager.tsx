import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SmsLog {
  id: string;
  phone_number: string;
  message: string;
  purpose: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface SentReminder {
  id: string;
  reminder_type: string;
  sent_at: string;
  status: string;
  error_message: string | null;
  appointment_id: string;
}

export const NotificationHistoryManager = () => {
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [sentReminders, setSentReminders] = useState<SentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // SMS送信履歴を取得
      const { data: smsData, error: smsError } = await supabase
        .from('sms_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (smsError) throw smsError;
      setSmsLogs(smsData || []);

      // リマインダー送信履歴を取得
      const { data: reminderData, error: reminderError } = await supabase
        .from('sent_reminders')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (reminderError) throw reminderError;
      setSentReminders(reminderData || []);
    } catch (error) {
      console.error('Error loading notification history:', error);
      toast({
        title: 'エラー',
        description: '履歴の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestReminder = async () => {
    setIsSendingTest(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scheduled-reminders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('リマインダーの送信に失敗しました');
      }

      const result = await response.json();
      toast({
        title: 'リマインダー送信完了',
        description: `メール: ${result.emailsSent}件, SMS: ${result.smsSent}件`,
      });
      
      loadData();
    } catch (error) {
      console.error('Error sending test reminder:', error);
      toast({
        title: 'エラー',
        description: 'リマインダーの送信に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">送信成功</Badge>;
      case 'failed':
        return <Badge variant="destructive">送信失敗</Badge>;
      case 'pending':
        return <Badge variant="secondary">処理中</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>通知履歴</CardTitle>
              <CardDescription>
                送信されたメールとSMSの履歴を確認できます
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </Button>
              <Button 
                onClick={handleTestReminder} 
                disabled={isSendingTest}
                size="sm"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    今すぐリマインダー送信
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* リマインダー送信履歴 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              リマインダー送信履歴
            </h3>
            {sentReminders.length === 0 ? (
              <p className="text-center text-gray-500 py-4">履歴がありません</p>
            ) : (
              <div className="space-y-2">
                {sentReminders.slice(0, 20).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {reminder.reminder_type === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {reminder.reminder_type === 'email' ? 'メール' : 'SMS'}リマインダー
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(reminder.sent_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(reminder.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMS送信履歴 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS送信履歴
            </h3>
            {smsLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">履歴がありません</p>
            ) : (
              <div className="space-y-2">
                {smsLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{log.phone_number}</p>
                        <Badge variant="outline" className="text-xs">
                          {log.purpose}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {log.message.length > 50
                          ? log.message.substring(0, 50) + '...'
                          : log.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </p>
                      {log.error_message && (
                        <p className="text-xs text-red-600 mt-1">
                          エラー: {log.error_message}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



