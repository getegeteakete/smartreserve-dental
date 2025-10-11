import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Store, Building } from 'lucide-react';

declare global {
  interface Window {
    Komoju: any;
  }
}

interface KomojuPaymentFormProps {
  amount: number;
  appointmentId: string;
  patientName: string;
  email: string;
  treatmentName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const KomojuPaymentForm = ({
  amount,
  appointmentId,
  patientName,
  email,
  treatmentName,
  onSuccess,
  onCancel,
}: KomojuPaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit_card' | 'konbini' | 'bank_transfer'>('credit_card');
  const { toast } = useToast();

  // KOMOJUスクリプトの読み込み
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://multipay.komoju.com/static/application.js';
    script.async = true;
    script.onload = () => {
      console.log('KOMOJU script loaded');
      createPaymentSession();
    };
    script.onerror = () => {
      toast({
        title: 'エラー',
        description: 'KOMOJU決済システムの読み込みに失敗しました',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // KOMOJUセッションの作成
  const createPaymentSession = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-komoju-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount,
            currency: 'JPY',
            appointmentId,
            patientName,
            email,
            treatmentName,
            return_url: `${window.location.origin}/payment-success`,
            cancel_url: `${window.location.origin}/booking`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('セッションの作成に失敗しました');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating KOMOJU session:', error);
      toast({
        title: 'エラー',
        description: '決済の初期化に失敗しました',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // KOMOJU決済ウィジェットの起動
  const handlePayment = () => {
    if (!window.Komoju || !sessionId) {
      toast({
        title: 'エラー',
        description: '決済システムの準備ができていません',
        variant: 'destructive',
      });
      return;
    }

    try {
      const komoju = window.Komoju.Multipay({
        key: import.meta.env.VITE_KOMOJU_PUBLISHABLE_KEY,
        sessionId: sessionId,
        language: 'ja',
      });

      komoju.open({
        paymentMethod: selectedPaymentMethod,
        onComplete: (result: any) => {
          console.log('Payment completed:', result);
          toast({
            title: '決済完了',
            description: 'お支払いが完了しました',
          });
          onSuccess?.();
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          toast({
            title: '決済エラー',
            description: error.message || '決済処理中にエラーが発生しました',
            variant: 'destructive',
          });
        },
        onClose: () => {
          console.log('Payment widget closed');
        },
      });
    } catch (error) {
      console.error('Error opening KOMOJU widget:', error);
      toast({
        title: 'エラー',
        description: '決済画面の起動に失敗しました',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>決済情報入力</CardTitle>
          <CardDescription>安全な決済処理を準備中です</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!sessionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>決済エラー</CardTitle>
          <CardDescription>決済の初期化に失敗しました</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCancel} variant="outline">
            戻る
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>お支払い方法の選択</CardTitle>
        <CardDescription>
          {treatmentName} のお支払い手続き
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 金額表示 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-900 font-medium">
            お支払い金額: ¥{amount.toLocaleString()}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {treatmentName}
          </p>
        </div>

        {/* 決済方法選択 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">お支払い方法を選択してください</h3>
          
          <div className="grid gap-3">
            {/* クレジットカード */}
            <button
              onClick={() => setSelectedPaymentMethod('credit_card')}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                selectedPaymentMethod === 'credit_card'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className={`h-6 w-6 ${
                selectedPaymentMethod === 'credit_card' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div className="text-left flex-1">
                <p className="font-medium">クレジットカード</p>
                <p className="text-xs text-gray-500">VISA / Mastercard / JCB / AMEX</p>
              </div>
              {selectedPaymentMethod === 'credit_card' && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </button>

            {/* コンビニ決済 */}
            <button
              onClick={() => setSelectedPaymentMethod('konbini')}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                selectedPaymentMethod === 'konbini'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Store className={`h-6 w-6 ${
                selectedPaymentMethod === 'konbini' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div className="text-left flex-1">
                <p className="font-medium">コンビニ決済</p>
                <p className="text-xs text-gray-500">セブン-イレブン / ローソン / ファミマ 他</p>
              </div>
              {selectedPaymentMethod === 'konbini' && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </button>

            {/* 銀行振込 */}
            <button
              onClick={() => setSelectedPaymentMethod('bank_transfer')}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                selectedPaymentMethod === 'bank_transfer'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className={`h-6 w-6 ${
                selectedPaymentMethod === 'bank_transfer' ? 'text-primary' : 'text-gray-400'
              }`} />
              <div className="text-left flex-1">
                <p className="font-medium">銀行振込（Pay-easy）</p>
                <p className="text-xs text-gray-500">インターネットバンキング / ATM</p>
              </div>
              {selectedPaymentMethod === 'bank_transfer' && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold">ご注意：</p>
          {selectedPaymentMethod === 'konbini' && (
            <ul className="list-disc list-inside space-y-1">
              <li>コンビニでのお支払い期限は3日以内です</li>
              <li>お支払い番号をメールで送信します</li>
              <li>お支払い確認後に予約が確定します</li>
            </ul>
          )}
          {selectedPaymentMethod === 'bank_transfer' && (
            <ul className="list-disc list-inside space-y-1">
              <li>銀行振込の期限は3日以内です</li>
              <li>振込先情報をメールで送信します</li>
              <li>入金確認後に予約が確定します</li>
            </ul>
          )}
          {selectedPaymentMethod === 'credit_card' && (
            <ul className="list-disc list-inside space-y-1">
              <li>決済完了後すぐに予約が確定します</li>
              <li>3Dセキュア認証に対応しています</li>
              <li>領収書はメールで送信されます</li>
            </ul>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
          >
            ¥{amount.toLocaleString()} を支払う
          </Button>
        </div>

        {/* セキュリティ表示 */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>SSL暗号化通信で保護されています</span>
        </div>
      </CardContent>
    </Card>
  );
};

