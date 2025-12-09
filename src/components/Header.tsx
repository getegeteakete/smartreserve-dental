
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
import { ExternalLink, Home, BookOpen, Building2, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴエリア */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div 
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <img 
                  src="/images/logo.png" 
                  alt="六本松 矯正歯科クリニック とよしま" 
                  className="h-10 md:h-12 w-auto"
                />
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

                {/* 豊嶋歯科TOP */}
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    onClick={() => window.open("https://xn--68j7a2dtb9053amj1aoqai3wdd676ltle.com/", "_blank")}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  >
                    <Building2 className="h-4 w-4" />
                    豊嶋歯科TOP
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col py-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 justify-start px-4 py-3"
              >
                <Home className="h-5 w-5" />
                HOME
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/guide");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 justify-start px-4 py-3"
              >
                <BookOpen className="h-5 w-5" />
                使い方ガイド
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.open("https://xn--68j7a2dtb9053amj1aoqai3wdd676ltle.com/", "_blank");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 justify-start px-4 py-3"
              >
                <Building2 className="h-5 w-5" />
                豊嶋歯科TOP
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
