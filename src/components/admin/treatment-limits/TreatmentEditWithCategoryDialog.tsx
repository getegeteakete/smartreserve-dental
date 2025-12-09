
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TreatmentWithCategory } from "@/hooks/useTreatmentsWithCategories";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { useToast } from "@/hooks/use-toast";

interface TreatmentEditWithCategoryDialogProps {
  treatment: TreatmentWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: TreatmentWithCategory) => void;
  existingTreatments?: TreatmentWithCategory[];
}

export const TreatmentEditWithCategoryDialog = ({
  treatment,
  isOpen,
  onClose,
  onSave,
  existingTreatments = [],
}: TreatmentEditWithCategoryDialogProps) => {
  console.log("TreatmentEditWithCategoryDialog - Rendering", { treatment, isOpen });
  
  const { categories } = useTreatmentCategories();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      fee: 0,
      duration: 30,
      category_id: "",
    },
  });

  useEffect(() => {
    console.log("TreatmentEditWithCategoryDialog - useEffect triggered", { treatment, isOpen });
    
    if (treatment && isOpen) {
      try {
        console.log("編集する診療メニュー:", treatment);
        // category_idがnullの場合は "none" に変換
        const categoryId = treatment.category_id || "none";
        console.log("設定するカテゴリーID:", categoryId);
        
        const formData = {
          name: treatment.name || "",
          description: treatment.description || "",
          fee: Number(treatment.fee) || 0,
          duration: Number(treatment.duration) || 30,
          category_id: categoryId,
        };
        
        console.log("フォームにセットするデータ:", formData);
        form.reset(formData);
      } catch (error) {
        console.error("フォーム初期化エラー:", error);
        toast({
          title: "エラー",
          description: "フォームの初期化に失敗しました",
          variant: "destructive",
        });
      }
    }
  }, [treatment, form, isOpen, toast]);

  const onSubmit = async (values: {
    name: string;
    description: string;
    fee: number;
    duration: number;
    category_id: string;
  }) => {
    console.log("フォーム送信開始:", values);
    
    if (!treatment) {
      console.error("編集対象の診療メニューが見つかりません");
      toast({
        title: "エラー",
        description: "編集対象の診療メニューが見つかりません",
        variant: "destructive",
      });
      return;
    }

    // メニュー名の重複チェック（自分以外のメニューと重複していないか）
    const trimmedName = values.name.trim();
    const isDuplicate = existingTreatments.some(
      t => t.id !== treatment.id && t.name.trim() === trimmedName
    );
    
    if (isDuplicate) {
      toast({
        title: "エラー",
        description: "このメニュー名は既に使用されています。別の名前を入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      // データの検証と変換
      const fee = Number(values.fee);
      const duration = Number(values.duration);
      
      if (isNaN(fee) || fee < 0) {
        throw new Error("料金は0以上の数値で入力してください");
      }
      
      if (isNaN(duration) || duration < 1) {
        throw new Error("所要時間は1分以上で入力してください");
      }

      // カテゴリーIDの処理（"none"をnullに変換）
      const categoryId = values.category_id === "" || values.category_id === "none" ? null : values.category_id;
      console.log("処理後のカテゴリーID:", categoryId);

      const updatedTreatment: TreatmentWithCategory = {
        ...treatment,
        name: values.name.trim(),
        description: values.description?.trim() || null,
        fee: fee,
        duration: duration,
        category_id: categoryId,
      };

      console.log("更新される診療メニュー:", updatedTreatment);
      onSave(updatedTreatment);
      onClose();
    } catch (error) {
      console.error("診療メニュー更新エラー:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "診療メニューの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    console.log("ダイアログを閉じます");
    form.reset();
    onClose();
  };

  if (!treatment) {
    console.log("Treatment is null, not rendering dialog");
    return null;
  }

  console.log("Categories available:", categories);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>診療メニュー編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "メニュー名は必須です",
                minLength: { value: 1, message: "メニュー名を入力してください" },
                validate: (value) => {
                  const trimmedName = value?.trim();
                  if (!trimmedName) return true; // requiredでチェック済み
                  
                  const isDuplicate = existingTreatments.some(
                    t => t.id !== treatment?.id && t.name.trim() === trimmedName
                  );
                  
                  if (isDuplicate) {
                    return "このメニュー名は既に使用されています";
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メニュー名</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="メニュー名を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリー</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      console.log("カテゴリー選択:", value);
                      field.onChange(value);
                    }} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">カテゴリーなし</SelectItem>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>カテゴリーがありません</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="診療内容の説明を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fee"
                rules={{
                  required: "料金は必須です",
                  min: { value: 0, message: "料金は0以上で入力してください" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>料金（円）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                rules={{
                  required: "所要時間は必須です",
                  min: { value: 1, message: "所要時間は1分以上で入力してください" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所要時間（分）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 30)}
                        placeholder="30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} type="button">
                キャンセル
              </Button>
              <Button type="submit">更新</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
