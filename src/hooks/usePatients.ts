
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncPatientsFromAppointments } from "@/utils/patientSyncUtils";

export interface Patient {
  id: string;
  patient_name: string;
  email?: string;
  phone: string;
  age?: number;
  address?: string;
  medical_history?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      // まず予約データから患者情報を同期
      await syncPatientsFromAppointments();
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("患者データ取得エラー:", error);
        throw error;
      }
      
      setPatients(data || []);
    } catch (error) {
      console.error("患者情報の取得エラー:", error);
      toast({
        title: "エラー",
        description: "患者情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchPatients = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchPatients();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`patient_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("患者検索エラー:", error);
      toast({
        title: "エラー",
        description: "患者検索に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchPatients, toast]);

  const createPatient = async (patientData: Omit<Patient, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => [data, ...prev]);
      toast({
        title: "成功",
        description: "患者情報を作成しました",
      });

      return data;
    } catch (error) {
      console.error("患者作成エラー:", error);
      toast({
        title: "エラー",
        description: "患者情報の作成に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "成功",
        description: "患者情報を更新しました",
      });

      return data;
    } catch (error) {
      console.error("患者更新エラー:", error);
      toast({
        title: "エラー",
        description: "患者情報の更新に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPatients(prev => prev.filter(p => p.id !== id));
      toast({
        title: "成功",
        description: "患者情報を削除しました",
      });
    } catch (error) {
      console.error("患者削除エラー:", error);
      toast({
        title: "エラー",
        description: "患者情報の削除に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    fetchPatients,
    searchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
