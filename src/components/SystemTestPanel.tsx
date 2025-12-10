import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTreatmentsWithCategories } from '@/hooks/useTreatmentsWithCategories';
import { useAppointmentManagement } from '@/hooks/useAppointmentManagement';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export const SystemTestPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();
  const { treatments, isLoading: treatmentsLoading } = useTreatmentsWithCategories();
  const { appointments, fetchAppointments } = useAppointmentManagement();

  const runSystemTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [];

    // 1. Supabase接続テスト
    tests.push({ name: 'Supabase接続テスト', status: 'pending' });
    setTestResults([...tests]);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      tests[0].status = 'success';
      tests[0].message = 'データベース接続正常';
    } catch (error: any) {
      tests[0].status = 'error';
      tests[0].message = `接続エラー: ${error.message}`;
    }
    setTestResults([...tests]);

    // 2. 診療メニューデータ取得テスト
    tests.push({ name: '診療メニュー取得テスト', status: 'pending' });
    setTestResults([...tests]);
    
    try {
      if (treatmentsLoading) {
        tests[1].status = 'pending';
        tests[1].message = '読み込み中...';
      } else if (treatments && treatments.length > 0) {
        tests[1].status = 'success';
        tests[1].message = `${treatments.length}件の診療メニューを取得`;
      } else {
        tests[1].status = 'error';
        tests[1].message = '診療メニューデータが取得できません';
      }
    } catch (error: any) {
      tests[1].status = 'error';
      tests[1].message = `取得エラー: ${error.message}`;
    }
    setTestResults([...tests]);

    // 3. 予約データ取得テスト
    tests.push({ name: '予約データ取得テスト', status: 'pending' });
    setTestResults([...tests]);
    
    try {
      await fetchAppointments();
      if (Array.isArray(appointments)) {
        tests[2].status = 'success';
        tests[2].message = `${appointments.length}件の予約データを取得`;
      } else {
        tests[2].status = 'error';
        tests[2].message = '予約データが正常に取得できません';
      }
    } catch (error: any) {
      tests[2].status = 'error';
      tests[2].message = `取得エラー: ${error.message}`;
    }
    setTestResults([...tests]);

    // 4. システム設定取得テスト
    tests.push({ name: 'システム設定取得テスト', status: 'pending' });
    setTestResults([...tests]);
    
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // テーブルが存在しない場合は無視
        throw error;
      }
      tests[3].status = 'success';
      tests[3].message = data ? `${data.length}件の設定を取得` : 'システム設定テーブル確認';
    } catch (error: any) {
      tests[3].status = 'error';
      tests[3].message = `設定取得エラー: ${error.message}`;
    }
    setTestResults([...tests]);

    // 5. 管理者認証テスト
    tests.push({ name: '管理者認証テスト', status: 'pending' });
    setTestResults([...tests]);
    
    try {
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const adminUsername = localStorage.getItem('admin_username');
      
      if (adminLoggedIn === 'true' && adminUsername === 'sup@ei-life.co.jp') {
        tests[4].status = 'success';
        tests[4].message = '管理者認証済み';
      } else {
        tests[4].status = 'error';
        tests[4].message = '管理者認証が必要です';
      }
    } catch (error: any) {
      tests[4].status = 'error';
      tests[4].message = `認証エラー: ${error.message}`;
    }
    setTestResults([...tests]);

    setIsRunning(false);

    // テスト結果のサマリー
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;

    toast({
      title: 'システムテスト完了',
      description: `成功: ${successCount}件, エラー: ${errorCount}件`,
      variant: errorCount > 0 ? 'destructive' : 'default'
    });
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '成功';
      case 'error': return 'エラー';
      default: return '実行中';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          システム動作確認テスト
        </CardTitle>
        <CardDescription>
          主要機能の動作確認を行います
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSystemTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'テスト実行中...' : 'システムテストを実行'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">テスト結果</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`} />
                  <span className="font-medium">{result.name}</span>
                </div>
                <div className="text-right">
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {getStatusText(result.status)}
                  </Badge>
                  {result.message && (
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">テスト項目</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Supabase接続テスト</li>
            <li>• 診療メニューデータ取得</li>
            <li>• 予約データ取得</li>
            <li>• システム設定取得</li>
            <li>• 管理者認証確認</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
