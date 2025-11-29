import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Mail, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  content_template: string;
  template_type: string;
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'patient' | 'admin'>('patient');
  const { toast } = useToast();

  // 患者様向けメール設定
  const [patientEmailSettings, setPatientEmailSettings] = useState({
    enabled: true,
    from_name: '六本松矯正歯科クリニックとよしま',
    from_email: 'yoyaku@toyoshima-do.com',
    subject_template: '予約受付完了 - {patient_name}様の予約を受け付けました',
    content_template: '',
  });

  // 管理者向けメール設定
  const [adminEmailSettings, setAdminEmailSettings] = useState({
    enabled: true,
    from_name: '六本松矯正歯科クリニックとよしま予約システム',
    from_email: 'yoyaku@toyoshima-do.com',
    to_email: 'yoyaku@toyoshima-do.com',
    subject_template: '新規予約 - {patient_name}様からの予約申込み',
    content_template: '',
  });

  // 利用可能な変数
  const availableVariables = [
    { name: '{patient_name}', description: '患者様のお名前' },
    { name: '{patient_email}', description: '患者様のメールアドレス' },
    { name: '{phone}', description: '電話番号' },
    { name: '{treatment_name}', description: '診療内容' },
    { name: '{fee}', description: '料金' },
    { name: '{preferred_dates}', description: '希望日時一覧' },
    { name: '{notes}', description: 'ご要望・備考' },
    { name: '{clinic_name}', description: '医院名' },
    { name: '{clinic_phone}', description: '医院の電話番号' },
    { name: '{clinic_email}', description: '医院のメールアドレス' },
  ];

  useEffect(() => {
    loadTemplates();
    loadEmailSettings();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', 'appointment_confirmation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'エラー',
        description: 'テンプレートの読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailSettings = async () => {
    try {
      // システム設定からメール設定を読み込む
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', [
          'email_auto_reply_enabled',
          'email_patient_from_name',
          'email_patient_from_email',
          'email_patient_subject',
          'email_patient_content',
          'email_admin_enabled',
          'email_admin_from_name',
          'email_admin_from_email',
          'email_admin_to_email',
          'email_admin_subject',
          'email_admin_content',
        ]);

      if (error) throw error;

      // 設定値を反映
      data?.forEach((setting) => {
        const value = setting.setting_value;
        switch (setting.setting_key) {
          case 'email_auto_reply_enabled':
            setPatientEmailSettings(prev => ({ ...prev, enabled: value?.enabled !== false }));
            break;
          case 'email_patient_from_name':
            setPatientEmailSettings(prev => ({ ...prev, from_name: value?.from_name || prev.from_name }));
            break;
          case 'email_patient_from_email':
            setPatientEmailSettings(prev => ({ ...prev, from_email: value?.from_email || prev.from_email }));
            break;
          case 'email_patient_subject':
            setPatientEmailSettings(prev => ({ ...prev, subject_template: value?.subject || prev.subject_template }));
            break;
          case 'email_patient_content':
            setPatientEmailSettings(prev => ({ ...prev, content_template: value?.content || prev.content_template }));
            break;
          case 'email_admin_enabled':
            setAdminEmailSettings(prev => ({ ...prev, enabled: value?.enabled !== false }));
            break;
          case 'email_admin_from_name':
            setAdminEmailSettings(prev => ({ ...prev, from_name: value?.from_name || prev.from_name }));
            break;
          case 'email_admin_from_email':
            setAdminEmailSettings(prev => ({ ...prev, from_email: value?.from_email || prev.from_email }));
            break;
          case 'email_admin_to_email':
            setAdminEmailSettings(prev => ({ ...prev, to_email: value?.to_email || prev.to_email }));
            break;
          case 'email_admin_subject':
            setAdminEmailSettings(prev => ({ ...prev, subject_template: value?.subject || prev.subject_template }));
            break;
          case 'email_admin_content':
            setAdminEmailSettings(prev => ({ ...prev, content_template: value?.content || prev.content_template }));
            break;
        }
      });

      // デフォルトテンプレートを読み込む（設定がない場合）
      if (!patientEmailSettings.content_template) {
        loadDefaultTemplate('patient');
      }
      if (!adminEmailSettings.content_template) {
        loadDefaultTemplate('admin');
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
      // エラーが発生してもデフォルトテンプレートを読み込む
      loadDefaultTemplate('patient');
      loadDefaultTemplate('admin');
    }
  };

  const loadDefaultTemplate = (type: 'patient' | 'admin') => {
    if (type === 'patient') {
      const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3b82f6;">予約を受け付けました</h2>
  <p>{patient_name}様</p>
  <p>この度は当歯科クリニックをご利用いただき、誠にありがとうございます。</p>
  <p>以下の内容で予約を受け付けいたしました。</p>
  
  <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
    <h3 style="margin-top: 0; color: #1e40af;">予約内容</h3>
    <p><strong>お名前:</strong> {patient_name}様</p>
    <p><strong>電話番号:</strong> {phone}</p>
    <p><strong>メールアドレス:</strong> {patient_email}</p>
    <p><strong>診療内容:</strong> {treatment_name}</p>
    <p><strong>料金:</strong> ¥{fee}</p>
    {notes ? '<p><strong>ご要望・備考:</strong> {notes}</p>' : ''}
  </div>
  
  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #d97706;">ご希望日時</h4>
    {preferred_dates}
  </div>
  
  <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #059669;">今後の流れ</h4>
    <ol style="margin: 10px 0; padding-left: 20px;">
      <li>管理者がスケジュールを確認いたします</li>
      <li>予約が確定次第、確定メールをお送りいたします</li>
      <li>確定メールに記載された日時にご来院ください</li>
    </ol>
  </div>
  
  <p>ご不明な点がございましたら、お気軽にお電話にてお問い合わせください。</p>
  <p>スタッフ一同、{patient_name}様のご来院を心よりお待ちしております。</p>
  
  <hr style="margin: 30px 0;">
  <p style="color: #6b7280; font-size: 14px;">
    {clinic_name}<br>
    電話番号：{clinic_phone}
  </p>
</div>`;
      setPatientEmailSettings(prev => ({ ...prev, content_template: defaultTemplate }));
    } else {
      const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3b82f6;">新しい予約が入りました</h2>
  
  <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">予約詳細</h3>
    <p><strong>患者名:</strong> {patient_name}様</p>
    <p><strong>電話番号:</strong> {phone}</p>
    <p><strong>メールアドレス:</strong> {patient_email}</p>
    <p><strong>診療内容:</strong> {treatment_name}</p>
    <p><strong>料金:</strong> ¥{fee}</p>
    {notes ? '<p><strong>ご要望・備考:</strong> {notes}</p>' : ''}
    
    <h4 style="color: #1e40af;">希望日時</h4>
    {preferred_dates}
  </div>
  
  <p>スケジュールを確認し、予約を確定してください。</p>
  <p>確定後は患者様に確定メールを送信してください。</p>
</div>`;
      setAdminEmailSettings(prev => ({ ...prev, content_template: defaultTemplate }));
    }
  };

  const handleSave = async (type: 'patient' | 'admin') => {
    setIsSaving(true);
    try {
      const settings = type === 'patient' ? patientEmailSettings : adminEmailSettings;
      const prefix = type === 'patient' ? 'email_patient' : 'email_admin';

      // 各設定を保存
      const settingsToSave = [
        {
          setting_key: `${prefix}_enabled`,
          setting_value: { enabled: settings.enabled },
          description: `${type === 'patient' ? '患者様' : '管理者'}への自動返信メール送信を有効にする`,
          category: 'notification',
        },
        {
          setting_key: `${prefix}_from_name`,
          setting_value: { from_name: settings.from_name },
          description: `${type === 'patient' ? '患者様' : '管理者'}へのメール送信元名`,
          category: 'notification',
        },
        {
          setting_key: `${prefix}_from_email`,
          setting_value: { from_email: settings.from_email },
          description: `${type === 'patient' ? '患者様' : '管理者'}へのメール送信元アドレス`,
          category: 'notification',
        },
        {
          setting_key: `${prefix}_subject`,
          setting_value: { subject: settings.subject_template },
          description: `${type === 'patient' ? '患者様' : '管理者'}へのメール件名テンプレート`,
          category: 'notification',
        },
        {
          setting_key: `${prefix}_content`,
          setting_value: { content: settings.content_template },
          description: `${type === 'patient' ? '患者様' : '管理者'}へのメール本文テンプレート`,
          category: 'notification',
        },
      ];

      if (type === 'admin') {
        settingsToSave.push({
          setting_key: 'email_admin_to_email',
          setting_value: { to_email: adminEmailSettings.to_email },
          description: '管理者へのメール送信先アドレス',
          category: 'notification',
        });
      }

      // UPSERT処理
      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            description: setting.description,
            category: setting.category,
            is_enabled: true,
          }, {
            onConflict: 'setting_key',
          });

        if (error) throw error;
      }

      toast({
        title: '保存完了',
        description: `${type === 'patient' ? '患者様' : '管理者'}へのメール設定を保存しました`,
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'エラー',
        description: 'メール設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewEmail = (type: 'patient' | 'admin') => {
    const settings = type === 'patient' ? patientEmailSettings : adminEmailSettings;
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const html = settings.content_template
        .replace(/{patient_name}/g, '山田太郎')
        .replace(/{patient_email}/g, 'yamada@example.com')
        .replace(/{phone}/g, '090-1234-5678')
        .replace(/{treatment_name}/g, '初診相談')
        .replace(/{fee}/g, '3,000')
        .replace(/{preferred_dates}/g, '2025年1月15日（水）10:00<br>2025年1月16日（木）14:00')
        .replace(/{notes}/g, '初めての来院です')
        .replace(/{clinic_name}/g, '六本松矯正歯科クリニックとよしま')
        .replace(/{clinic_phone}/g, '092-406-2119')
        .replace(/{clinic_email}/g, '489@489.toyoshima-do.com');
      
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            予約時自動返信メール設定
          </CardTitle>
          <CardDescription>
            予約受付時に自動送信されるメールの設定を行います
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'patient' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">患者様向けメール</TabsTrigger>
              <TabsTrigger value="admin">管理者向けメール</TabsTrigger>
            </TabsList>

            {/* 患者様向けメール設定 */}
            <TabsContent value="patient" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">自動返信メールを送信する</Label>
                  <p className="text-sm text-gray-600 mt-1">予約受付時に患者様へ自動でメールを送信します</p>
                </div>
                <Switch
                  checked={patientEmailSettings.enabled}
                  onCheckedChange={(checked) =>
                    setPatientEmailSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_from_name">送信元名</Label>
                  <Input
                    id="patient_from_name"
                    value={patientEmailSettings.from_name}
                    onChange={(e) =>
                      setPatientEmailSettings(prev => ({ ...prev, from_name: e.target.value }))
                    }
                    placeholder="六本松矯正歯科クリニックとよしま"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient_from_email">送信元メールアドレス</Label>
                  <Input
                    id="patient_from_email"
                    type="email"
                    value={patientEmailSettings.from_email}
                    onChange={(e) =>
                      setPatientEmailSettings(prev => ({ ...prev, from_email: e.target.value }))
                    }
                    placeholder="489@489.toyoshima-do.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_subject">件名テンプレート</Label>
                <Input
                  id="patient_subject"
                  value={patientEmailSettings.subject_template}
                  onChange={(e) =>
                    setPatientEmailSettings(prev => ({ ...prev, subject_template: e.target.value }))
                  }
                  placeholder="予約受付完了 - {patient_name}様の予約を受け付けました"
                />
                <p className="text-xs text-gray-500">
                  使用可能な変数: {availableVariables.map(v => v.name).join(', ')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="patient_content">本文テンプレート（HTML対応）</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewEmail('patient')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    プレビュー
                  </Button>
                </div>
                <Textarea
                  id="patient_content"
                  value={patientEmailSettings.content_template}
                  onChange={(e) =>
                    setPatientEmailSettings(prev => ({ ...prev, content_template: e.target.value }))
                  }
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="HTML形式でメール本文を入力してください"
                />
                <p className="text-xs text-gray-500">
                  使用可能な変数: {availableVariables.map(v => v.name).join(', ')}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">利用可能な変数</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded">{variable.name}</code>
                      <span className="text-gray-600">{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSave('patient')}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    患者様向けメール設定を保存
                  </>
                )}
              </Button>
            </TabsContent>

            {/* 管理者向けメール設定 */}
            <TabsContent value="admin" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">管理者通知メールを送信する</Label>
                  <p className="text-sm text-gray-600 mt-1">予約受付時に管理者へ通知メールを送信します</p>
                </div>
                <Switch
                  checked={adminEmailSettings.enabled}
                  onCheckedChange={(checked) =>
                    setAdminEmailSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_from_name">送信元名</Label>
                  <Input
                    id="admin_from_name"
                    value={adminEmailSettings.from_name}
                    onChange={(e) =>
                      setAdminEmailSettings(prev => ({ ...prev, from_name: e.target.value }))
                    }
                    placeholder="六本松矯正歯科クリニックとよしま予約システム"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_from_email">送信元メールアドレス</Label>
                  <Input
                    id="admin_from_email"
                    type="email"
                    value={adminEmailSettings.from_email}
                    onChange={(e) =>
                      setAdminEmailSettings(prev => ({ ...prev, from_email: e.target.value }))
                    }
                    placeholder="489@489.toyoshima-do.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_to_email">送信先メールアドレス</Label>
                <Input
                  id="admin_to_email"
                  type="email"
                  value={adminEmailSettings.to_email}
                  onChange={(e) =>
                    setAdminEmailSettings(prev => ({ ...prev, to_email: e.target.value }))
                  }
                  placeholder="489@489.toyoshima-do.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_subject">件名テンプレート</Label>
                <Input
                  id="admin_subject"
                  value={adminEmailSettings.subject_template}
                  onChange={(e) =>
                    setAdminEmailSettings(prev => ({ ...prev, subject_template: e.target.value }))
                  }
                  placeholder="新規予約 - {patient_name}様からの予約申込み"
                />
                <p className="text-xs text-gray-500">
                  使用可能な変数: {availableVariables.map(v => v.name).join(', ')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin_content">本文テンプレート（HTML対応）</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewEmail('admin')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    プレビュー
                  </Button>
                </div>
                <Textarea
                  id="admin_content"
                  value={adminEmailSettings.content_template}
                  onChange={(e) =>
                    setAdminEmailSettings(prev => ({ ...prev, content_template: e.target.value }))
                  }
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="HTML形式でメール本文を入力してください"
                />
                <p className="text-xs text-gray-500">
                  使用可能な変数: {availableVariables.map(v => v.name).join(', ')}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">利用可能な変数</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded">{variable.name}</code>
                      <span className="text-gray-600">{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSave('admin')}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    管理者向けメール設定を保存
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

