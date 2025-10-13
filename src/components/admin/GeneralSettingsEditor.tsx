import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Building2, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

interface ClinicInfo {
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  business_hours?: string;
  description?: string;
}

export const GeneralSettingsEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ClinicInfo>({
    clinic_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    business_hours: '',
    description: '',
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
          clinic_name: data.setting_value.clinic_name || '',
          address: data.setting_value.address || '',
          phone: data.setting_value.phone || '',
          email: data.setting_value.email || '',
          website: data.setting_value.website || '',
          business_hours: data.setting_value.business_hours || '',
          description: data.setting_value.description || '',
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
      if (!formData.clinic_name.trim()) {
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
            value={formData.clinic_name}
            onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
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

        {/* ウェブサイトURL */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            ウェブサイトURL
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="例: https://www.example.com"
            className="text-base"
          />
        </div>

        {/* 営業時間 */}
        <div className="space-y-2">
          <Label htmlFor="business_hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            営業時間
          </Label>
          <Textarea
            id="business_hours"
            value={formData.business_hours}
            onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
            placeholder="例:&#10;月〜金: 10:00〜13:30 / 15:00〜19:00&#10;土: 9:00〜12:30 / 14:00〜17:30&#10;日・祝: 休診"
            rows={4}
            className="text-base resize-none"
          />
        </div>

        {/* クリニック説明 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            クリニック説明
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="例: 患者様に寄り添った丁寧な治療を心がけています。"
            rows={4}
            className="text-base resize-none"
          />
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


