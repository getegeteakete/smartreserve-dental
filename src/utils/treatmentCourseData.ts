// 治療コースの詳細情報
export interface TreatmentCourse {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  price: string;
  fee: number;
  features: string[];
  recommendedFor: string[];
  flow: string[];
  keywords: string[];
}

export const treatmentCourses: TreatmentCourse[] = [
  // 一般歯科
  {
    id: "general-checkup",
    name: "一般歯科検診",
    category: "一般歯科",
    description: "虫歯や歯周病のチェック、歯のクリーニングを行います。定期的な検診で口腔内の健康を維持します。",
    duration: "30分",
    price: "¥3,000〜",
    fee: 3000,
    features: [
      "虫歯・歯周病のチェック",
      "歯石除去",
      "ブラッシング指導",
      "口腔内の健康状態確認"
    ],
    recommendedFor: [
      "定期的な口腔ケアをしたい方",
      "虫歯予防をしたい方",
      "歯の痛みが気になる方"
    ],
    flow: [
      "問診・カウンセリング",
      "口腔内検査",
      "歯石除去・クリーニング",
      "ブラッシング指導",
      "今後の治療計画の説明"
    ],
    keywords: ["一般", "検診", "虫歯", "歯周病", "チェック", "定期"]
  },
  {
    id: "cavity-treatment",
    name: "虫歯治療",
    category: "一般歯科",
    description: "虫歯を削って詰め物・被せ物で修復します。早期発見・早期治療が大切です。",
    duration: "30分〜60分",
    price: "¥5,000〜",
    fee: 5000,
    features: [
      "虫歯の除去",
      "詰め物・被せ物での修復",
      "痛みの少ない治療",
      "審美性を考慮した材料選択"
    ],
    recommendedFor: [
      "歯が痛む方",
      "冷たいものがしみる方",
      "黒い部分が気になる方"
    ],
    flow: [
      "虫歯の診断・検査",
      "麻酔（必要に応じて）",
      "虫歯の除去",
      "詰め物・被せ物の装着",
      "咬み合わせの調整"
    ],
    keywords: ["虫歯", "むし歯", "カリエス", "痛い", "しみる", "詰め物"]
  },

  // 予防歯科
  {
    id: "pmtc",
    name: "PMTC（プロフェッショナルクリーニング）",
    category: "予防歯科",
    description: "歯科衛生士による専門的な歯のクリーニングです。バイオフィルムを除去し、虫歯・歯周病を予防します。",
    duration: "60分",
    price: "¥8,000",
    fee: 8000,
    features: [
      "バイオフィルムの除去",
      "歯石除去",
      "フッ素塗布",
      "エナメルトリートメント",
      "舌クリーニング"
    ],
    recommendedFor: [
      "予防歯科に力を入れたい方",
      "歯周病が気になる方",
      "口臭が気になる方",
      "定期的なメンテナンスをしたい方"
    ],
    flow: [
      "口腔内診査",
      "歯石除去",
      "バイオフィルム除去",
      "研磨・フッ素塗布",
      "ホームケア指導"
    ],
    keywords: ["PMTC", "クリーニング", "予防", "歯石", "メンテナンス", "定期検診"]
  },
  {
    id: "fluoride-treatment",
    name: "フッ素塗布",
    category: "予防歯科",
    description: "歯の表面にフッ素を塗布し、虫歯予防効果を高めます。特にお子様におすすめです。",
    duration: "15分",
    price: "¥2,000",
    fee: 2000,
    features: [
      "虫歯予防効果",
      "歯質の強化",
      "初期虫歯の進行抑制",
      "痛みのない処置"
    ],
    recommendedFor: [
      "お子様の虫歯予防",
      "虫歯になりやすい方",
      "矯正治療中の方"
    ],
    flow: [
      "歯のクリーニング",
      "歯面の乾燥",
      "フッ素塗布",
      "30分間飲食を控える"
    ],
    keywords: ["フッ素", "予防", "虫歯予防", "子供", "お子様"]
  },

  // 矯正歯科
  {
    id: "orthodontics-consultation-free",
    name: "矯正無料相談",
    category: "矯正歯科",
    description: "矯正治療の概要、治療方法、期間、費用について無料でご相談いただけます。",
    duration: "30分",
    price: "無料",
    fee: 0,
    features: [
      "口腔内診察",
      "矯正治療の概要説明",
      "治療方法・期間の説明",
      "装置の種類説明",
      "費用・支払い方法の説明"
    ],
    recommendedFor: [
      "矯正治療を検討している方",
      "歯並びが気になる方",
      "費用について知りたい方"
    ],
    flow: [
      "問診・カウンセリング",
      "口腔内診察",
      "治療方法の説明",
      "費用・期間の説明",
      "質疑応答"
    ],
    keywords: ["矯正", "相談", "無料", "歯並び", "費用", "初診"]
  },
  {
    id: "orthodontics-consultation-paid",
    name: "矯正有料相談（AI シミュレーション付き）",
    category: "矯正歯科",
    description: "無料相談に加え、口腔内スキャナーとAIを使った治療シミュレーションを行います。",
    duration: "45分",
    price: "¥5,000",
    fee: 5000,
    features: [
      "無料相談のすべての内容",
      "口腔内スキャナー撮影",
      "AI治療シミュレーション",
      "治療後の予想歯並び確認",
      "より具体的な治療計画"
    ],
    recommendedFor: [
      "治療後のイメージを見たい方",
      "より詳しい相談をしたい方",
      "本格的に矯正を検討している方"
    ],
    flow: [
      "問診・カウンセリング",
      "口腔内スキャナー撮影",
      "AIシミュレーション",
      "治療計画の提案",
      "費用・期間の詳細説明"
    ],
    keywords: ["矯正", "相談", "AI", "シミュレーション", "口腔内スキャナー", "歯並び"]
  },
  {
    id: "orthodontics-detailed-exam",
    name: "矯正精密検査",
    category: "矯正歯科",
    description: "レントゲン撮影、歯型採取など詳細な検査を行い、具体的な治療計画を立案します。",
    duration: "60分",
    price: "¥10,000",
    fee: 10000,
    features: [
      "レントゲン撮影（パノラマ・セファロ）",
      "口腔内・顔面写真撮影",
      "歯型採取または口腔内スキャン",
      "咬合診査",
      "詳細な治療計画の立案"
    ],
    recommendedFor: [
      "矯正相談を受けられた方",
      "本格的に治療を開始したい方"
    ],
    flow: [
      "各種撮影・検査",
      "データ分析",
      "治療計画の立案",
      "検査結果の説明",
      "治療開始時期の相談"
    ],
    keywords: ["矯正", "精密検査", "レントゲン", "歯型", "治療計画"]
  },

  // 審美歯科・ホワイトニング
  {
    id: "home-whitening",
    name: "ホームホワイトニング",
    category: "審美歯科",
    description: "自宅で行うホワイトニングです。マウスピースと薬剤を使い、自分のペースで白くできます。",
    duration: "初回30分（型取り）+ 自宅2週間",
    price: "¥25,000",
    fee: 25000,
    features: [
      "カスタムメイドマウスピース",
      "専用ホワイトニングジェル",
      "自宅で好きな時間に実施可能",
      "自然な白さを実現",
      "後戻りしにくい"
    ],
    recommendedFor: [
      "自分のペースで白くしたい方",
      "自然な白さを求める方",
      "後戻りを防ぎたい方"
    ],
    flow: [
      "カウンセリング・口腔内チェック",
      "マウスピースの型取り",
      "マウスピース製作（約1週間）",
      "使用方法の説明",
      "自宅でのホワイトニング（2週間）",
      "効果確認・アフターケア"
    ],
    keywords: ["ホワイトニング", "ホーム", "白い歯", "自宅", "マウスピース"]
  },
  {
    id: "office-whitening",
    name: "オフィスホワイトニング",
    category: "審美歯科",
    description: "歯科医院で行う即効性の高いホワイトニングです。1回の施術で白さを実感できます。",
    duration: "90分",
    price: "¥30,000〜¥50,000",
    fee: 30000,
    features: [
      "即効性が高い",
      "1回で効果を実感",
      "専用ライトで照射",
      "プロによる施術で安心",
      "2回コースでさらに効果アップ"
    ],
    recommendedFor: [
      "短期間で白くしたい方",
      "イベント前に白くしたい方",
      "1回で効果を実感したい方"
    ],
    flow: [
      "カウンセリング・口腔内チェック",
      "歯面清掃",
      "ホワイトニング剤塗布",
      "専用ライト照射（3回）",
      "効果確認",
      "アフターケア指導"
    ],
    keywords: ["ホワイトニング", "オフィス", "白い歯", "即効", "短期間", "イベント"]
  },
  {
    id: "double-whitening",
    name: "ダブルホワイトニング",
    category: "審美歯科",
    description: "オフィスホワイトニングとホームホワイトニングを組み合わせた最も効果的なコースです。",
    duration: "初回120分 + 自宅2週間",
    price: "¥70,000",
    fee: 70000,
    features: [
      "オフィス + ホームの相乗効果",
      "最も白く、持続性が高い",
      "理想的な白さを実現",
      "トータルサポート"
    ],
    recommendedFor: [
      "最大限の効果を求める方",
      "持続性を重視する方",
      "本格的に歯を白くしたい方"
    ],
    flow: [
      "初回オフィスホワイトニング",
      "ホームホワイトニング用型取り",
      "マウスピース製作",
      "自宅でホームホワイトニング",
      "効果確認・メンテナンス"
    ],
    keywords: ["ホワイトニング", "ダブル", "白い歯", "最高", "持続", "効果的"]
  }
];

/**
 * キーワードから治療コースを検索
 */
export const searchTreatmentCourse = (query: string): TreatmentCourse[] => {
  const lowerQuery = query.toLowerCase();
  
  return treatmentCourses.filter(course => {
    // 名前、説明、キーワードで検索
    const matchesName = course.name.toLowerCase().includes(lowerQuery);
    const matchesDescription = course.description.toLowerCase().includes(lowerQuery);
    const matchesKeywords = course.keywords.some(keyword => 
      keyword.toLowerCase().includes(lowerQuery) || 
      lowerQuery.includes(keyword.toLowerCase())
    );
    const matchesCategory = course.category.toLowerCase().includes(lowerQuery);
    
    return matchesName || matchesDescription || matchesKeywords || matchesCategory;
  });
};

/**
 * カテゴリから治療コースを取得
 */
export const getTreatmentCoursesByCategory = (category: string): TreatmentCourse[] => {
  return treatmentCourses.filter(course => course.category === category);
};

/**
 * IDから治療コースを取得
 */
export const getTreatmentCourseById = (id: string): TreatmentCourse | undefined => {
  return treatmentCourses.find(course => course.id === id);
};






