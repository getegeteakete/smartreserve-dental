import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Save, Trash2, Mail, MessageSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReminderSetting {
  id: string;
  name: string;
  enabled: boolean;
  reminder_type: 'email' | 'sms' | 'both';
  days_before: number;
  time_of_day: string;
  message_template: string;
  created_at: string;
  updated_at: string;
}

export const ReminderSettingsManager = () => {
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    enabled: true,
    reminder_type: 'both' as 'email' | 'sms' | 'both',
    days_before: 1,
    time_of_day: '10:00:00',
    message_template: 'こんにちは {name} 様。{date} {time} にご予約があります。お気をつけてお越しください。',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .order('days_before', { ascending: true });

      if (error) {
        // テーブルが存在しない場合や権限エラーの場合は空配列を設定して続行
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('permission denied') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.log('reminder_settingsテーブルが存在しないか、アクセス権限がありません。空の設定で続行します。');
          setSettings([]);
        } else {
          throw error;
        }
      } else {
        setSettings(data || []);
      }
    } catch (error: any) {
      console.error('Error loading reminder settings:', error);
      // エラーが発生しても空配列を設定して続行
      setSettings([]);
      // テーブルが存在しない場合はエラーメッセージを表示しない
      if (error?.code !== 'PGRST116' && !error?.message?.includes('does not exist') && !error?.message?.includes('relation') && !error?.message?.includes('table')) {
        toast({
          title: 'エラー',
          description: 'リマインダー設定の読み込みに失敗しました',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.message_template) {
      toast({
        title: 'エラー',
        description: '名前とメッセージテンプレートは必須です',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // 更新
        const { error } = await supabase
          .from('reminder_settings')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: '更新完了',
          description: 'リマインダー設定を更新しました',
        });
      } else {
        // 新規作成
        const { error } = await supabase
          .from('reminder_settings')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: '作成完了',
          description: 'リマインダー設定を作成しました',
        });
      }

      resetForm();
      loadSettings();
    } catch (error) {
      console.error('Error saving reminder setting:', error);
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (setting: ReminderSetting) => {
    setFormData({
      name: setting.name,
      enabled: setting.enabled,
      reminder_type: setting.reminder_type,
      days_before: setting.days_before,
      time_of_day: setting.time_of_day,
      message_template: setting.message_template,
    });
    setEditingId(setting.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('reminder_settings')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      toast({
        title: '削除完了',
        description: 'リマインダー設定を削除しました',
      });
      loadSettings();
    } catch (error) {
      console.error('Error deleting reminder setting:', error);
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      enabled: true,
      reminder_type: 'both',
      days_before: 1,
      time_of_day: '10:00:00',
      message_template: 'こんにちは {name} 様。{date} {time} にご予約があります。お気をつけてお越しください。',
    });
    setEditingId(null);
  };

  const getReminderTypeIcon = (type: string) => {
    if (type === 'email') return <Mail className="h-4 w-4" />;
    if (type === 'sms') return <MessageSquare className="h-4 w-4" />;
    return (
      <>
        <Mail className="h-4 w-4" />
        <MessageSquare className="h-4 w-4" />
      </>
    );
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
          <CardTitle>{editingId ? '設定を編集' : '新しいリマインダー設定'}</CardTitle>
          <CardDescription>
            予約日の何日前に、どのような通知を送るか設定できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">設定名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 1日前リマインダー"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days_before">何日前に送信</Label>
              <Input
                id="days_before"
                type="number"
                min="0"
                value={formData.days_before}
                onChange={(e) => setFormData({ ...formData, days_before: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_of_day">送信時刻</Label>
              <Input
                id="time_of_day"
                type="time"
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value + ':00' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_type">通知方法</Label>
              <Select
                value={formData.reminder_type}
                onValueChange={(value: 'email' | 'sms' | 'both') =>
                  setFormData({ ...formData, reminder_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">メールのみ</SelectItem>
                  <SelectItem value="sms">SMSのみ</SelectItem>
                  <SelectItem value="both">メール＆SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message_template">メッセージテンプレート</Label>
            <Textarea
              id="message_template"
              value={formData.message_template}
              onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
              rows={4}
              placeholder="使用可能な変数: {name}, {date}, {time}, {treatment}"
            />
            <p className="text-xs text-gray-500">
              変数: {'{name}'} = 患者名, {'{date}'} = 予約日, {'{time}'} = 予約時間, {'{treatment}'} = 治療名
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
            <Label htmlFor="enabled">この設定を有効にする</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? '更新' : '作成'}
                </>
              )}
            </Button>
            {editingId && (
              <Button onClick={resetForm} variant="outline">
                キャンセル
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>登録済みリマインダー設定</CardTitle>
          <CardDescription>
            設定の有効/無効を切り替えたり、編集・削除ができます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              リマインダー設定がまだ登録されていません
            </p>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{setting.name}</h4>
                      <div className="flex gap-1">{getReminderTypeIcon(setting.reminder_type)}</div>
                      {setting.enabled ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          有効
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          無効
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {setting.days_before}日前 • {setting.time_of_day.substring(0, 5)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(setting)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(setting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リマインダー設定を削除</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。本当に削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};



