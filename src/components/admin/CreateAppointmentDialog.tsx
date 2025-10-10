
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface AppointmentFormData {
  patient_name: string;
  phone: string;
  email: string;
  age: number;
  treatment_name: string;
  fee: number;
  confirmed_date: string;
  confirmed_time_slot: string;
  notes: string;
}

const treatments = [
  { name: "初診相談・検査", fee: 3000 },
  { name: "精密検査", fee: 5000 },
  { name: "PMTC（歯のクリーニング）", fee: 8000 },
  { name: "ホワイトニング", fee: 15000 },
  { name: "虫歯治療", fee: 5000 },
  { name: "歯周病治療", fee: 6000 },
  { name: "インプラント相談", fee: 0 },
  { name: "矯正相談", fee: 0 },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onComplete,
}: CreateAppointmentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AppointmentFormData>({
    defaultValues: {
      patient_name: "",
      phone: "",
      email: "",
      age: 0,
      treatment_name: "",
      fee: 0,
      confirmed_date: "",
      confirmed_time_slot: "",
      notes: "",
    },
  });

  const selectedTreatment = form.watch("treatment_name");

  const onTreatmentChange = (value: string) => {
    form.setValue("treatment_name", value);
    const treatment = treatments.find(t => t.name === value);
    if (treatment) {
      form.setValue("fee", treatment.fee);
    }
  };

  const onSubmit = async (values: AppointmentFormData) => {
    setIsSubmitting(true);
    
    try {
      // 予約を作成（自動承認状態）
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          patient_name: values.patient_name,
          phone: values.phone,
          email: values.email,
          age: values.age,
          treatment_name: values.treatment_name,
          fee: values.fee,
          appointment_date: new Date().toISOString(),
          status: 'confirmed', // 管理者作成の予約は自動承認
          confirmed_date: values.confirmed_date,
          confirmed_time_slot: values.confirmed_time_slot,
          notes: values.notes,
        })
        .select()
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      // 第一希望として予約希望を記録
      const { error: preferenceError } = await supabase
        .from("appointment_preferences")
        .insert({
          appointment_id: appointment.id,
          preference_order: 1,
          preferred_date: values.confirmed_date,
          preferred_time_slot: values.confirmed_time_slot,
        });

      if (preferenceError) {
        console.error("予約希望の保存エラー:", preferenceError);
      }

      toast({
        title: "予約作成完了",
        description: "新しい予約を作成しました",
      });
      
      form.reset();
      onComplete();
      
    } catch (error) {
      console.error("予約作成エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の作成に失敗しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規予約作成（管理者用）</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_name"
                rules={{ required: "患者名は必須です" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>患者名</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="患者名を入力" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                rules={{ required: "年齢は必須です", min: { value: 0, message: "年齢は0以上である必要があります" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年齢</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="年齢"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: "電話番号は必須です" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="090-1234-5678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "メールアドレスは必須です",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "有効なメールアドレスを入力してください"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="example@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="treatment_name"
              rules={{ required: "診療内容は必須です" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>診療内容</FormLabel>
                  <Select value={field.value} onValueChange={onTreatmentChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="診療内容を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {treatments.map((treatment) => (
                        <SelectItem key={treatment.name} value={treatment.name}>
                          {treatment.name} - {treatment.fee.toLocaleString()}円
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>料金</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="料金"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="confirmed_date"
                rules={{ required: "確定日は必須です" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>確定日</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmed_time_slot"
                rules={{ required: "確定時間は必須です" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>確定時間</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="時間を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備考</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="備考があれば入力してください" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "作成中..." : "予約作成"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
