import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Heart, Shield, Sparkles } from 'lucide-react';

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
    content: "ホワイトニング後は、着色しやすい飲み物や食べ物を避け、定期的なメンテナンスが重要です...",
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
    content: "精密検査では、レントゲン写真や口腔内カメラを使用して、虫歯や歯周病の早期発見が可能です...",
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
    content: "PMTCは、歯科医院で行うプロフェッショナルな歯のクリーニングです。自宅の歯磨きでは落とせない汚れを除去し...",
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
    content: "初診では、まずお口の状態を詳しく調べ、患者様のご希望やお悩みをお聞きします。無理な治療は行わず...",
    author: "受付 鈴木",
    date: "2024年11月28日",
    readTime: "4分",
    category: "初診",
    image: "/images/first-time-bg.jpg",
    tags: ["初診", "不安解消", "安心"]
  }
];

export const BlogSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ホワイトニング':
        return <Sparkles className="h-4 w-4" />;
      case '精密検査':
        return <Shield className="h-4 w-4" />;
      case 'PMTC':
        return <Heart className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ホワイトニング':
        return 'bg-pink-100 text-pink-800';
      case '精密検査':
        return 'bg-blue-100 text-blue-800';
      case 'PMTC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`py-16 bg-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            歯科ブログ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            歯の健康に関する最新情報や、当院の治療について詳しくご紹介します
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card 
              key={post.id}
              className={`bg-white shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group ${
                isVisible ? 'animate-in fade-in slide-in-from-bottom-5' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                    {getCategoryIcon(post.category)}
                    {post.category}
                  </span>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                >
                  続きを読む
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* もっと見るボタン */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
          >
            すべての記事を見る
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
