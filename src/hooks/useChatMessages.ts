import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  message_type: 'user' | 'ai' | 'system' | 'staff';
  content: string;
  metadata?: any;
  is_read: boolean;
  staff_response?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  session_id: string;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  status: 'active' | 'closed' | 'transferred_to_staff';
  first_message_at: string;
  last_message_at: string;
  message_count: number;
  resolved: boolean;
  staff_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useChatMessages = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  // セッション一覧を取得
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 特定セッションのメッセージを取得
  const fetchMessages = async (sessionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // メッセージを保存
  const saveMessage = async (messageData: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // セッション情報も更新
      await updateSessionInfo(messageData.session_id, {
        user_email: messageData.user_email,
        user_name: messageData.user_name,
        last_message_at: new Date().toISOString()
      });

      if (currentSessionId === messageData.session_id) {
        setMessages(prev => [...prev, data]);
      }

      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  };

  // セッション情報を更新または作成
  const updateSessionInfo = async (sessionId: string, updateData: Partial<ChatSession>) => {
    try {
      // 既存セッションを確認
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        // 既存セッションを更新
        const { error } = await supabase
          .from('chat_sessions')
          .update(updateData)
          .eq('session_id', sessionId);

        if (error) throw error;
      } else {
        // 新しいセッションを作成
        const { error } = await supabase
          .from('chat_sessions')
          .insert([{
            session_id,
            ...updateData,
            message_count: 0
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating session info:', error);
    }
  };

  // 管理者返信を追加
  const addStaffResponse = async (messageId: string, staffResponse: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          staff_response: staffResponse,
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      // メッセージリストを更新
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, staff_response: staffResponse, is_read: true }
          : msg
      ));
    } catch (error) {
      console.error('Error adding staff response:', error);
      throw error;
    }
  };

  // メッセージを既読にする
  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // セッションを解決済みにする
  const markSessionResolved = async (sessionId: string, staffNotes?: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          resolved: true, 
          status: 'closed',
          staff_notes: staffNotes 
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      // セッション一覧を更新
      await fetchSessions();
    } catch (error) {
      console.error('Error marking session as resolved:', error);
    }
  };

  // セッションIDを生成（新規チャット時）
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId]);

  return {
    messages,
    sessions,
    loading,
    currentSessionId,
    fetchSessions,
    fetchMessages,
    saveMessage,
    addStaffResponse,
    markAsRead,
    markSessionResolved,
    generateSessionId,
    setCurrentSessionId
  };
};
