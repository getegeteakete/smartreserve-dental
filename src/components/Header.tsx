
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ExternalLink, Home, BookOpen } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴエリア */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/ortho-toyoshima-logo.png" 
                  alt="六本松 矯正歯科クリニック とよしま" 
                  className="h-12 w-auto"
                />
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-primary leading-tight">
                    六本松 矯正歯科クリニック とよしま予約ページ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* HOME */}
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  >
                    <Home className="h-4 w-4" />
                    HOME
                  </Button>
                </NavigationMenuItem>

                {/* 使い方ガイド */}
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/guide")}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  >
                    <BookOpen className="h-4 w-4" />
                    使い方ガイド
                  </Button>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
