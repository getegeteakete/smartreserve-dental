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
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: 'booking' | 'consultation' | 'staff_connection' | 'phone_call' | 'general' | 'view_booking' | 'modify_booking' | 'cancel_booking';
    extractedData?: any;
    actions?: Array<{
      type: 'booking' | 'phone' | 'staff_chat' | 'schedule_view' | 'view_mypage' | 'modify_booking' | 'cancel_booking';
      label: string;
      data?: any;
    }>;
    bookingState?: 'collecting_dates' | 'collecting_patient_info' | 'confirming_booking' | 'booking_complete';
    appointments?: any[];
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
  onViewMyPage?: () => void;
  className?: string;
}

export const AIChatBot = ({ 
  onBookingRequest, 
  onStaffConnection, 
  onPhoneCall,
  onViewMyPage,
  className = "" 
}: AIChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'こんにちは！😊\n歯科衛生士の「さくら」です🦷\n\n私がお手伝いできることは...\n\n📅 予約の作成・変更・キャンセル\n🔍 予約内容の確認\n🦷 診療内容のご案内\n👩‍⚕️ 歯のお悩み相談\n📞 スタッフへの接続\n🎤 音声での予約も可能です\n\nどんなことでもお気軽にご相談くださいね💕',
      timestamp: new Date(),
      metadata: {
        intent: 'general',
        actions: [
          { type: 'booking', label: '予約する📅', data: { action: 'new_booking' } },
          { type: 'view_mypage', label: '予約確認📋', data: { action: 'view_mypage' } },
          { type: 'schedule_view', label: '診療内容🦷', data: { action: 'view_schedule' } },
          { type: 'staff_chat', label: '相談する💬', data: { action: 'staff_connection' } }
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
    
    // 診療内容の検索
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
    
    // 予約確認の解析
    if (lowerMessage.includes('予約') && (lowerMessage.includes('確認') || lowerMessage.includes('見たい') || lowerMessage.includes('見る') || lowerMessage.includes('チェック'))) {
      intent = 'view_booking';
      
      // メールアドレスや電話番号の抽出
      const emailMatch = userMessage.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = userMessage.match(/\d{2,4}-?\d{2,4}-?\d{4}/);
      
      if (emailMatch || phoneMatch) {
        extractedData.email = emailMatch ? emailMatch[0] : null;
        extractedData.phone = phoneMatch ? phoneMatch[0].replace(/-/g, '') : null;
        
        // 予約を検索
        try {
          let query = supabase
            .from('appointments')
            .select('*')
            .gte('preferred_date1', new Date().toISOString())
            .order('preferred_date1', { ascending: true });
          
          if (extractedData.email) {
            query = query.eq('email', extractedData.email);
          } else if (extractedData.phone) {
            query = query.eq('phone', extractedData.phone);
          }
          
          const { data: appointments } = await query.limit(5);
          
          if (appointments && appointments.length > 0) {
            let appointmentList = '以下の予約が見つかりました：\n\n';
            appointments.forEach((apt, index) => {
              const date = format(new Date(apt.preferred_date1), 'yyyy年MM月dd日');
              const status = apt.status === 'confirmed' ? '✅ 確定' : apt.status === 'pending' ? '⏳ 承認待ち' : '❌ キャンセル';
              appointmentList += `${index + 1}. ${date} ${apt.preferred_time1} ${status}\n`;
              appointmentList += `   ${apt.treatment_type}\n\n`;
            });
            
            actions = [
              { type: 'view_mypage', label: 'マイページで詳細を見る', data: { action: 'view_mypage' } },
              { type: 'modify_booking', label: '予約を変更する', data: { appointments } },
              { type: 'cancel_booking', label: '予約をキャンセルする', data: { appointments } }
            ];
            
            return {
              id: Date.now().toString(),
              type: 'ai',
              content: appointmentList,
              timestamp: new Date(),
              metadata: {
                intent: 'view_booking',
                extractedData,
                actions,
                appointments
              }
            };
          } else {
            aiResponse = '申し訳ございません。該当する予約が見つかりませんでした。\n\nメールアドレスまたは電話番号をもう一度ご確認いただけますか？\n\nまたは、マイページからご確認いただけます。';
            actions = [
              { type: 'view_mypage', label: 'マイページを見る', data: { action: 'view_mypage' } }
            ];
          }
        } catch (error) {
          console.error('予約検索エラー:', error);
        }
      } else {
        aiResponse = '予約を確認いたします。\n\nメールアドレスまたは電話番号を教えていただけますか？\n\n例：yamada@example.com または 090-1234-5678';
        actions = [
          { type: 'view_mypage', label: 'マイページで確認', data: { action: 'view_mypage' } }
        ];
      }
    }
    
    // 予約修正の解析
    if (lowerMessage.includes('予約') && (lowerMessage.includes('変更') || lowerMessage.includes('修正') || lowerMessage.includes('ずらし'))) {
      intent = 'modify_booking';
      aiResponse = '予約の変更を承ります。\n\nまず、現在の予約を確認させてください。\nメールアドレスまたは電話番号を教えていただけますか？';
      actions = [
        { type: 'view_mypage', label: 'マイページで変更', data: { action: 'view_mypage' } }
      ];
    }
    
    // 予約キャンセルの解析
    if (lowerMessage.includes('キャンセル') || (lowerMessage.includes('予約') && (lowerMessage.includes('取り消') || lowerMessage.includes('中止')))) {
      intent = 'cancel_booking';
      aiResponse = '予約のキャンセルを承ります。\n\nまず、キャンセル対象の予約を確認させてください。\nメールアドレスまたは電話番号を教えていただけますか？\n\n※キャンセルは予約日の24時間前まで可能です';
      actions = [
        { type: 'view_mypage', label: 'マイページでキャンセル', data: { action: 'view_mypage' } }
      ];
    }

    // 診療内容の説明が見つかった場合
    if (matchedCourses.length > 0 && (lowerMessage.includes('とは') || lowerMessage.includes('について') || 
        lowerMessage.includes('説明') || lowerMessage.includes('教えて') || lowerMessage.includes('詳しく') ||
        lowerMessage.includes('何') || lowerMessage.includes('どんな') || lowerMessage.includes('コース'))) {
      const course = matchedCourses[0]; // 最も関連性の高い診療内容を使用
      
      const aiResponse = `${course.name}についてご説明します！😊\n\n【${course.category}】\n\n${course.description}\n\n` +
        `⏱️ 所要時間：${course.duration}\n` +
        `💰 料金：${course.price}\n\n` +
        `✨ 特徴：\n${course.features.map(f => `• ${f}`).join('\n')}\n\n` +
        `👥 こんな方におすすめ：\n${course.recommendedFor.map(r => `• ${r}`).join('\n')}\n\n` +
        `📋 治療の流れ：\n${course.flow.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n` +
        `この診療内容で予約されますか？`;
      
      actions = [
        { type: 'booking', label: `${course.name}を予約`, data: { treatment: course.name } },
        { type: 'schedule_view', label: '他の診療内容を見る', data: { action: 'view_schedule' } }
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
          aiResponse = `以下の診療内容が見つかりました：\n\n`;
          matchedCourses.slice(0, 3).forEach((course, index) => {
            aiResponse += `${index + 1}. ${course.name}（${course.category}）\n   ${course.price} / ${course.duration}\n\n`;
          });
          aiResponse += 'どの診療内容について詳しく知りたいですか？';
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
          { type: 'booking', label: '新しい予約を取る', data: { action: 'new_booking' } },
          { type: 'view_mypage', label: '予約を確認する', data: { action: 'view_mypage' } },
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
      
      case 'view_mypage':
        if (onViewMyPage) {
          onViewMyPage();
          toast({
            title: 'マイページへ',
            description: 'マイページに移動します'
          });
        }
        break;
      
      case 'modify_booking':
        toast({
          title: '予約変更',
          description: 'マイページで予約を変更できます'
        });
        if (onViewMyPage) {
          onViewMyPage();
        }
        break;
      
      case 'cancel_booking':
        toast({
          title: '予約キャンセル',
          description: 'マイページで予約をキャンセルできます'
        });
        if (onViewMyPage) {
          onViewMyPage();
        }
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
          className={`fixed bottom-24 right-6 h-32 w-16 rounded-lg shadow-lg z-50 flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white ${className}`}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-[10px] font-medium leading-tight text-center whitespace-pre-line">相談AI{'\n'}チャット</span>
        </Button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <Card className={`fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl border-none z-50 overflow-hidden ${className}`}>
          {/* 背景 - LINE風 */}
          <div className="absolute inset-0 bg-[#86C166]">
          </div>
          
          {/* コンテンツ（背景の上） */}
          <div className="relative z-10 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 bg-white border-b shadow-sm">
              <CardTitle className="text-base font-bold flex items-center gap-3">
                <div className="ring-2 ring-pink-200 rounded-full p-0.5">
                  <DentalReceptionistAvatar size={40} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-base">歯科衛生士 さくら 👩‍⚕️</div>
                  <div className="text-xs text-gray-500 font-normal">オンライン</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-gray-100 text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-64px)] bg-[#B2D8A8]">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* AIの場合、アバターを左に表示 */}
                    {message.type === 'ai' && (
                      <div className="flex-shrink-0 mb-1">
                        <DentalReceptionistAvatar size={32} />
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[75%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* LINE風吹き出し */}
                      <div
                        className={`relative px-4 py-2 shadow-sm ${
                          message.type === 'user'
                            ? 'bg-[#7DCE5F] rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl'
                            : message.type === 'ai'
                            ? 'bg-white rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                            : 'bg-yellow-100 rounded-2xl'
                        }`}
                      >
                        {/* LINE風のしっぽ */}
                        {message.type === 'user' && (
                          <div className="absolute top-0 -right-2 w-0 h-0 border-l-[10px] border-l-[#7DCE5F] border-t-[10px] border-t-transparent"></div>
                        )}
                        {message.type === 'ai' && (
                          <div className="absolute top-0 -left-2 w-0 h-0 border-r-[10px] border-r-white border-t-[10px] border-t-transparent"></div>
                        )}
                        
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {message.content}
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
                                className="text-xs h-8 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-full shadow-sm"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* タイムスタンプ - LINE風に小さく表示 */}
                      <p className="text-[10px] text-gray-600 mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    
                    {/* ユーザーの場合、アバターを右に表示しない（LINEはアバター非表示） */}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="flex-shrink-0 mb-1">
                      <DentalReceptionistAvatar size={32} />
                    </div>
                    <div className="bg-white rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl shadow-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* 入力エリア - LINE風 */}
            <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2 items-center">
                <Button
                  onClick={toggleVoiceInput}
                  variant={isListening ? "destructive" : "ghost"}
                  size="icon"
                  disabled={isTyping}
                  className={`flex-shrink-0 h-9 w-9 rounded-full ${isListening ? "animate-pulse" : "hover:bg-gray-100"}`}
                  title={isListening ? "音声入力を停止" : "音声入力を開始"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-gray-600" />}
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "🎤 音声を認識中..." : "メッセージ"}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping || isListening}
                  className={`rounded-full border-gray-300 bg-gray-50 ${isListening ? "border-red-400 bg-red-50" : ""}`}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="flex-shrink-0 h-9 w-9 rounded-full bg-[#7DCE5F] hover:bg-[#6DBD4F] shadow-sm"
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
