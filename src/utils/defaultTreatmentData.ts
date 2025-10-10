
// デフォルトカテゴリデータ
export const defaultCategories = [
  {
    name: "初診",
    description: "初回の診察・相談",
    display_order: 1,
    image_url: "/lovable-uploads/23dd7cf2-1136-4319-a747-b59ff65618a9.png"
  },
  {
    name: "精密検査",
    description: "詳細な診断のための検査",
    display_order: 2,
    image_url: "/lovable-uploads/70893a9e-d0ea-49bd-ba4b-f6b20d984c28.png"
  },
  {
    name: "ホワイトニング",
    description: "歯の美白治療",
    display_order: 3,
    image_url: "/lovable-uploads/b3452854-e2f9-4414-b8fd-41f432c466ff.png"
  },
  {
    name: "PMTC",
    description: "プロフェッショナルクリーニング",
    display_order: 4,
    image_url: "/lovable-uploads/87d8b2fd-ead0-49b4-bb0e-89abad0f0380.png"
  }
];

export const defaultTreatments = [
  {
    name: "初診の方【無料相談】",
    description: "無料相談（30分）　内容：口腔内診察・矯正治療の概要説明（予想される治療方法や期間などについて）・装置の種類ならびに費用の説明・お支払い方法など　＊正確な診断は精密検査を受けないとできません　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 0,
    duration: 30,
    category_name: "初診", // カテゴリ名で参照
  },
  {
    name: "初診有料相談【60分】",
    description: "有料相談（60分）料金3,300円　内容：無料相談に加え、口腔内スキャナ撮影を行い、その場でAIを使った大まかな治療シミュレーションを行います。ただしシミュレーションは診断結果に基づいたものではありませんので、あくまで仕上がりのイメージとなります。　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 3300,
    duration: 60,
    category_name: "初診",
  },
  {
    name: "精密検査予約【60分】",
    description: "精密検査（60分）料金38,500円　内容：相談を受けられた方で、精密検査を希望される方はこちらから予約をお願いします。　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 38500,
    duration: 60,
    category_name: "精密検査",
  },
  {
    name: "ホームホワイトニング【60分】",
    description: "ホームホワイトニング（60分）料金33,000円　内容：薬液とマウスピースを使って、自宅で行うホワイトニングです。初回はカウンセリングとホワイトニング用マウスピースの型取りをします。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 33000,
    duration: 60,
    category_name: "ホワイトニング",
  },
  {
    name: "オフィスホワイトニング（1回コース）【90分】",
    description: "オフィスホワイトニング（90分）料金1回コース14,300円　内容：漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 14300,
    duration: 90,
    category_name: "ホワイトニング",
  },
  {
    name: "オフィスホワイトニング（2回コース）【90分】",
    description: "オフィスホワイトニング（90分）料金2回コース26,400円　内容：漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 26400,
    duration: 90,
    category_name: "ホワイトニング",
  },
  {
    name: "ダブルホワイトニング【120分】",
    description: "ダブルホワイトニング（120分）料金46,200円　内容：初回オフィスホワイトニングとホームホワイトニング用マウスピースの型取りを行います。　※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 46200,
    duration: 120,
    category_name: "ホワイトニング",
  },
  {
    name: "PMTC【60分】",
    description: "PMTC（60分）料金5,500円　内容：プロによるお口の全体のクリーニングです　※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 5500,
    duration: 60,
    category_name: "PMTC",
  }
];

export const ensureDefaultTreatments = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  
  try {
    // 既存のカテゴリを確認
    const { data: existingCategories, error: categorySelectError } = await supabase
      .from("treatment_categories")
      .select("name, id");
    
    if (categorySelectError) {
      throw categorySelectError;
    }
    
    // カテゴリが存在しない場合、デフォルトカテゴリを作成
    const categoryMap: Record<string, string> = {};
    
    if (!existingCategories || existingCategories.length === 0) {
      // デフォルトカテゴリを作成
      for (const category of defaultCategories) {
        const { data: insertedCategory, error: categoryInsertError } = await supabase
          .from("treatment_categories")
          .insert(category)
          .select("id, name")
          .single();
        
        if (categoryInsertError) {
          throw categoryInsertError;
        }
        
        categoryMap[category.name] = insertedCategory.id;
      }
    } else {
      // 既存のカテゴリマップを作成
      existingCategories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });
    }
    
    // 既存の診療メニューを確認
    const { data: existingTreatments, error: selectError } = await supabase
      .from("treatments")
      .select("name, id");
    
    if (selectError) {
      throw selectError;
    }
    
    // データベースが完全に空の場合のみ、デフォルトデータを一括挿入
    if (!existingTreatments || existingTreatments.length === 0) {
      console.log("データベースが空のため、デフォルト診療メニューを初期化します");
      
      // カテゴリIDを適用した診療メニューデータを作成
      const treatmentsWithCategoryIds = defaultTreatments.map(treatment => ({
        name: treatment.name,
        description: treatment.description,
        fee: treatment.fee,
        duration: treatment.duration,
        category_id: categoryMap[treatment.category_name] || null
      }));
      
      const { data: insertedData, error: insertError } = await supabase
        .from("treatments")
        .insert(treatmentsWithCategoryIds)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      console.log("デフォルト診療メニューの初期化が完了しました");
      return;
    }
    
    // 既存のデータがある場合は、自動復元は行わない
    // 管理者が削除したデータは復元しない
    console.log("既存の診療メニューが存在するため、デフォルトデータの自動復元は行いません");
    
  } catch (error) {
    console.error("ensureDefaultTreatments エラー:", error);
    // エラーが発生してもアプリケーションを停止させない
  }
};
