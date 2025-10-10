
import { useEffect } from "react";
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

interface EditAppointmentDialogProps {
  appointment: {
    id: string;
    patient_name: string;
    phone: string;
    appointment_date: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onComplete,
}: EditAppointmentDialogProps) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      patient_name: "",
      phone: "",
      appointment_date: "",
    },
  });

  useEffect(() => {
    if (appointment) {
      form.reset({
        patient_name: appointment.patient_name,
        phone: appointment.phone,
        appointment_date: new Date(appointment.appointment_date)
          .toISOString()
          .slice(0, 16),
      });
    }
  }, [appointment, form]);

  const onSubmit = async (values: {
    patient_name: string;
    phone: string;
    appointment_date: string;
  }) => {
    if (!appointment) return;

    const { error } = await supabase
      .from("appointments")
      .update({
        patient_name: values.patient_name,
        phone: values.phone,
        appointment_date: new Date(values.appointment_date).toISOString(),
      })
      .eq("id", appointment.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "予約の更新に失敗しました",
      });
      return;
    }

    toast({
      title: "更新完了",
      description: "予約を更新しました",
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>予約の編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>患者名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電話番号</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>予約日時</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">更新</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
