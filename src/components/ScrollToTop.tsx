import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ページ遷移時に自動的にスクロール位置を最上部にリセットするコンポーネント
 * 特にモバイルブラウザでのスクロール位置の問題を解決します
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ページ遷移時に最上部にスクロール
    window.scrollTo(0, 0);
    
    // モバイルブラウザでのスクロール位置の問題を回避するため、
    // 少し遅延を入れて再度確認
    const timer = setTimeout(() => {
      if (window.pageYOffset !== 0) {
        window.scrollTo(0, 0);
      }
      // モバイルブラウザ向けの追加処理
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

