import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  User, 
  Bot, 
  Calendar,
  Clock,
  Loader2,
  X,
  Mic,
  MicOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DentalReceptionistAvatar } from './DentalReceptionistAvatar';
import { searchTreatmentCourse, TreatmentCourse } from '@/utils/treatmentCourseData';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: 'booking' | 'consultation' | 'staff_connection' | 'phone_call' | 'general';
    extractedData?: any;
    actions?: Array<{
      type: 'booking' | 'phone' | 'staff_chat' | 'schedule_view';
      label: string;
      data?: any;
    }>;
    bookingState?: 'collecting_dates' | 'collecting_patient_info' | 'confirming_booking' | 'booking_complete';
  };
}

interface BookingData {
  dates: Array<{
    date?: { year: number; month: number; day: number };
    time?: string;
    confirmed?: boolean;
  }>;
  patientInfo: {
    name?: string;
    phone?: string;
    email?: string;
    age?: string;
    notes?: string;
  };
  treatment?: string;
  status: 'collecting_dates' | 'collecting_patient_info' | 'confirming_booking' | 'booking_complete';
}

interface AIChatBotProps {
  onBookingRequest?: (data: any) => void;
  onStaffConnection?: () => void;
  onPhoneCall?: () => void;
  className?: string;
}

export const AIChatBot = ({ 
  onBookingRequest, 
  onStaffConnection, 
  onPhoneCall,
  className = "" 
}: AIChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'こんにちは！😊\n\nSmartReserve予約システムのAIアシスタント、受付スタッフの「さくら」です。\n\n以下のことができます：\n• 📅 予約の作成・変更・キャンセル\n• 🦷 治療内容の相談\n• 👥 スタッフとの接続\n• 📞 お電話の転送\n• 🎤 音声入力での予約\n\n何でもお気軽にお尋ねください！',
      timestamp: new Date(),
      metadata: {
        intent: 'general',
        actions: [
          { type: 'booking', label: '予約を取る', data: { action: 'new_booking' } },
          { type: 'schedule_view', label: '空き時間を確認', data: { action: 'view_schedule' } },
          { type: 'staff_chat', label: 'スタッフと話す', data: { action: 'staff_connection' } },
          { type: 'phone', label: '電話したい', data: { action: 'phone_call' } }
        ]
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    dates: [{}, {}, {}],
    patientInfo: {},
    status: 'collecting_dates'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 音声認識の初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ja-JP';

        recognition.onstart = () => {
          setIsListening(true);
          toast({
            title: '音声入力開始',
            description: 'マイクに向かって話してください'
          });
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          toast({
            title: '音声認識完了',
            description: `認識結果: ${transcript}`
          });
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          let errorMessage = '音声認識エラーが発生しました';
          if (event.error === 'not-allowed') {
            errorMessage = 'マイクへのアクセスが許可されていません';
          } else if (event.error === 'no-speech') {
            errorMessage = '音声が検出されませんでした';
          }
          
          toast({
            title: 'エラー',
            description: errorMessage,
            variant: 'destructive'
          });
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API is not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // 音声入力の開始/停止
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: '非対応',
        description: 'お使いのブラウザは音声入力に対応していません',
        variant: 'destructive'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // AI応答のシミュレーション
  const processUserMessage = async (userMessage: string): Promise<Message> => {
    // 実際の実装では、ここでAI APIを呼び出します
    await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレーション用の遅延

    const lowerMessage = userMessage.toLowerCase();
    
    // 治療コースの検索
    const matchedCourses = searchTreatmentCourse(userMessage);
    
    // 意図の解析
    let intent: Message['metadata']['intent'] = 'general';
    let extractedData: any = {};
    let actions: Message['metadata']['actions'] = [];

    // 予約関連の解析
    if (lowerMessage.includes('予約') || lowerMessage.includes('取りたい') || lowerMessage.includes('時間')) {
      intent = 'booking';
      
      // 日付の抽出（簡易版）
      const dateMatch = userMessage.match(/(\d{1,2})月(\d{1,2})日/);
      const timeMatch = userMessage.match(/(\d{1,2}):(\d{2})|(\d{1,2})時/);
      
      if (dateMatch) {
        extractedData.date = {
          month: parseInt(dateMatch[1]),
          day: parseInt(dateMatch[2])
        };
      }
      
      if (timeMatch) {
        extractedData.time = timeMatch[1] && timeMatch[2] 
          ? `${timeMatch[1]}:${timeMatch[2]}`
          : timeMatch[3] ? `${timeMatch[3]}:00` : null;
      }

      // 治療内容の抽出
      const treatments = ['虫歯', '定期検診', 'クリーニング', 'ホワイトニング', '矯正'];
      const foundTreatment = treatments.find(treatment => userMessage.includes(treatment));
      if (foundTreatment) {
        extractedData.treatment = foundTreatment;
      }

      actions = [
        { type: 'booking', label: '予約を確定する', data: extractedData },
        { type: 'schedule_view', label: '他の時間を確認', data: { action: 'view_schedule' } }
      ];
    }

    // 相談関連の解析
    if (lowerMessage.includes('相談') || lowerMessage.includes('痛い') || lowerMessage.includes('心配')) {
      intent = 'consultation';
      actions = [
        { type: 'staff_chat', label: 'スタッフに相談', data: { action: 'staff_connection' } },
        { type: 'phone', label: 'お電話で相談', data: { action: 'phone_call' } }
      ];
    }

    // スタッフ接続の解析
    if (lowerMessage.includes('スタッフ') || lowerMessage.includes('話したい') || lowerMessage.includes('人')) {
      intent = 'staff_connection';
      actions = [
        { type: 'staff_chat', label: 'チャットで接続', data: { action: 'staff_connection' } },
        { type: 'phone', label: 'お電話で接続', data: { action: 'phone_call' } }
      ];
    }

    // 電話の解析
    if (lowerMessage.includes('電話') || lowerMessage.includes('かけたい')) {
      intent = 'phone_call';
      actions = [
        { type: 'phone', label: '電話をかける', data: { action: 'phone_call' } }
      ];
    }

    // 治療コースの説明が見つかった場合
    if (matchedCourses.length > 0 && (lowerMessage.includes('とは') || lowerMessage.includes('について') || 
        lowerMessage.includes('説明') || lowerMessage.includes('教えて') || lowerMessage.includes('詳しく') ||
        lowerMessage.includes('何') || lowerMessage.includes('どんな') || lowerMessage.includes('コース'))) {
      const course = matchedCourses[0]; // 最も関連性の高いコースを使用
      
      const aiResponse = `${course.name}についてご説明します！😊\n\n【${course.category}】\n\n${course.description}\n\n` +
        `⏱️ 所要時間：${course.duration}\n` +
        `💰 料金：${course.price}\n\n` +
        `✨ 特徴：\n${course.features.map(f => `• ${f}`).join('\n')}\n\n` +
        `👥 こんな方におすすめ：\n${course.recommendedFor.map(r => `• ${r}`).join('\n')}\n\n` +
        `📋 治療の流れ：\n${course.flow.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n` +
        `このコースで予約されますか？`;
      
      actions = [
        { type: 'booking', label: `${course.name}を予約`, data: { treatment: course.name } },
        { type: 'schedule_view', label: '他のコースを見る', data: { action: 'view_schedule' } }
      ];
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        metadata: {
          intent: 'consultation',
          extractedData: { course },
          actions
        }
      };
    }
    
    // AI応答の生成
    let aiResponse = '';
    
    switch (intent) {
      case 'booking':
        aiResponse = '予約のお手伝いをさせていただきます！\n\n';
        if (extractedData.date) {
          aiResponse += `📅 ${extractedData.date.month}月${extractedData.date.day}日`;
        }
        if (extractedData.time) {
          aiResponse += ` 🕐 ${extractedData.time}`;
        }
        if (extractedData.treatment) {
          aiResponse += `\n🦷 ${extractedData.treatment}`;
        }
        aiResponse += '\n\nこちらの内容で予約を進めますか？';
        break;
        
      case 'consultation':
        if (matchedCourses.length > 0) {
          aiResponse = `以下の治療コースが見つかりました：\n\n`;
          matchedCourses.slice(0, 3).forEach((course, index) => {
            aiResponse += `${index + 1}. ${course.name}（${course.category}）\n   ${course.price} / ${course.duration}\n\n`;
          });
          aiResponse += 'どのコースについて詳しく知りたいですか？';
          actions = matchedCourses.slice(0, 3).map(course => ({
            type: 'booking' as const,
            label: course.name,
            data: { treatment: course.name }
          }));
        } else {
          aiResponse = 'お悩みをお聞かせください。\n\nスタッフが直接お答えいたします。どの方法がご希望ですか？';
        }
        break;
        
      case 'staff_connection':
        aiResponse = 'スタッフとの接続をご希望ですね。\n\nチャットまたはお電話でお繋ぎします。どちらがご希望ですか？';
        break;
        
      case 'phone_call':
        aiResponse = 'お電話でのお問い合わせですね。\n\nこちらからお電話をおかけしますか？';
        break;
        
      default:
        aiResponse = '申し訳ございませんが、もう少し詳しく教えていただけますか？\n\n以下のようなことをお手伝いできます：\n• 予約の作成・変更\n• 治療の相談\n• スタッフとの接続\n• お電話の転送';
        actions = [
          { type: 'booking', label: '予約を取る', data: { action: 'new_booking' } },
          { type: 'staff_chat', label: 'スタッフと話す', data: { action: 'staff_connection' } },
          { type: 'phone', label: '電話したい', data: { action: 'phone_call' } }
        ];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        intent,
        extractedData,
        actions
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await processUserMessage(inputValue);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'エラー',
        description: 'メッセージの処理中にエラーが発生しました',
        variant: 'destructive'
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: Message['metadata']['actions'][0]) => {
    switch (action.type) {
      case 'booking':
        if (action.data && onBookingRequest) {
          onBookingRequest(action.data);
          toast({
            title: '予約画面へ',
            description: '予約画面に移動します'
          });
        }
        break;
        
      case 'staff_chat':
        if (onStaffConnection) {
          onStaffConnection();
          toast({
            title: 'スタッフ接続',
            description: 'スタッフとのチャットを開始します'
          });
        }
        break;
        
      case 'phone':
        if (onPhoneCall) {
          onPhoneCall();
          toast({
            title: '電話接続',
            description: 'お電話をおかけします'
          });
        }
        break;
        
      case 'schedule_view':
        toast({
          title: 'スケジュール表示',
          description: '空き時間を表示します'
        });
        break;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* チャットボタン */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 ${className}`}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <Card className={`fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 overflow-hidden ${className}`}>
          {/* 背景アニメーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* 浮遊する歯のアイコン風パターン */}
              <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-blue-200 opacity-20 animate-float" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-32 right-16 w-6 h-6 rounded-full bg-purple-200 opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-24 left-20 w-10 h-10 rounded-full bg-pink-200 opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-48 left-32 w-7 h-7 rounded-full bg-blue-300 opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
              <div className="absolute bottom-40 right-12 w-9 h-9 rounded-full bg-purple-300 opacity-15 animate-float" style={{animationDelay: '0.5s'}}></div>
              
              {/* キラキラ効果 */}
              <div className="absolute top-20 right-24 text-yellow-300 opacity-40 animate-sparkle" style={{animationDelay: '0s'}}>✨</div>
              <div className="absolute bottom-32 left-16 text-yellow-300 opacity-40 animate-sparkle" style={{animationDelay: '1s'}}>✨</div>
              <div className="absolute top-64 right-8 text-blue-300 opacity-30 animate-sparkle" style={{animationDelay: '2s'}}>💫</div>
            </div>
          </div>
          
          {/* コンテンツ（背景の上） */}
          <div className="relative z-10 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/80 backdrop-blur-sm border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DentalReceptionistAvatar size={32} />
                <div>
                  <div className="font-semibold text-primary">AIアシスタント「さくら」</div>
                  <div className="text-xs text-gray-500 font-normal">いつでもお気軽にどうぞ</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* アバター表示 */}
                      {message.type === 'user' ? (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <DentalReceptionistAvatar size={32} />
                        </div>
                      )}
                      
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.type === 'ai'
                            ? 'bg-white/90 backdrop-blur-sm shadow-sm border border-blue-100'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                          
                          {/* アクションボタン */}
                          {message.metadata?.actions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.metadata.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActionClick(action)}
                                  className="text-xs h-6 px-2"
                                >
                                  {action.type === 'booking' && <Calendar className="h-3 w-3 mr-1" />}
                                  {action.type === 'phone' && <Phone className="h-3 w-3 mr-1" />}
                                  {action.type === 'staff_chat' && <MessageCircle className="h-3 w-3 mr-1" />}
                                  {action.type === 'schedule_view' && <Clock className="h-3 w-3 mr-1" />}
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <DentalReceptionistAvatar size={32} />
                      <div className="bg-white/90 backdrop-blur-sm shadow-sm border border-blue-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-gray-600">さくらが入力中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* 入力エリア */}
            <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "音声を認識中..." : "メッセージを入力..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping || isListening}
                  className={isListening ? "border-red-500 bg-red-50" : ""}
                />
                <Button
                  onClick={toggleVoiceInput}
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  disabled={isTyping}
                  className={isListening ? "animate-pulse" : ""}
                  title={isListening ? "音声入力を停止" : "音声入力を開始"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          </div>
        </Card>
      )}
    </>
  );
};
