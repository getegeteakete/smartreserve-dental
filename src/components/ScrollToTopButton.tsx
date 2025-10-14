import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  showAfterScroll?: number;
  className?: string;
}

export const ScrollToTopButton = ({ 
  showAfterScroll = 300,
  className = '' 
}: ScrollToTopButtonProps) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > showAfterScroll) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!showButton) return null;

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-sky-500 hover:bg-sky-600 text-white transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-5 ${className}`}
      aria-label="ページトップへ戻る"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
};



