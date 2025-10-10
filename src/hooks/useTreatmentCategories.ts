
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TreatmentCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useTreatmentCategories = () => {
  const [categories, setCategories] = useState<TreatmentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("treatment_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("カテゴリー取得エラー:", error);
      toast({
        title: "エラー",
        description: "カテゴリーの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<TreatmentCategory, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("treatment_categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      toast({
        title: "成功",
        description: "カテゴリーを作成しました",
      });

      return data;
    } catch (error) {
      console.error("カテゴリー作成エラー:", error);
      toast({
        title: "エラー",
        description: "カテゴリーの作成に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<TreatmentCategory>) => {
    try {
      const { data, error } = await supabase
        .from("treatment_categories")
        .update(categoryData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(c => c.id === id ? data : c).sort((a, b) => a.display_order - b.display_order));
      toast({
        title: "成功",
        description: "カテゴリーを更新しました",
      });

      return data;
    } catch (error) {
      console.error("カテゴリー更新エラー:", error);
      toast({
        title: "エラー",
        description: "カテゴリーの更新に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("treatment_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "成功",
        description: "カテゴリーを削除しました",
      });
    } catch (error) {
      console.error("カテゴリー削除エラー:", error);
      toast({
        title: "エラー",
        description: "カテゴリーの削除に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadImage = async (file: File, categoryId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${categoryId}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('treatment-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('treatment-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
  };
};
