import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Stripeの公開可能キーを設定（環境変数から取得）
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  amount: number;
  appointmentId: string;
  patientName: string;
  email: string;
  treatmentName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CheckoutFormProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm = ({ amount, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: '決済エラー',
          description: error.message || '決済処理中にエラーが発生しました',
          variant: 'destructive',
        });
      } else {
        // 成功した場合はリダイレクトされる
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: '決済エラー',
        description: '予期しないエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-900 font-medium">
          お支払い金額: ¥{amount.toLocaleString()}
        </p>
      </div>
      
      <PaymentElement />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            `¥${amount.toLocaleString()} を支払う`
          )}
        </Button>
      </div>
    </form>
  );
};

export const PaymentForm = ({
  amount,
  appointmentId,
  patientName,
  email,
  treatmentName,
  onSuccess,
  onCancel,
}: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Payment Intentの作成
  useState(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              amount,
              appointmentId,
              patientName,
              email,
              treatmentName,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Payment Intent の作成に失敗しました');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'エラー',
          description: '決済の初期化に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  });

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4F46E5',
      },
    },
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

  if (!clientSecret) {
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
        <CardTitle>決済情報入力</CardTitle>
        <CardDescription>
          {treatmentName} のお支払い手続き
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  );
};



