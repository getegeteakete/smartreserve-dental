
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleData, SpecialScheduleData, TreatmentLimit } from "@/types/schedule";

export const useScheduleData = (selectedYear: number, selectedMonth: number) => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialScheduleData[]>([]);
  const [treatmentLimits, setTreatmentLimits] = useState<TreatmentLimit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabase as any).rpc('get_clinic_schedules', {
        p_year: selectedYear,
        p_month: selectedMonth
      });

      if (error) {
        console.error("スケジュール取得エラー:", error);
        setSchedules([]);
      } else {
        setSchedules(data || []);
      }
    } catch (error: any) {
      console.error("スケジュール取得エラー:", error);
      setSchedules([]);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `スケジュールの取得に失敗しました: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, toast]);

  const fetchSpecialSchedules = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any).rpc('get_special_clinic_schedules', {
        p_year: selectedYear,
        p_month: selectedMonth
      });

      if (error) {
        console.error("特別診療日取得エラー:", error);
        setSpecialSchedules([]);
      } else {
        setSpecialSchedules(data || []);
      }
    } catch (error: any) {
      console.error("特別診療日取得エラー:", error);
      setSpecialSchedules([]);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `特別診療日の取得に失敗しました: ${error.message}`,
      });
    }
  }, [selectedYear, selectedMonth, toast]);

  const fetchTreatmentLimits = useCallback(async () => {
    try {
      console.log("fetchTreatmentLimits開始");
      const { data, error } = await (supabase as any).rpc('get_treatment_limits');

      console.log("get_treatment_limits RPC結果:", { data, error });

      if (error) {
        console.error("診療種別制限取得エラー:", error);
        setTreatmentLimits([]);
      } else {
        console.log("診療種別制限データ取得成功:", data);
        setTreatmentLimits(data || []);
      }
    } catch (error: any) {
      console.error("診療種別制限取得エラー:", error);
      setTreatmentLimits([]);
      toast({
        variant: "destructive",
        title: "エラー",
        description: `診療種別制限の取得に失敗しました: ${error.message}`,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchSchedules();
    fetchSpecialSchedules();
    fetchTreatmentLimits();
  }, [fetchSchedules, fetchSpecialSchedules, fetchTreatmentLimits]);

  return {
    schedules,
    setSchedules,
    specialSchedules,
    treatmentLimits,
    setTreatmentLimits,
    loading,
    fetchSchedules,
    fetchSpecialSchedules,
    fetchTreatmentLimits,
  };
};
