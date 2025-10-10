
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/hooks/usePatients";

export const syncPatientsFromAppointments = async () => {
  try {
    // 既存の患者のメールアドレスと電話番号を取得
    const { data: existingPatients, error: existingError } = await supabase
      .from("patients")
      .select("email, phone");
    
    if (existingError) {
      console.error("既存患者データ取得エラー:", existingError);
      throw existingError;
    }
    
    const existingEmails = new Set(existingPatients?.map(p => p.email).filter(Boolean) || []);
    const existingPhones = new Set(existingPatients?.map(p => p.phone).filter(Boolean) || []);
    
    // 予約データから患者情報を取得
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("patient_name, email, phone, age")
      .not("patient_name", "is", null);
    
    if (appointmentsError) {
      console.error("予約データ取得エラー:", appointmentsError);
      throw appointmentsError;
    }
    
    if (!appointments || appointments.length === 0) {
      return;
    }
    
    // 重複を除去し、新しい患者のみを抽出
    const uniquePatients = new Map();
    
    appointments.forEach(appointment => {
      // メールアドレスまたは電話番号をキーとして使用
      const key = appointment.email || appointment.phone;
      if (key && !existingEmails.has(appointment.email) && !existingPhones.has(appointment.phone)) {
        if (!uniquePatients.has(key)) {
          uniquePatients.set(key, {
            patient_name: appointment.patient_name,
            email: appointment.email,
            phone: appointment.phone,
            age: appointment.age,
          });
        }
      }
    });
    
    const newPatients = Array.from(uniquePatients.values());
    
    if (newPatients.length === 0) {
      return;
    }
    
    // 新しい患者データを一件ずつ安全に挿入
    const insertedPatients = [];
    for (const patient of newPatients) {
      try {
        const { data, error } = await supabase
          .from("patients")
          .insert([patient])
          .select()
          .single();
        
        if (error) {
          console.error("患者データ挿入エラー（個別）:", patient, error);
          // 重複エラーの場合はスキップして続行
          if (error.code === '23505') {
            continue;
          }
          throw error;
        }
        
        insertedPatients.push(data);
      } catch (error) {
        console.error("患者挿入中にエラー:", patient, error);
        // 重複エラーの場合はスキップして続行
        if (error.code === '23505') {
          continue;
        }
        // その他のエラーの場合は処理を停止
        throw error;
      }
    }
    
  } catch (error) {
    console.error("患者同期処理でエラーが発生しました:", error);
    throw error;
  }
};
