
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

interface CancelFormData {
  reason: string;
}

export const CancelAppointmentDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  loading 
}: CancelAppointmentDialogProps) => {
  const form = useForm<CancelFormData>({
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = (data: CancelFormData) => {
    onConfirm(data.reason);
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>予約をキャンセルしますか？</DialogTitle>
          <DialogDescription>
            この操作は取り消せません。予約をキャンセルすると、管理者に通知メールが送信されます。
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>キャンセル理由（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="キャンセル理由をお書きください..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                戻る
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {loading ? "処理中..." : "キャンセルする"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
