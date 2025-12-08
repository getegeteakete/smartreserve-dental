import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureSystemSettings } from '@/utils/defaultSystemSettings';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingsByCategory {
  payment: SystemSetting[];
  chat: SystemSetting[];
  notification: SystemSetting[];
  booking: SystemSetting[];
  general: SystemSetting[];
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 全設定を取得
  const fetchSettings = async (updateLoadingState: boolean = true) => {
    try {
      if (updateLoadingState) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) {
        // テーブルが存在しない、またはデータが存在しない場合は初期化を試みる
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
          console.log('システム設定が存在しないため、初期化を試みます...', error);
          try {
            const initialized = await ensureSystemSettings();
            if (initialized) {
              // 初期化成功後、再度取得を試みる
              const { data: newData, error: newError } = await supabase
                .from('system_settings')
                .select('*')
                .order('category', { ascending: true })
                .order('setting_key', { ascending: true });
              
              if (newError) {
                console.warn('初期化後の取得エラー（デフォルト値を使用）:', newError);
                setSettings([]);
                return;
              }
              setSettings(newData || []);
              return;
            } else {
              console.warn('システム設定の初期化に失敗しました（デフォルト値を使用）');
              setSettings([]);
              return;
            }
          } catch (initError) {
            console.warn('初期化処理中にエラーが発生しました（デフォルト値を使用）:', initError);
            setSettings([]);
            return;
          }
        }
        // その他のエラーも警告のみで続行（予約処理をブロックしない）
        console.warn('システム設定の取得エラー（デフォルト値を使用）:', error);
        setSettings([]);
        return;
      }

      // データが空の場合は初期化を試みる
      if (!data || data.length === 0) {
        console.log('システム設定が空のため、初期化を試みます...');
        try {
          const initialized = await ensureSystemSettings();
          if (initialized) {
            // 初期化成功後、再度取得を試みる
            const { data: newData, error: newError } = await supabase
              .from('system_settings')
              .select('*')
              .order('category', { ascending: true })
              .order('setting_key', { ascending: true });
            
            if (newError) {
              console.warn('初期化後の取得エラー（デフォルト値を使用）:', newError);
              setSettings([]);
              return;
            }
            setSettings(newData || []);
            return;
          } else {
            console.warn('システム設定の初期化に失敗しました（デフォルト値を使用）');
            setSettings([]);
            return;
          }
        } catch (initError) {
          console.warn('初期化処理中にエラーが発生しました（デフォルト値を使用）:', initError);
          setSettings([]);
          return;
        }
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // エラーが発生しても予約処理をブロックしないように、警告のみ表示
      // システム設定がなくても予約は可能なため、エラーではなく警告として扱う
      console.warn('システム設定の取得に失敗しましたが、デフォルト値を使用して続行します:', error);
      setSettings([]);
      // エラートーストは表示しない（予約処理を妨げないため）
    } finally {
      if (updateLoadingState) {
        setLoading(false);
      }
    }
  };

  // 特定の設定を取得
  const getSetting = (key: string): SystemSetting | null => {
    return settings.find(s => s.setting_key === key) || null;
  };

  // 設定値を取得（簡易版）
  const getSettingValue = (key: string, defaultValue: any = null): any => {
    const setting = getSetting(key);
    return setting ? setting.setting_value : defaultValue;
  };

  // 機能が有効かどうかチェック
  const isFeatureEnabled = (key: string): boolean => {
    const setting = getSetting(key);
    if (!setting) return false;
    
    // is_enabledとsetting_value.enabledの両方をチェック（より厳密に）
    const isEnabled = setting.is_enabled === true;
    const configEnabled = setting.setting_value?.enabled !== false;
    
    console.log(`isFeatureEnabled(${key}):`, {
      is_enabled: setting.is_enabled,
      setting_value: setting.setting_value,
      result: isEnabled && configEnabled
    });
    
    return isEnabled && configEnabled;
  };

  // 設定を更新
  const updateSetting = async (key: string, value: any, isEnabled?: boolean) => {
    try {
      console.log('Setting update request:', { key, value, isEnabled });
      
      const updateData: any = {
        setting_value: value,
        updated_at: new Date().toISOString(),
      };

      if (isEnabled !== undefined) {
        updateData.is_enabled = isEnabled;
      }

      console.log('Update data:', updateData);

      const { data, error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('setting_key', key)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      // ローカル状態を即座に更新してUIの反応性を向上
      setSettings(prevSettings => 
        prevSettings.map(setting => 
          setting.setting_key === key 
            ? {
                ...setting,
                is_enabled: isEnabled !== undefined ? isEnabled : setting.is_enabled,
                setting_value: value,
                updated_at: new Date().toISOString()
              }
            : setting
        )
      );

      toast({
        title: '更新完了',
        description: `設定「${key}」が更新されました`,
      });

      // ローカル状態の更新のみで処理完了（サーバーからの再取得は行わない）
      console.log('Setting update completed locally');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'エラー',
        description: `設定「${key}」の更新に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error; // エラーを再スローして呼び出し元でも処理できるようにする
    }
  };

  // カテゴリ別に設定を取得
  const getSettingsByCategory = (): SettingsByCategory => {
    return {
      payment: settings.filter(s => s.category === 'payment'),
      chat: settings.filter(s => s.category === 'chat'),
      notification: settings.filter(s => s.category === 'notification'),
      booking: settings.filter(s => s.category === 'booking'),
      general: settings.filter(s => s.category === 'general'),
    };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    getSetting,
    getSettingValue,
    isFeatureEnabled,
    updateSetting,
    getSettingsByCategory,
    refetch: fetchSettings,
  };
};

// 特定の機能設定を取得する専用hooks
export const usePaymentSettings = () => {
  const { getSetting, getSettingValue, isFeatureEnabled, updateSetting } = useSystemSettings();

  return {
    isPaymentEnabled: isFeatureEnabled('payment_enabled'),
    paymentConfig: getSettingValue('payment_enabled', {}),
    paymentMethods: getSettingValue('payment_methods', {}),
    updatePaymentSettings: (value: any) => updateSetting('payment_enabled', value),
  };
};

export const useChatSettings = () => {
  const { getSetting, getSettingValue, isFeatureEnabled, updateSetting } = useSystemSettings();

  return {
    isChatEnabled: isFeatureEnabled('chat_enabled'),
    chatConfig: getSettingValue('chat_enabled', {}),
    staffConnectionConfig: getSettingValue('chat_staff_connection', {}),
    updateChatSettings: (value: any) => updateSetting('chat_enabled', value),
  };
};

export const useSMSSettings = () => {
  const { getSetting, getSettingValue, isFeatureEnabled, updateSetting } = useSystemSettings();

  return {
    isSMSEnabled: isFeatureEnabled('sms_enabled'),
    smsConfig: getSettingValue('sms_enabled', {}),
    smsReminderTiming: getSettingValue('sms_reminder_timing', {}),
    updateSMSSettings: (value: any) => updateSetting('sms_enabled', value),
  };
};

