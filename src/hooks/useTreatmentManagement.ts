
import { useState } from "react";
import { Treatment } from "./useTreatments";
import { toast } from "sonner";

export const useTreatmentManagement = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: "initial-free",
      name: "初診の方【無料相談】",
      description: "無料相談（30分）　内容：口腔内診察・矯正治療の概要説明（予想される治療方法や期間などについて）・装置の種類ならびに費用の説明・お支払い方法など　＊正確な診断は精密検査を受けないとできません　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 0,
      duration: 30,
      created_at: new Date().toISOString()
    },
    {
      id: "initial-paid",
      name: "初診有料相談【60分】",
      description: "有料相談（60分）料金3,300円　内容：無料相談に加え、口腔内スキャナ撮影を行い、その場でAIを使った大まかな治療シミュレーションを行います。ただしシミュレーションは診断結果に基づいたものではありませんので、あくまで仕上がりのイメージとなります。　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 3300,
      duration: 60,
      created_at: new Date().toISOString()
    },
    {
      id: "detailed-exam",
      name: "精密検査予約【60分】",
      description: "精密検査（60分）料金38,500円　内容：相談を受けられた方で、精密検査を希望される方はこちらから予約をお願いします。　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 38500,
      duration: 60,
      created_at: new Date().toISOString()
    },
    {
      id: "home-whitening",
      name: "ホームホワイトニング【60分】",
      description: "ホームホワイトニング（60分）料金33,000円　内容：薬液とマウスピースを使って、自宅で行うホワイトニングです。初回はカウンセリングとホワイトニング用マウスピースの型取りをします。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 33000,
      duration: 60,
      created_at: new Date().toISOString()
    },
    {
      id: "office-whitening-1",
      name: "オフィスホワイトニング（1回コース）【90分】",
      description: "オフィスホワイトニング（90分）料金1回コース14,300円　内容：漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 14300,
      duration: 90,
      created_at: new Date().toISOString()
    },
    {
      id: "office-whitening-2",
      name: "オフィスホワイトニング（2回コース）【90分】",
      description: "オフィスホワイトニング（90分）料金2回コース26,400円　内容：漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 26400,
      duration: 90,
      created_at: new Date().toISOString()
    },
    {
      id: "double-whitening",
      name: "ダブルホワイトニング【120分】",
      description: "ダブルホワイトニング（120分）料金46,200円　内容：初回オフィスホワイトニングとホームホワイトニング用マウスピースの型取りを行います。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 46200,
      duration: 120,
      created_at: new Date().toISOString()
    },
    {
      id: "pmtc",
      name: "PMTC【60分】",
      description: "PMTC（60分）料金5,500円　内容：プロによるお口の全体のクリーニングです　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
      fee: 5500,
      duration: 60,
      created_at: new Date().toISOString()
    }
  ]);

  const updateTreatment = (updatedTreatment: Treatment) => {
    setTreatments(prev => 
      prev.map(treatment => 
        treatment.id === updatedTreatment.id ? updatedTreatment : treatment
      )
    );
    toast.success("診療内容を更新しました");
    console.log("診療内容を更新:", updatedTreatment);
  };

  const addTreatment = (newTreatment: Omit<Treatment, "id" | "created_at">) => {
    const treatment: Treatment = {
      ...newTreatment,
      id: `custom-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    setTreatments(prev => [...prev, treatment]);
    toast.success("新しい診療内容を追加しました");
    console.log("診療内容を追加:", treatment);
  };

  const deleteTreatment = (treatmentId: string) => {
    setTreatments(prev => prev.filter(treatment => treatment.id !== treatmentId));
    toast.success("診療内容を削除しました");
    console.log("診療内容を削除:", treatmentId);
  };

  return {
    treatments,
    updateTreatment,
    addTreatment,
    deleteTreatment
  };
};
