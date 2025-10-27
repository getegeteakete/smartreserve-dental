import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ClinicInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  business_hours?: {
    monday?: { start: string; end: string; available: boolean };
    tuesday?: { start: string; end: string; available: boolean };
    wednesday?: { start: string; end: string; available: boolean };
    thursday?: { start: string; end: string; available: boolean };
    friday?: { start: string; end: string; available: boolean };
    saturday?: { start: string; end: string; available: boolean };
    sunday?: { start: string; end: string; available: boolean };
  };
}

export const GeneralSettingsEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ClinicInfo>({
    name: '六本松 矯正歯科クリニック とよしま',
    phone: '092-406-2119',
    address: '福岡県福岡市中央区六本松2-11-30',
    email: 'info@example.com',
    business_hours: {
      monday: { start: '09:00', end: '18:30', available: true },
      tuesday: { start: '09:00', end: '18:30', available: true },
      wednesday: { start: '09:00', end: '18:30', available: true },
      thursday: { start: '09:00', end: '18:30', available: true },
      friday: { start: '09:00', end: '18:30', available: true },
      saturday: { start: '09:00', end: '17:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false },
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'clinic_info')
        .single();

      if (error) {
        // 設定が存在しない場合はデフォルト値を使用
        if (error.code === 'PGRST116') {
          console.log('一般設定が存在しないため、デフォルト値を使用します');
        } else {
          throw error;
        }
      }

      if (data && data.setting_value) {
        setFormData({
          name: data.setting_value.name || '六本松 矯正歯科クリニック とよしま',
          phone: data.setting_value.phone || '092-406-2119',
          address: data.setting_value.address || '福岡県福岡市中央区六本松2-11-30',
          email: data.setting_value.email || 'info@example.com',
          business_hours: data.setting_value.business_hours || {
            monday: { start: '09:00', end: '18:30', available: true },
            tuesday: { start: '09:00', end: '18:30', available: true },
            wednesday: { start: '09:00', end: '18:30', available: true },
            thursday: { start: '09:00', end: '18:30', available: true },
            friday: { start: '09:00', end: '18:30', available: true },
            saturday: { start: '09:00', end: '17:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false },
          },
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'エラー',
        description: '設定の読み込みに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // バリデーション
      if (!formData.name.trim()) {
        toast({
          title: '入力エラー',
          description: 'クリニック名は必須です',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.phone.trim()) {
        toast({
          title: '入力エラー',
          description: '電話番号は必須です',
          variant: 'destructive',
        });
        return;
      }

      // 既存の設定を確認
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('id')
        .eq('setting_key', 'clinic_info')
        .single();

      let result;
      if (existingData) {
        // 更新
        result = await supabase
          .from('system_settings')
          .update({
            setting_value: formData,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', 'clinic_info');
      } else {
        // 新規作成
        result = await supabase
          .from('system_settings')
          .insert({
            setting_key: 'clinic_info',
            category: 'general',
            setting_value: formData,
            description: '医院の基本情報',
            is_enabled: true,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: '保存成功',
        description: '一般設定を保存しました',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'エラー',
        description: '設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          クリニック基本情報
        </CardTitle>
        <CardDescription>
          医院名、連絡先、営業時間などの基本情報を設定します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* クリニック名 */}
        <div className="space-y-2">
          <Label htmlFor="clinic_name" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            クリニック名 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clinic_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例: スマイル歯科クリニック"
            className="text-base"
          />
        </div>

        {/* 住所 */}
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            住所
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="例: 〒100-0001 東京都千代田区千代田1-1-1"
            className="text-base"
          />
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            電話番号 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="例: 03-1234-5678"
            className="text-base"
          />
        </div>

        {/* メールアドレス */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            メールアドレス
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="例: info@example.com"
            className="text-base"
          />
        </div>

        {/* 営業時間の表示 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            営業時間
          </Label>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">月曜日:</span>
              <span>{formData.business_hours?.monday?.available 
                ? `${formData.business_hours.monday.start} - ${formData.business_hours.monday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">火曜日:</span>
              <span>{formData.business_hours?.tuesday?.available 
                ? `${formData.business_hours.tuesday.start} - ${formData.business_hours.tuesday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">水曜日:</span>
              <span>{formData.business_hours?.wednesday?.available 
                ? `${formData.business_hours.wednesday.start} - ${formData.business_hours.wednesday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">木曜日:</span>
              <span>{formData.business_hours?.thursday?.available 
                ? `${formData.business_hours.thursday.start} - ${formData.business_hours.thursday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">金曜日:</span>
              <span>{formData.business_hours?.friday?.available 
                ? `${formData.business_hours.friday.start} - ${formData.business_hours.friday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">土曜日:</span>
              <span>{formData.business_hours?.saturday?.available 
                ? `${formData.business_hours.saturday.start} - ${formData.business_hours.saturday.end}` 
                : '休診'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-600">日曜日:</span>
              <span>{formData.business_hours?.sunday?.available 
                ? `${formData.business_hours.sunday.start} - ${formData.business_hours.sunday.end}` 
                : '休診'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            ※ 営業時間の詳細な編集は「カレンダー調整」タブで行ってください。
          </p>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存する
              </>
            )}
          </Button>
        </div>

        {/* ヘルプテキスト */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>ヒント：</strong> ここで設定した情報は、予約確認メールや患者向けページに表示されます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


