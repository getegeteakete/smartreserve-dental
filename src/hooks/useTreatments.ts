
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Treatment {
  id: string;
  name: string;
  description: string | null;
  fee: number;
  duration: number;
  created_at: string;
}

export const useTreatments = () => {
  return useQuery<Treatment[]>({
    queryKey: ["treatments"],
    queryFn: async () => {
      console.log("診療メニューを取得しています...");
      
      try {
        const { data: supabaseData, error } = await supabase
          .from("treatments")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Supabaseからの取得エラー:", error);
          return getFallbackTreatments();
        }

        if (supabaseData && supabaseData.length > 0) {
          console.log("Supabaseから診療メニューを取得しました:", supabaseData.length);
          return supabaseData.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            fee: item.fee,
            duration: item.duration,
            created_at: item.created_at
          }));
        }

        console.log("Supabaseにデータがないため、デフォルトデータを使用します");
        return getFallbackTreatments();
        
      } catch (error) {
        console.error("診療メニュー取得エラー:", error);
        return getFallbackTreatments();
      }
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
};

const getFallbackTreatments = (): Treatment[] => [
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
];
