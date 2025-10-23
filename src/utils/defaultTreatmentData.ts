
// デフォルトカテゴリデータ
export const defaultCategories = [
  {
    name: "初めての方",
    description: "初診の方【無料相談・有料相談】スタッフが丁寧にサポート まずはお悩みをお聞かせください",
    display_order: 1,
    image_url: "/images/first-time-bg.jpg"
  },
  {
    name: "精密検査予約",
    description: "初診相談済みで、精密検査を希望される方へ。精密検査の結果を元に、あなたに最適な治療法をご提案します",
    display_order: 2,
    image_url: "/images/precision-examination-bg.jpg"
  },
  {
    name: "ホワイトニング予約",
    description: "ホワイトニングを受けたい方へ。白く輝く歯で、自信あふれる笑顔に",
    display_order: 3,
    image_url: "/images/whitening-bg.jpg"
  },
  {
    name: "PMTC予約",
    description: "プロによるお口の全体クリーニング。バイオフィルムを取り除いた後、フッ素、エナメルトリートメント、舌クリーニングなど、お口の状態に合わせて必要なケアを行います",
    display_order: 4,
    image_url: "http://xn--68j7a2dtb9053amj1aoqai3wdd676ltle.com/wp-content/uploads/2024/03/touin10.jpg"
  }
];

export const defaultTreatments = [
  {
    name: "初診無料相談（30分）",
    description: "・無料相談（30分）\n内容：口腔内診察・矯正治療の概要説明（予想される治療方法や期間などについて）・装置の種類ならびに費用の説明・お支払い方法など\n＊正確な診断は精密検査を受けないとできません\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 0,
    duration: 30,
    category_name: "初めての方",
  },
  {
    name: "初診有料相談【60分】",
    description: "・有料相談（60分）料金3,300円\n内容：無料相談に加え、口腔内スキャナ撮影を行い、その場でAIを使った大まかな治療シミュレーションを行います。ただしシミュレーションは診断結果に基づいたものではありませんので、あくまで仕上がりのイメージとなります。\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 3300,
    duration: 60,
    category_name: "初めての方",
  },
  {
    name: "精密検査予約【60分】",
    description: "・精密検査（60分）料金38,500円\n内容：相談を受けられた方で、精密検査を希望される方はこちらから予約をお願いします。\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 38500,
    duration: 60,
    category_name: "精密検査予約",
  },
  {
    name: "ホームホワイトニング【60分】",
    description: "ホームホワイトニング（60分）料金33,000円\n\n内容：薬液とマウスピースを使って、自宅で行うホワイトニングです。初回はカウンセリングとホワイトニング用マウスピースの型取りをします。\n※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 33000,
    duration: 60,
    category_name: "ホワイトニング予約",
  },
  {
    name: "オフィスホワイトニング【90分】",
    description: "オフィスホワイトニング（90分）\n料金１回コース14,300円/２回コース26,400円\n\n内容：漂白効果のある薬剤を歯の表面に塗り、光を当てることにより漂白を行う、歯科医院で行うホワイトニングです。\n※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 14300,
    duration: 90,
    category_name: "ホワイトニング予約",
  },
  {
    name: "ダブルホワイトニング【120分】",
    description: "ダブルホワイトニング（120分）料金46,200円\n\n内容：初回オフィスホワイトニングとホームホワイトニング用マウスピースの型取りを行います。\n※歯石やプラークが多量についている場合など、ホワイトニング効果を出すため、事前の歯石取りやクリーニングが必要となることがあります（保険診療可）\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 46200,
    duration: 120,
    category_name: "ホワイトニング予約",
  },
  {
    name: "PMTC【60分】",
    description: "PMTC（60分）料金5,500円\n\n内容：プロによるお口の全体のクリーニングです\n※現在、WEBからは予約が大変取りにくくなっておりますが、直接お電話いただきますとご希望の日時でのご予約を承ることが出来る可能性があります。お急ぎの方は是非お電話下さいませ。",
    fee: 5500,
    duration: 60,
    category_name: "PMTC予約",
  }
];

// 強制的にデフォルトデータを更新する関数
export const forceUpdateDefaultTreatments = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  
  try {
    console.log("強制的にデフォルト診療メニューを更新します");
    
    // 既存のカテゴリを確認
    const { data: existingCategories, error: categorySelectError } = await supabase
      .from("treatment_categories")
      .select("name, id");
    
    if (categorySelectError) {
      throw categorySelectError;
    }
    
    // カテゴリマップを作成
    const categoryMap: Record<string, string> = {};
    
    // 新しいカテゴリを作成
    for (const category of defaultCategories) {
      const existingCategory = existingCategories?.find(cat => cat.name === category.name);
      
      if (existingCategory) {
        categoryMap[category.name] = existingCategory.id;
      } else {
        const { data: insertedCategory, error: categoryInsertError } = await supabase
          .from("treatment_categories")
          .insert(category)
          .select("id, name")
          .single();
        
        if (categoryInsertError) {
          console.error("カテゴリ作成エラー:", categoryInsertError);
          continue;
        }
        
        categoryMap[category.name] = insertedCategory.id;
      }
    }
    
    // 既存の治療を確認
    const { data: existingTreatments } = await supabase
      .from("treatments")
      .select("id, name");

    // 既存の治療を削除
    if (existingTreatments && existingTreatments.length > 0) {
      const { error: deleteError } = await supabase
        .from("treatments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // 全件削除の回避策
      
      if (deleteError) {
        console.error("既存データ削除エラー:", deleteError);
      } else {
        console.log("既存の治療データを削除しました:", existingTreatments.length, "件");
      }
    }
    
    // 新しい治療データを挿入（重複チェック付き）
    const treatmentsWithCategoryIds = defaultTreatments.map(treatment => ({
      name: treatment.name,
      description: treatment.description,
      fee: treatment.fee,
      duration: treatment.duration,
      category_id: categoryMap[treatment.category_name] || null
    }));

    // 重複をさらにチェック
    const uniqueTreatments = treatmentsWithCategoryIds.filter((treatment, index, self) => 
      index === self.findIndex(t => t.name === treatment.name)
    );
    
    console.log("挿入する治療データ:", uniqueTreatments.length, "件");
    
    const { data: insertedData, error: insertError } = await supabase
      .from("treatments")
      .insert(uniqueTreatments)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    console.log("デフォルト診療メニューの強制更新が完了しました");
    return true;
    
  } catch (error) {
    console.error("forceUpdateDefaultTreatments エラー:", error);
    return false;
  }
};

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
