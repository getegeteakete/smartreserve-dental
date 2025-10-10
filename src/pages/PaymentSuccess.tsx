import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error'>('success');

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // 決済の検証処理
    const verifyPayment = async () => {
      if (!paymentIntentId) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        // ここで必要に応じて決済の最終確認を行う
        // 実際のプロダクションでは、バックエンドで検証を行うことを推奨
        await new Promise(resolve => setTimeout(resolve, 1500)); // アニメーション用の遅延
        
        setVerificationStatus('success');
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentIntentId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <div className="container max-w-2xl mx-auto px-4 py-16">
        {isVerifying ? (
          <Card className="border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-gray-700">決済を確認中...</p>
            </CardContent>
          </Card>
        ) : verificationStatus === 'success' ? (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-20 w-20 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-900">
                お支払い完了
              </CardTitle>
              <CardDescription className="text-lg text-green-700 mt-2">
                ご予約の決済が正常に完了しました
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg mb-4">次のステップ</h3>
                <div className="space-y-2 text-gray-700">
                  <p>✓ 確認メールをご確認ください</p>
                  <p>✓ 予約日の前日にリマインダーが届きます</p>
                  <p>✓ 当日は予約時間の10分前にご来院ください</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>重要:</strong> 領収書はメールで送信されます。
                  必要に応じて印刷・保存してください。
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  className="w-full"
                >
                  トップページへ戻る
                </Button>
                <Button
                  onClick={() => navigate('/mypage')}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  マイページで予約を確認
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-900">
                決済の確認に失敗しました
              </CardTitle>
              <CardDescription className="text-red-700">
                お手数ですが、再度お試しいただくか、お問い合わせください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                トップページへ戻る
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


