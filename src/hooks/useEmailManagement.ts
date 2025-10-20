import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReceivedEmail {
  id: string;
  appointment_id?: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  content: string;
  email_type: 'appointment_request' | 'appointment_inquiry' | 'general_inquiry' | 'cancellation_request' | 'modification_request';
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ai_suggested_response?: string;
  ai_extracted_intent?: string;
  ai_extracted_data?: any;
  staff_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  // 関連するappointment情報
  appointment?: {
    patient_name: string;
    treatment_name: string;
    appointment_date: string;
    confirmed_time_slot?: string;
  };
}

export interface SentEmail {
  id: string;
  appointment_id?: string;
  received_email_id?: string;
  to_email: string;
  to_name?: string;
  from_email: string;
  from_name: string;
  subject: string;
  content: string;
  email_type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_reply' | 'general_reply' | 'cancellation_confirmation';
  template_used?: string;
  ai_generated: boolean;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
  created_at: string;
}

export interface EmailTemplate {
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

interface EmailStats {
  total_unread: number;
  total_received_today: number;
  total_replied_today: number;
}

export const useEmailManagement = () => {
  const [emails, setEmails] = useState<ReceivedEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total_unread: 0, total_received_today: 0, total_replied_today: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 受信メール一覧を取得
  const fetchEmails = async (filters?: {
    status?: string;
    email_type?: string;
    search?: string;
    priority?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('received_emails')
        .select(`
          *,
          appointment:appointments(patient_name, treatment_name, appointment_date, confirmed_time_slot)
        `)
        .order('created_at', { ascending: false });

      // フィルター適用
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.email_type) {
        query = query.eq('email_type', filters.email_type);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.search) {
        // 日本語フルテキスト検索
        query = query.or(`subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%,from_email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: 'エラー',
        description: 'メール一覧の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // AI提案レスポンスを生成
  const generateAIResponse = async (emailId: string, emailContent: string, emailSubject: string) => {
    try {
      // AI API呼び出し（実際の実装では適切なAIサービスを使用）
      const response = await fetch('/api/generate-email-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId,
          emailContent,
          emailSubject,
        }),
      });

      if (!response.ok) {
        throw new Error('AI response generation failed');
      }

      const data = await response.json();
      
      // データベースを更新
      const { error } = await supabase
        .from('received_emails')
        .update({
          ai_suggested_response: data.suggestedResponse,
          ai_extracted_intent: data.extractedIntent,
          ai_extracted_data: data.extractedData,
        })
        .eq('id', emailId);

      if (error) throw error;

      // ローカル状態も更新
      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === emailId
            ? {
                ...email,
                ai_suggested_response: data.suggestedResponse,
                ai_extracted_intent: data.extractedIntent,
                ai_extracted_data: data.extractedData,
              }
            : email
        )
      );

      return data;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // AI APIが利用できない場合のフォールバック
      const fallbackResponse = generateFallbackResponse(emailContent, emailSubject);
      
      const { error: dbError } = await supabase
        .from('received_emails')
        .update({
          ai_suggested_response: fallbackResponse,
          ai_extracted_intent: 'general_inquiry',
        })
        .eq('id', emailId);

      if (dbError) throw dbError;

      return {
        suggestedResponse: fallbackResponse,
        extractedIntent: 'general_inquiry',
        extractedData: {},
      };
    }
  };

  // フォールバック用のレスポンス生成
  const generateFallbackResponse = (content: string, subject: string): string => {
    // シンプルなキーワードベースのレスポンス生成
    const lowerContent = content.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    if (lowerContent.includes('キャンセル') || lowerSubject.includes('キャンセル')) {
      return `いつもお世話になっております。

キャンセルについてご連絡いただき、ありがとうございます。
日程のご変更については、お電話にていただければ迅速に対応させていただきます。

ご不明な点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`;
    }

    if (lowerContent.includes('変更') || lowerContent.includes('都合') || lowerSubject.includes('変更')) {
      return `いつもお世話になっております。

日程変更についてご連絡いただき、ありがとうございます。
可能な限りご希望に沿えるよう対応させていただきますので、お電話にてご相談ください。

ご不明な点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`;
    }

    // デフォルトレスポンス
    return `いつもお世話になっております。

お問い合わせいただき、ありがとうございます。
内容を確認いたしましたが、詳細についてお電話にてお話しさせていただければと思います。

ご不明な点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`;
  };

  // メール返信を送信
  const sendEmailReply = async (emailId: string, replyContent: string, replySubject?: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) throw new Error('Email not found');

      // 送信済みメール記録を作成
      const { data: sentEmail, error: insertError } = await supabase
        .from('sent_emails')
        .insert({
          received_email_id: emailId,
          appointment_id: email.appointment_id,
          to_email: email.from_email,
          to_name: email.from_name,
          from_email: email.to_email,
          from_name: '六本松矯正歯科クリニックとよしま',
          subject: replySubject || `Re: ${email.subject}`,
          content: replyContent,
          email_type: 'appointment_reply',
          ai_generated: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 元のメールのステータスを更新
      const { error: updateError } = await supabase
        .from('received_emails')
        .update({ status: 'replied' })
        .eq('id', emailId);

      if (updateError) throw updateError;

      // ローカル状態を更新
      setEmails(prevEmails =>
        prevEmails.map(e =>
          e.id === emailId ? { ...e, status: 'replied' } : e
        )
      );
      setSentEmails(prev => [sentEmail, ...prev]);

      toast({
        title: '送信完了',
        description: '返信メールを送信しました',
      });

      return sentEmail;
    } catch (error) {
      console.error('Error sending email reply:', error);
      toast({
        title: 'エラー',
        description: '返信メールの送信に失敗しました',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // メールステータス更新
  const updateEmailStatus = async (emailId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('received_emails')
        .update({ status })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prevEmails =>
        prevEmails.map(email =>
          email.id === emailId ? { ...email, status } : email
        )
      );
    } catch (error) {
      console.error('Error updating email status:', error);
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  // メールテンプレート取得
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // 統計情報取得
  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [unreadResult, todayReceivedResult, todayRepliedResult] = await Promise.all([
        supabase
          .from('received_emails')
          .select('id', { count: 'exact' })
          .eq('status', 'unread'),
        
        supabase
          .from('received_emails')
          .select('id', { count: 'exact' })
          .gte('created_at', today),
        
        supabase
          .from('sent_emails')
          .select('id', { count: 'exact' })
          .gte('sent_at', today)
          .eq('email_type', 'appointment_reply')
      ]);

      setStats({
        total_unread: unreadResult.count || 0,
        total_received_today: todayReceivedResult.count || 0,
        total_replied_today: todayRepliedResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchTemplates();
    fetchStats();
  }, []);

  return {
    emails,
    sentEmails,
    templates,
    stats,
    loading,
    fetchEmails,
    generateAIResponse,
    sendEmailReply,
    updateEmailStatus,
    fetchTemplates,
    fetchStats,
  };
};
