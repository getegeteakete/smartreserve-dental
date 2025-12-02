import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";

// 記事データ（BlogSectionと同じ）
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "ホワイトニングの効果を最大化する方法",
    excerpt: "ホワイトニングの効果を長持ちさせるための正しいケア方法をご紹介します。",
    content: "ホワイトニング後は、着色しやすい飲み物や食べ物を避け、定期的なメンテナンスが重要です。特に、コーヒーや紅茶、赤ワインなどの飲み物は、歯に着色しやすいため注意が必要です。また、喫煙も歯の着色の原因となるため、ホワイトニング後は控えることをお勧めします。\n\n定期的なメンテナンスとして、ホームホワイトニングキットを使用するか、歯科医院でのメンテナンスを受けましょう。適切なケアを行うことで、ホワイトニングの効果を長く維持することができます。",
    author: "歯科衛生士 田中",
    date: "2024年12月15日",
    readTime: "5分",
    category: "ホワイトニング",
    image: "/images/whitening-bg.jpg",
    tags: ["ホワイトニング", "ケア", "メンテナンス"]
  },
  {
    id: 2,
    title: "精密検査で分かること",
    excerpt: "精密検査では、肉眼では見えない歯の状態を詳しく調べることができます。",
    content: "精密検査では、レントゲン写真や口腔内カメラを使用して、虫歯や歯周病の早期発見が可能です。特に、レントゲン写真では、目に見えない部分の虫歯や、歯の根元の状態、顎の骨の状態などを詳しく確認することができます。\n\n口腔内カメラでは、拡大して歯の表面の状態を確認でき、小さな虫歯や初期の虫歯も発見できます。これらの検査により、早期に治療を行うことができ、歯を削る量を最小限に抑えることができます。",
    author: "院長 佐藤",
    date: "2024年12月10日",
    readTime: "7分",
    category: "精密検査",
    image: "/images/precision-examination-bg.jpg",
    tags: ["精密検査", "早期発見", "予防"]
  },
  {
    id: 3,
    title: "PMTCで得られる5つの効果",
    excerpt: "プロによる歯のクリーニング（PMTC）で得られる効果を詳しく解説します。",
    content: "PMTCは、歯科医院で行うプロフェッショナルな歯のクリーニングです。自宅の歯磨きでは落とせない汚れを除去し、以下の5つの効果が期待できます。\n\n1. 虫歯の予防：プラークや歯石を除去することで、虫歯の原因菌を減らします。\n2. 歯周病の予防：歯周ポケット内のプラークを除去し、歯周病を予防します。\n3. 口臭の改善：歯垢や歯石が原因の口臭を改善します。\n4. 歯の白さの維持：着色汚れを除去し、歯の本来の白さを保ちます。\n5. 歯の健康維持：定期的なPMTCにより、歯と歯茎の健康を維持します。",
    author: "歯科衛生士 山田",
    date: "2024年12月5日",
    readTime: "6分",
    category: "PMTC",
    image: "/images/first-time-bg.jpg",
    tags: ["PMTC", "クリーニング", "予防"]
  },
  {
    id: 4,
    title: "初診で不安な方へ",
    excerpt: "初めての歯科医院での受診で不安に感じる方へ、安心してご来院いただくための情報をお伝えします。",
    content: "初診では、まずお口の状態を詳しく調べ、患者様のご希望やお悩みをお聞きします。無理な治療は行わず、患者様のペースに合わせて進めていきます。\n\n診察では、口腔内の写真を撮影し、必要に応じてレントゲン写真も撮影します。その後、診察結果をもとに、治療方針をご説明します。患者様のご質問にも丁寧にお答えしますので、不安な点がございましたら、お気軽にお聞きください。\n\n当院では、患者様に安心してご来院いただけるよう、スタッフ一同、心を込めてサポートいたします。",
    author: "受付 鈴木",
    date: "2024年11月28日",
    readTime: "4分",
    category: "初診",
    image: "/images/first-time-bg.jpg",
    tags: ["初診", "不安解消", "安心"]
  }
];

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ページ遷移時に最上部にスクロール（ページ下部が表示される問題を解決）
  useEffect(() => {
    // 少し遅延を入れて確実にスクロール位置をリセット
    window.scrollTo(0, 0);
    
    // モバイルブラウザでのスクロール位置の問題を回避
    setTimeout(() => {
      window.scrollTo(0, 0);
      // 再度確認
      if (window.pageYOffset !== 0) {
        window.scrollTo(0, 0);
      }
    }, 0);
  }, [id]);

  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">記事が見つかりません</h1>
            <Button onClick={() => navigate("/")}>
              トップページに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 戻るボタン */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>

          {/* 記事コンテンツ */}
          <Card>
            <div className="relative w-full h-64 md:h-96 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("画像読み込みエラー:", post.image);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <CardHeader className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </div>
                <div className="text-gray-700">
                  執筆者: {post.author}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-600 mb-6 font-medium">
                  {post.excerpt}
                </p>
                
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

