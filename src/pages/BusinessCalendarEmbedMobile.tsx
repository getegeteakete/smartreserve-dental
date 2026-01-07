
import { useEffect, useRef } from "react";
import WeeklyBusinessCalendar from "@/components/WeeklyBusinessCalendar";

const BusinessCalendarEmbedMobile = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // iframe内のコンテンツの高さを親ウィンドウに送信
    const sendHeight = () => {
      if (containerRef.current && window.parent !== window) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage(
          { type: 'calendar-embed-height', height },
          '*'
        );
      }
    };

    // 初回とリサイズ時に高さを送信
    sendHeight();
    window.addEventListener('resize', sendHeight);
    
    // MutationObserverでコンテンツの変更を監視
    const observer = new MutationObserver(sendHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      window.removeEventListener('resize', sendHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-white p-0 w-full">
      <div className="w-full mx-auto">
        <WeeklyBusinessCalendar />
      </div>
    </div>
  );
};

export default BusinessCalendarEmbedMobile;
