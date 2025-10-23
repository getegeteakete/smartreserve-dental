import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  age: number;
  treatment: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "田中 美咲",
    age: 28,
    treatment: "ホワイトニング",
    rating: 5,
    comment: "初めてのホワイトニングでしたが、スタッフの方がとても丁寧に説明してくださり、安心して受けることができました。結果も期待以上で、とても満足しています！",
    date: "2024年12月"
  },
  {
    id: 2,
    name: "佐藤 健太",
    age: 35,
    treatment: "精密検査",
    rating: 5,
    comment: "精密検査を受けて、自分の歯の状態を詳しく知ることができました。先生の説明も分かりやすく、今後の治療計画も明確になりました。",
    date: "2024年11月"
  },
  {
    id: 3,
    name: "山田 花子",
    age: 42,
    treatment: "PMTC",
    rating: 5,
    comment: "PMTCを受けて、歯がとてもきれいになりました。定期的に通うことで、虫歯や歯周病の予防にもなっていると実感しています。",
    date: "2024年10月"
  },
  {
    id: 4,
    name: "鈴木 太郎",
    age: 31,
    treatment: "初診相談",
    rating: 5,
    comment: "初診相談で、長年の歯の悩みを相談できました。先生が親身になって話を聞いてくださり、適切な治療法を提案していただきました。",
    date: "2024年9月"
  }
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section 
      ref={sectionRef}
      className={`py-16 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            お客様の声
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            実際にご来院いただいたお客様からの貴重なご意見をご紹介いたします
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* メインのテストモニアルカード */}
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(testimonials[currentIndex].rating)}
                    <span className="text-sm text-gray-500 ml-2">
                      {testimonials[currentIndex].date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {testimonials[currentIndex].name}さん（{testimonials[currentIndex].age}歳）
                  </h3>
                  
                  <p className="text-sm text-blue-600 font-medium mb-4">
                    {testimonials[currentIndex].treatment}を受診
                  </p>
                  
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-blue-200" />
                    <p className="text-gray-700 leading-relaxed pl-4">
                      {testimonials[currentIndex].comment}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ナビゲーションボタン */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="rounded-full p-2 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="rounded-full p-2 hover:bg-blue-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* すべてのテストモニアルをグリッド表示 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className={`bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                index === currentIndex ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  
                  <div className="flex justify-center gap-1 mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {testimonial.name}さん
                  </h4>
                  
                  <p className="text-sm text-blue-600 mb-3">
                    {testimonial.treatment}
                  </p>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {testimonial.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
