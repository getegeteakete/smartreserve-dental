// AI歯科衛生士「さくら」のアバターコンポーネント
interface DentalReceptionistAvatarProps {
  className?: string;
  size?: number;
}

export const DentalReceptionistAvatar = ({ 
  className = "", 
  size = 40 
}: DentalReceptionistAvatarProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 背景円 - ピンクグラデーション */}
      <defs>
        <radialGradient id="bgGradient">
          <stop offset="0%" stopColor="#FFF0F5" />
          <stop offset="100%" stopColor="#FFE4E9" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" stroke="#FF69B4" strokeWidth="2"/>
      
      {/* 顔 */}
      <circle cx="50" cy="42" r="26" fill="#FFDAB9"/>
      
      {/* 衛生キャップ（ピンク） */}
      <ellipse cx="50" cy="22" rx="28" ry="18" fill="#FFB6D9"/>
      <path
        d="M 22 28 Q 22 32 25 34 L 75 34 Q 78 32 78 28 L 75 26 Q 72 24 50 24 Q 28 24 25 26 Z"
        fill="#FFA0C9"
      />
      
      {/* キャップの桜マーク */}
      <circle cx="50" cy="22" r="5" fill="#FFFFFF" opacity="0.8"/>
      <text x="50" y="25" fontSize="6" textAnchor="middle" fill="#FF69B4" fontWeight="bold">🌸</text>
      
      {/* 髪の毛（サイド） */}
      <path
        d="M 24 32 Q 22 38 23 44 L 26 42 Q 25 36 26 32 Z"
        fill="#5D4037"
      />
      <path
        d="M 76 32 Q 78 38 77 44 L 74 42 Q 75 36 74 32 Z"
        fill="#5D4037"
      />
      
      {/* 前髪 */}
      <path
        d="M 26 30 Q 30 28 35 28 Q 38 28 40 29"
        stroke="#5D4037"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 60 29 Q 62 28 65 28 Q 70 28 74 30"
        stroke="#5D4037"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 優しい目 */}
      <ellipse cx="38" cy="40" rx="3.5" ry="4.5" fill="#4A3428"/>
      <ellipse cx="62" cy="40" rx="3.5" ry="4.5" fill="#4A3428"/>
      
      {/* 目のハイライト（キラキラ） */}
      <circle cx="39" cy="39" r="1.2" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="63" cy="39" r="1.2" fill="#FFFFFF" opacity="0.9"/>
      
      {/* まつ毛 */}
      <path d="M 34 37 Q 38 35 42 37" stroke="#4A3428" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 58 37 Q 62 35 66 37" stroke="#4A3428" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      
      {/* 眉毛（優しい形） */}
      <path d="M 32 34 Q 38 32 43 33" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 57 33 Q 62 32 68 34" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      
      {/* マスク（歯科衛生士らしく） */}
      <path
        d="M 30 48 Q 28 52 30 56 Q 35 60 50 60 Q 65 60 70 56 Q 72 52 70 48 L 65 46 Q 60 48 50 48 Q 40 48 35 46 Z"
        fill="#E0F2FF"
        stroke="#90CAF9"
        strokeWidth="1"
      />
      
      {/* マスクのプリーツ */}
      <line x1="32" y1="50" x2="68" y2="50" stroke="#B3D9F2" strokeWidth="0.5"/>
      <line x1="32" y1="53" x2="68" y2="53" stroke="#B3D9F2" strokeWidth="0.5"/>
      <line x1="32" y1="56" x2="68" y2="56" stroke="#B3D9F2" strokeWidth="0.5"/>
      
      {/* マスクの紐 */}
      <path d="M 30 49 Q 20 48 18 45" stroke="#90CAF9" strokeWidth="1" fill="none"/>
      <path d="M 70 49 Q 80 48 82 45" stroke="#90CAF9" strokeWidth="1" fill="none"/>
      
      {/* 笑顔の目（目尻が下がる） */}
      <path d="M 34 42 Q 38 44 42 42" stroke="#4A3428" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M 58 42 Q 62 44 66 42" stroke="#4A3428" strokeWidth="1" fill="none" strokeLinecap="round"/>
      
      {/* 頬の赤み */}
      <ellipse cx="32" cy="47" rx="6" ry="4" fill="#FFB6C1" opacity="0.5"/>
      <ellipse cx="68" cy="47" rx="6" ry="4" fill="#FFB6C1" opacity="0.5"/>
      
      {/* 首 */}
      <path d="M 40 64 Q 43 70 50 70 Q 57 70 60 64" fill="#FFDAB9"/>
      
      {/* 白衣（ピンクのライン入り） */}
      <path
        d="M 32 68 Q 25 72 23 85 L 23 98 L 38 98 L 40 72 Q 43 70 50 70 Q 57 70 60 72 L 62 98 L 77 98 L 77 85 Q 75 72 68 68 Q 60 66 50 66 Q 40 66 32 68 Z"
        fill="#FFFFFF"
        stroke="#FFB6D9"
        strokeWidth="1"
      />
      
      {/* 襟（Vネック） */}
      <path
        d="M 40 72 Q 43 70 50 70 Q 57 70 60 72 L 58 76 Q 54 73 50 73 Q 46 73 42 76 Z"
        fill="#FFE4F1"
      />
      
      {/* ピンクのライン装飾 */}
      <line x1="25" y1="75" x2="38" y2="75" stroke="#FFB6D9" strokeWidth="2"/>
      <line x1="62" y1="75" x2="75" y2="75" stroke="#FFB6D9" strokeWidth="2"/>
      
      {/* 名札「さくら」 */}
      <rect x="44" y="78" width="18" height="10" rx="2" fill="#FFFFFF" stroke="#FF69B4" strokeWidth="1"/>
      <text x="53" y="85" fontSize="5" textAnchor="middle" fill="#FF69B4" fontWeight="bold">さくら</text>
      
      {/* ポケット */}
      <rect x="40" y="86" width="8" height="8" rx="1" fill="#FFE4F1" stroke="#FFB6D9" strokeWidth="0.5"/>
      <rect x="52" y="86" width="8" height="8" rx="1" fill="#FFE4F1" stroke="#FFB6D9" strokeWidth="0.5"/>
      
      {/* 歯ブラシのマーク（ポケットから） */}
      <line x1="44" y1="86" x2="44" y2="83" stroke="#4FC3F7" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="44" cy="82" r="1.5" fill="#4FC3F7"/>
      
      {/* 桜の花びら装飾 */}
      <g opacity="0.7">
        <text x="72" y="82" fontSize="8" fill="#FFB6D9">🌸</text>
        <text x="28" y="88" fontSize="6" fill="#FFB6D9">🌸</text>
      </g>
      
      {/* キラキラ効果 */}
      <g opacity="0.6">
        <path d="M 20 35 L 21 36 L 20 37 L 19 36 Z" fill="#FFD700"/>
        <path d="M 80 38 L 81 39 L 80 40 L 79 39 Z" fill="#FFD700"/>
        <path d="M 85 70 L 86 71 L 85 72 L 84 71 Z" fill="#FFD700"/>
      </g>
    </svg>
  );
};



