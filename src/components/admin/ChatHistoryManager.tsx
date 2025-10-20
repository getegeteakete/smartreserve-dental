import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages, ChatMessage, ChatSession } from '@/hooks/useChatMessages';
import { 
  MessageCircle, 
  User, 
  Bot, 
  Clock, 
  Mail, 
  Phone, 
  Send, 
  Eye, 
  CheckCircle,
  Calendar,
  Search
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export const ChatHistoryManager = () => {
  const {
    messages,
    sessions,
    loading,
    currentSessionId,
    fetchSessions,
    fetchMessages,
    addStaffResponse,
    markAsRead,
    markSessionResolved,
    setCurrentSessionId
  } = useChatMessages();

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [staffResponse, setStaffResponse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSessionSelect = async (session: ChatSession) => {
    setSelectedSession(session);
    await fetchMessages(session.session_id);
  };

  const handleSendStaffResponse = async (messageId: string) => {
    if (!staffResponse.trim()) return;

    try {
      await addStaffResponse(messageId, staffResponse);
      setStaffResponse('');
    } catch (error) {
      console.error('Error sending staff response:', error);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedSession) return;

    try {
      await markSessionResolved(selectedSession.session_id, staffNotes);
      setStaffNotes('');
      await fetchSessions();
    } catch (error) {
      console.error('Error marking session as resolved:', error);
    }
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'staff':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMessageTypeLabel = (messageType: string) => {
    switch (messageType) {
      case 'user':
        return 'ユーザー';
      case 'ai':
        return 'AI';
      case 'staff':
        return 'スタッフ';
      default:
        return 'システム';
    }
  };

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'ai':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">チャット履歴管理</h2>
          <p className="text-gray-600">ユーザーからの問い合わせと返信履歴を確認できます</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* セッション一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              チャットセッション
            </CardTitle>
            <div className="space-y-2">
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="メールアドレス、名前、セッションIDで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedSession?.id === session.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={session.resolved ? 'secondary' : 'default'}
                          className={session.resolved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                        >
                          {session.resolved ? '解決済み' : '未解決'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.message_count}件
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true, locale: ja })}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {session.user_name && (
                        <p className="font-medium text-sm">{session.user_name}</p>
                      )}
                      {session.user_email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          {session.user_email}
                        </div>
                      )}
                      {session.user_phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          {session.user_phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(session.first_message_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>チャット履歴がありません</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* メッセージ履歴 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              メッセージ履歴
              {selectedSession && (
                <Badge variant="outline">
                  {selectedSession.user_name || selectedSession.user_email || '匿名ユーザー'}
                </Badge>
              )}
            </CardTitle>
            {selectedSession && (
              <CardDescription>
                {selectedSession.user_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedSession.user_email}
                  </div>
                )}
                {selectedSession.user_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedSession.user_phone}
                  </div>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-4">
                {/* メッセージ一覧 */}
                <ScrollArea className="h-96 border rounded-lg p-4">
                  <div className="space-y-4">
                    {messages.map((message: ChatMessage) => (
                      <div key={message.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getMessageIcon(message.message_type)}
                            <Badge className={getMessageTypeColor(message.message_type)}>
                              {getMessageTypeLabel(message.message_type)}
                            </Badge>
                            {!message.is_read && message.message_type === 'user' && (
                              <Badge variant="destructive" className="text-xs">
                                未読
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </div>
                          {!message.is_read && message.message_type === 'user' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(message.id)}
                              className="ml-auto"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              既読にする
                            </Button>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* スタッフ返信 */}
                          {message.staff_response && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">スタッフ返信</span>
                              </div>
                              <p className="text-sm bg-purple-50 p-2 rounded whitespace-pre-wrap">
                                {message.staff_response}
                              </p>
                            </div>
                          )}

                          {/* スタッフ返信フォーム */}
                          {!message.staff_response && message.message_type === 'user' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Label htmlFor={`response-${message.id}`} className="text-sm font-medium">
                                スタッフ返信
                              </Label>
                              <div className="flex gap-2 mt-2">
                                <Textarea
                                  id={`response-${message.id}`}
                                  placeholder="返信内容を入力..."
                                  className="flex-1"
                                  value={staffResponse}
                                  onChange={(e) => setStaffResponse(e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSendStaffResponse(message.id)}
                                  disabled={!staffResponse.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* セッション操作 */}
                {!selectedSession.resolved && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-notes">スタッフメモ</Label>
                      <Textarea
                        id="staff-notes"
                        placeholder="セッションのメモを入力..."
                        value={staffNotes}
                        onChange={(e) => setStaffNotes(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleMarkAsResolved}
                      disabled={!staffNotes.trim()}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      解決済みとしてマーク
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>セッションを選択してメッセージ履歴を表示</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
