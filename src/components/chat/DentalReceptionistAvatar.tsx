// 歯科受付スタッフのアバターコンポーネント
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
      {/* 背景円 */}
      <circle cx="50" cy="50" r="48" fill="#E8F4FA" stroke="#60A5FA" strokeWidth="2"/>
      
      {/* 顔 */}
      <circle cx="50" cy="45" r="28" fill="#FFE4CC"/>
      
      {/* 髪（ショートヘア） */}
      <path
        d="M 25 40 Q 22 25 35 20 Q 45 15 55 18 Q 68 20 73 30 Q 75 38 73 45 L 70 42 Q 68 30 60 25 Q 50 20 40 23 Q 30 28 27 40 Z"
        fill="#3B3024"
      />
      
      {/* 前髪 */}
      <path
        d="M 30 35 Q 32 28 38 26 Q 43 25 48 26 Q 52 27 55 30"
        fill="#3B3024"
        stroke="#3B3024"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* 左目 */}
      <ellipse cx="40" cy="42" rx="3" ry="4" fill="#2C2416"/>
      
      {/* 右目 */}
      <ellipse cx="60" cy="42" rx="3" ry="4" fill="#2C2416"/>
      
      {/* 笑顔の目（まつ毛） */}
      <path
        d="M 36 39 Q 40 37 44 39"
        stroke="#2C2416"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 39 Q 60 37 64 39"
        stroke="#2C2416"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 鼻 */}
      <path
        d="M 50 48 Q 51 50 50 51"
        stroke="#D4A574"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 笑顔の口 */}
      <path
        d="M 38 54 Q 50 62 62 54"
        stroke="#E85D75"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 歯（笑顔の中） */}
      <path
        d="M 42 56 Q 50 60 58 56"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 頬の赤み */}
      <ellipse cx="35" cy="50" rx="5" ry="3" fill="#FFB6C1" opacity="0.4"/>
      <ellipse cx="65" cy="50" rx="5" ry="3" fill="#FFB6C1" opacity="0.4"/>
      
      {/* 首 */}
      <path
        d="M 42 68 Q 45 75 50 75 Q 55 75 58 68"
        fill="#FFE4CC"
      />
      
      {/* ユニフォーム（水色の制服） */}
      <path
        d="M 35 72 Q 30 75 28 85 L 28 95 L 40 95 L 42 75 Q 45 73 50 73 Q 55 73 58 75 L 60 95 L 72 95 L 72 85 Q 70 75 65 72 Q 60 70 50 70 Q 40 70 35 72 Z"
        fill="#A7D8F0"
      />
      
      {/* ユニフォームの襟 */}
      <path
        d="M 42 75 Q 45 73 50 73 Q 55 73 58 75 L 56 78 Q 53 76 50 76 Q 47 76 44 78 Z"
        fill="#FFFFFF"
      />
      
      {/* 名札 */}
      <rect x="52" y="80" width="12" height="8" rx="1" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="0.5"/>
      <line x1="54" y1="82" x2="62" y2="82" stroke="#60A5FA" strokeWidth="0.5"/>
      <line x1="54" y1="84" x2="60" y2="84" stroke="#60A5FA" strokeWidth="0.5"/>
      <line x1="54" y1="86" x2="61" y2="86" stroke="#60A5FA" strokeWidth="0.5"/>
      
      {/* スマイルマーク（肩のバッジ） */}
      <circle cx="68" cy="78" r="4" fill="#FFD700" opacity="0.9"/>
      <circle cx="66.5" cy="77" r="0.5" fill="#FF6B6B"/>
      <circle cx="69.5" cy="77" r="0.5" fill="#FF6B6B"/>
      <path
        d="M 66 79 Q 68 80 70 79"
        stroke="#FF6B6B"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 歯のキラキラ（笑顔アクセント） */}
      <g opacity="0.8">
        <path d="M 32 48 L 33 49 L 32 50 L 31 49 Z" fill="#FFD700"/>
        <path d="M 68 48 L 69 49 L 68 50 L 67 49 Z" fill="#FFD700"/>
      </g>
    </svg>
  );
};


