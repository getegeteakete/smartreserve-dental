import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Mail, Eye, Send, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  const [isTesting, setIsTesting] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'patient' | 'admin'>('patient');
  const [diagnosisResults, setDiagnosisResults] = useState<{
    edgeFunction: { status: 'ok' | 'error' | 'checking'; message: string };
    resendApiKey: { status: 'ok' | 'error' | 'checking'; message: string };
    patientSettings: { status: 'ok' | 'error' | 'checking'; message: string };
    adminSettings: { status: 'ok' | 'error' | 'checking'; message: string };
  } | null>(null);
  const { toast } = useToast();

  // 患者様向けメール設定
  const [patientEmailSettings, setPatientEmailSettings] = useState({
    enabled: true,
    from_name: '六本松矯正歯科クリニックとよしま',
    from_email: 't@489.toyoshima-do.com',
    subject_template: '予約受付完了 - {patient_name}様の予約を受け付けました',
    content_template: '',
  });

  // 管理者向けメール設定
  const [adminEmailSettings, setAdminEmailSettings] = useState({
    enabled: true,
    from_name: '六本松矯正歯科クリニックとよしま予約システム',
    from_email: 't@489.toyoshima-do.com',
    to_email: 't@489.toyoshima-do.com',
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

      if (error) {
        // テーブルが存在しない場合や権限エラーの場合は空配列を設定して続行
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
          console.log('email_templatesテーブルが存在しないか、アクセス権限がありません。デフォルトテンプレートを使用します。');
          setTemplates([]);
        } else {
          throw error;
        }
      } else {
      setTemplates(data || []);
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      // エラーが発生しても空配列を設定して続行（デフォルトテンプレートを使用）
      setTemplates([]);
      // エラーメッセージは表示しない（テーブルが存在しない場合は正常な動作）
      if (error?.code !== 'PGRST116' && !error?.message?.includes('does not exist')) {
      toast({
          title: '警告',
          description: 'テンプレートの読み込みに失敗しました。デフォルトテンプレートを使用します。',
          variant: 'default',
      });
      }
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

      if (error) {
        // テーブルが存在しない場合や権限エラーの場合はデフォルトテンプレートを使用
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('permission denied') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.log('system_settingsテーブルから設定を読み込めませんでした。デフォルトテンプレートを使用します。');
          loadDefaultTemplate('patient');
          loadDefaultTemplate('admin');
          return;
        } else {
          // その他のエラーもログに記録するが、エラーメッセージは表示しない
          console.warn('system_settingsテーブルから設定を読み込む際にエラーが発生しました。デフォルトテンプレートを使用します。', error);
          loadDefaultTemplate('patient');
          loadDefaultTemplate('admin');
          return;
        }
      }

      // 設定値を一時的に保持
      let patientContent = '';
      let adminContent = '';

      // 設定値を反映
      if (data && data.length > 0) {
        data.forEach((setting) => {
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
              patientContent = value?.content || '';
              setPatientEmailSettings(prev => ({ ...prev, content_template: patientContent || prev.content_template }));
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
              adminContent = value?.content || '';
              setAdminEmailSettings(prev => ({ ...prev, content_template: adminContent || prev.content_template }));
            break;
        }
      });
      }

      // デフォルトテンプレートを読み込む（設定がない場合）
      if (!patientContent) {
        loadDefaultTemplate('patient');
      }
      if (!adminContent) {
        loadDefaultTemplate('admin');
      }
    } catch (error: any) {
      console.error('Error loading email settings:', error);
      // エラーが発生してもデフォルトテンプレートを読み込む（エラーメッセージは表示しない）
      loadDefaultTemplate('patient');
      loadDefaultTemplate('admin');
      // エラーメッセージは表示しない（テーブルが存在しない場合は正常な動作）
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
      <li>確定メールに記載された日時の10分前にご来院ください</li>
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

  const diagnoseEmailSettings = async () => {
    setIsDiagnosing(true);
    setDiagnosisResults({
      edgeFunction: { status: 'checking', message: '確認中...' },
      resendApiKey: { status: 'checking', message: '確認中...' },
      patientSettings: { status: 'checking', message: '確認中...' },
      adminSettings: { status: 'checking', message: '確認中...' },
    });

    const results = {
      edgeFunction: { status: 'checking' as const, message: '' },
      resendApiKey: { status: 'checking' as const, message: '' },
      patientSettings: { status: 'checking' as const, message: '' },
      adminSettings: { status: 'checking' as const, message: '' },
    };

    try {
      // 1. Edge Functionの確認
      try {
        const testResponse = await supabase.functions.invoke('send-appointment-email', {
          body: {
            patientName: '診断テスト',
            patientEmail: 'test@example.com',
            phone: '090-0000-0000',
            treatmentName: '診断テスト',
            fee: 0,
            preferredDates: [{ date: '2025-12-31', timeSlot: '10:00:00' }],
          }
        });

        if (testResponse.error) {
          if (testResponse.error.message?.includes('Function not found') || 
              testResponse.error.message?.includes('404')) {
            results.edgeFunction = {
              status: 'error',
              message: 'Edge Functionがデプロイされていません。EDGE_FUNCTION_DEPLOY_GUIDE.mdを参照してデプロイしてください。'
            };
          } else if (testResponse.error.message?.includes('RESEND_API_KEY')) {
            results.edgeFunction = {
              status: 'ok',
              message: 'Edge Functionはデプロイされています'
            };
            results.resendApiKey = {
              status: 'error',
              message: 'RESEND_API_KEYが設定されていません。Supabase Secretsに設定してください。'
            };
          } else {
            results.edgeFunction = {
              status: 'ok',
              message: 'Edge Functionはデプロイされています（エラー: ' + testResponse.error.message + '）'
            };
          }
        } else {
          results.edgeFunction = {
            status: 'ok',
            message: 'Edge Functionは正常にデプロイされています'
          };
        }
      } catch (error: any) {
        results.edgeFunction = {
          status: 'error',
          message: 'Edge Functionへの接続に失敗しました: ' + (error.message || '不明なエラー')
        };
      }

      // 2. RESEND_API_KEYの確認（Edge Functionのレスポンスから推測）
      if (results.edgeFunction.status === 'ok' && results.resendApiKey.status === 'checking') {
        results.resendApiKey = {
          status: 'ok',
          message: 'RESEND_API_KEYは設定されているようです（Edge Functionが正常に応答）'
        };
      }

      // 3. 患者様向けメール設定の確認
      if (!patientEmailSettings.enabled) {
        results.patientSettings = {
          status: 'error',
          message: '患者様向け自動返信メールが無効になっています'
        };
      } else if (!patientEmailSettings.from_email || !patientEmailSettings.from_email.includes('@')) {
        results.patientSettings = {
          status: 'error',
          message: '送信元メールアドレスが正しく設定されていません'
        };
      } else if (!patientEmailSettings.subject_template || !patientEmailSettings.content_template) {
        results.patientSettings = {
          status: 'error',
          message: '件名または本文テンプレートが設定されていません'
        };
      } else {
        results.patientSettings = {
          status: 'ok',
          message: '患者様向けメール設定は正常です'
        };
      }

      // 4. 管理者向けメール設定の確認
      if (!adminEmailSettings.enabled) {
        results.adminSettings = {
          status: 'error',
          message: '管理者向け通知メールが無効になっています'
        };
      } else if (!adminEmailSettings.from_email || !adminEmailSettings.from_email.includes('@')) {
        results.adminSettings = {
          status: 'error',
          message: '送信元メールアドレスが正しく設定されていません'
        };
      } else if (!adminEmailSettings.to_email || !adminEmailSettings.to_email.includes('@')) {
        results.adminSettings = {
          status: 'error',
          message: '送信先メールアドレスが正しく設定されていません'
        };
      } else if (!adminEmailSettings.subject_template || !adminEmailSettings.content_template) {
        results.adminSettings = {
          status: 'error',
          message: '件名または本文テンプレートが設定されていません'
        };
      } else {
        results.adminSettings = {
          status: 'ok',
          message: '管理者向けメール設定は正常です'
        };
      }

      setDiagnosisResults(results);
    } catch (error: any) {
      console.error('診断エラー:', error);
      toast({
        title: 'エラー',
        description: '診断中にエラーが発生しました: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const sendTestEmail = async (type: 'patient' | 'admin') => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        title: 'エラー',
        description: '有効なメールアドレスを入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      const settings = type === 'patient' ? patientEmailSettings : adminEmailSettings;
      
      // テスト用のデータを準備
      const testData = {
        patientName: 'テスト太郎',
        patientEmail: type === 'patient' ? testEmail : settings.to_email || testEmail,
        phone: '090-1234-5678',
        treatmentName: '初診相談',
        fee: 3000,
        preferredDates: [
          { date: '2025-12-31', timeSlot: '10:00:00' },
          { date: '2026-01-02', timeSlot: '14:00:00' }
        ],
        notes: 'これはテストメールです'
      };

      console.log('📧 テストメール送信開始:', testData);

      const { data, error } = await supabase.functions.invoke('send-appointment-email', {
        body: testData
      });

      if (error) {
        console.error('❌ テストメール送信エラー:', error);
        throw new Error(error.message || 'メール送信に失敗しました');
      }

      if (data?.success) {
        toast({
          title: 'テストメール送信成功',
          description: `${testEmail} にテストメールを送信しました。受信ボックスをご確認ください。`,
        });
      } else {
        throw new Error(data?.error || 'メール送信に失敗しました');
      }
    } catch (error: any) {
      console.error('テストメール送信エラー:', error);
      toast({
        title: 'エラー',
        description: error.message || 'テストメールの送信に失敗しました。Edge Functionがデプロイされているか確認してください。',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
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
      {/* メール設定診断カード */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                メール送信設定の診断
              </CardTitle>
              <CardDescription>
                現在のメール送信設定を確認し、問題点を特定します
              </CardDescription>
            </div>
            <Button
              onClick={diagnoseEmailSettings}
              disabled={isDiagnosing}
              variant="outline"
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  診断中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  診断を実行
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {diagnosisResults && (
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>診断結果</AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <div className="flex items-start gap-3">
                  {diagnosisResults.edgeFunction.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>Edge Function</strong>
                      <Badge variant={diagnosisResults.edgeFunction.status === 'ok' ? 'default' : 'destructive'}>
                        {diagnosisResults.edgeFunction.status === 'ok' ? 'OK' : 'エラー'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnosisResults.edgeFunction.message}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {diagnosisResults.resendApiKey.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>Resend APIキー</strong>
                      <Badge variant={diagnosisResults.resendApiKey.status === 'ok' ? 'default' : 'destructive'}>
                        {diagnosisResults.resendApiKey.status === 'ok' ? 'OK' : 'エラー'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnosisResults.resendApiKey.message}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {diagnosisResults.patientSettings.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>患者様向けメール設定</strong>
                      <Badge variant={diagnosisResults.patientSettings.status === 'ok' ? 'default' : 'destructive'}>
                        {diagnosisResults.patientSettings.status === 'ok' ? 'OK' : 'エラー'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnosisResults.patientSettings.message}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {diagnosisResults.adminSettings.status === 'ok' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>管理者向けメール設定</strong>
                      <Badge variant={diagnosisResults.adminSettings.status === 'ok' ? 'default' : 'destructive'}>
                        {diagnosisResults.adminSettings.status === 'ok' ? 'OK' : 'エラー'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diagnosisResults.adminSettings.message}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

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
                  <div className="flex gap-2">
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_email_patient">テスト送信用メールアドレス</Label>
                  <Input
                    id="test_email_patient"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <p className="text-xs text-gray-500">
                    テストメールを送信するメールアドレスを入力してください
                  </p>
                </div>
                <Button
                  onClick={() => sendTestEmail('patient')}
                  disabled={isTesting || !testEmail}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      テストメールを送信（患者様向け）
                    </>
                  )}
                </Button>
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
              </div>
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
                  <div className="flex gap-2">
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_email_admin">テスト送信用メールアドレス</Label>
                  <Input
                    id="test_email_admin"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <p className="text-xs text-gray-500">
                    テストメールを送信するメールアドレスを入力してください
                  </p>
                </div>
                <Button
                  onClick={() => sendTestEmail('admin')}
                  disabled={isTesting || !testEmail}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      テストメールを送信（管理者向け）
                    </>
                  )}
                </Button>
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

