import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  MessageCircle, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  specialties: string[];
  rating: number;
  availableUntil?: string;
}

interface StaffConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhoneCall?: (staffId: string) => void;
  onChatStart?: (staffId: string) => void;
}

export const StaffConnectionDialog = ({
  open,
  onOpenChange,
  onPhoneCall,
  onChatStart
}: StaffConnectionDialogProps) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [connectionType, setConnectionType] = useState<'chat' | 'phone' | null>(null);
  const { toast } = useToast();

  // 模擬スタッフデータ
  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: '田中 美咲',
      role: '受付スタッフ',
      status: 'online',
      specialties: ['予約管理', '一般相談', '料金案内'],
      rating: 4.8,
      availableUntil: '18:00'
    },
    {
      id: '2',
      name: '佐藤 健太',
      role: '歯科衛生士',
      status: 'online',
      specialties: ['治療相談', '予防歯科', 'クリーニング'],
      rating: 4.9,
      availableUntil: '17:30'
    },
    {
      id: '3',
      name: '山田 花子',
      role: '受付スタッフ',
      status: 'busy',
      specialties: ['予約管理', '保険相談', '治療費相談'],
      rating: 4.7,
      availableUntil: '18:00'
    },
    {
      id: '4',
      name: '鈴木 一郎',
      role: '歯科医師',
      status: 'online',
      specialties: ['治療相談', '診断', '緊急対応'],
      rating: 4.9,
      availableUntil: '16:00'
    }
  ];

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: StaffMember['status']) => {
    switch (status) {
      case 'online':
        return 'オンライン';
      case 'busy':
        return '対応中';
      case 'offline':
        return 'オフライン';
    }
  };

  const handleStaffSelect = (staff: StaffMember) => {
    if (staff.status === 'offline') {
      toast({
        title: 'オフライン',
        description: `${staff.name}さんは現在オフラインです`,
        variant: 'destructive'
      });
      return;
    }
    setSelectedStaff(staff);
  };

  const handleConnectionTypeSelect = (type: 'chat' | 'phone') => {
    setConnectionType(type);
  };

  const handleConnect = () => {
    if (!selectedStaff || !connectionType) return;

    if (connectionType === 'phone') {
      if (onPhoneCall) {
        onPhoneCall(selectedStaff.id);
        toast({
          title: '電話接続中',
          description: `${selectedStaff.name}さんにお電話をおかけします`
        });
      }
    } else {
      if (onChatStart) {
        onChatStart(selectedStaff.id);
        toast({
          title: 'チャット開始',
          description: `${selectedStaff.name}さんとのチャットを開始します`
        });
      }
    }
    
    onOpenChange(false);
    setSelectedStaff(null);
    setConnectionType(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            スタッフとの接続
          </DialogTitle>
          <DialogDescription>
            お困りのことがございましたら、専門スタッフがお手伝いいたします
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedStaff ? (
            // スタッフ選択
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">スタッフを選択してください</h3>
              <div className="grid gap-4">
                {staffMembers.map((staff) => (
                  <Card 
                    key={staff.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      staff.status === 'offline' ? 'opacity-50' : ''
                    }`}
                    onClick={() => handleStaffSelect(staff)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>
                            {staff.name.split(' ')[0].charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{staff.name}</h4>
                            <Badge variant="secondary">{staff.role}</Badge>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(staff.status)}`} />
                              <span className="text-xs text-muted-foreground">
                                {getStatusText(staff.status)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{staff.rating}</span>
                            {staff.availableUntil && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                対応可能: ~{staff.availableUntil}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {staff.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {staff.status === 'online' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {staff.status === 'busy' && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : !connectionType ? (
            // 接続方法選択
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedStaff.avatar} />
                  <AvatarFallback>
                    {selectedStaff.name.split(' ')[0].charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedStaff.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg">接続方法を選択してください</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleConnectionTypeSelect('chat')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      チャット
                    </CardTitle>
                    <CardDescription>
                      テキストチャットでお話しします
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>すぐに開始可能</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>履歴が残る</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleConnectionTypeSelect('phone')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      電話
                    </CardTitle>
                    <CardDescription>
                      お電話で直接お話しします
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>音声で直接相談</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>より詳しい説明</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStaff(null);
                    setConnectionType(null);
                  }}
                >
                  戻る
                </Button>
              </div>
            </div>
          ) : (
            // 確認画面
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">接続の確認</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStaff.avatar} />
                    <AvatarFallback>
                      {selectedStaff.name.split(' ')[0].charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h4 className="font-semibold">{selectedStaff.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {connectionType === 'chat' ? (
                    <MessageCircle className="h-5 w-5" />
                  ) : (
                    <Phone className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {connectionType === 'chat' ? 'チャット' : '電話'}で接続
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStaff(null);
                    setConnectionType(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button onClick={handleConnect}>
                  {connectionType === 'chat' ? 'チャット開始' : '電話をかける'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

