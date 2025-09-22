import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  X, 
  Megaphone, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  ExternalLink, 
  Facebook,
  Sparkles,
  Star,
  Zap,
  Gift,
  Crown
} from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    // Always clear session storage on every page load to ensure modal shows
    sessionStorage.removeItem('welcome-modal-dismissed-session');
    
    // Show modal after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []); // Only run once on mount (page load/reload)

  const handleClose = () => {
    setIsOpen(false);
    // Mark modal as dismissed in current session
    sessionStorage.setItem('welcome-modal-dismissed-session', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl w-full rounded-3xl p-0 overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 animate-in zoom-in-95 duration-500 [&>button]:hidden backdrop-blur-sm" 
        data-testid="modal-welcome"
      >
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-12 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-12 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        </div>

        {/* Premium Close Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all duration-300 z-50 group"
              data-testid="button-close-modal"
              aria-label="Đóng thông báo"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Đóng thông báo</p>
          </TooltipContent>
        </Tooltip>

        {/* Stunning Header with animated gradient */}
        <DialogHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-8 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-red-600/80 animate-pulse"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-2 left-4">
            <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" />
          </div>
          <div className="absolute top-4 right-6">
            <Star className="h-3 w-3 text-yellow-200 animate-pulse" />
          </div>
          <div className="absolute bottom-2 left-8">
            <Zap className="h-3 w-3 text-yellow-400 animate-bounce" />
          </div>
          
          <DialogTitle className="text-center text-2xl font-bold tracking-tight flex items-center justify-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Megaphone className="h-6 w-6 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              THÔNG BÁO ĐẶC BIỆT
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Thông báo chào mừng về shop tool/VPS ngọc rồng online
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Content */}
        <div className="p-8 sm:p-10 space-y-6 relative" id="welcome-modal-description">
          {/* Premium Title Section */}
          <div className="text-center space-y-4">
            <div className="relative">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-pulse">
                SHOP TOOL/VPS NGỌC RỒNG ONLINE
              </h2>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/30 via-pink-200/30 to-red-200/30 blur-sm rounded-lg -z-10"></div>
            </div>
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Crown className="h-4 w-4 mr-2" />
                LinhCong.net - Premium Store
              </Badge>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50"></div>

          {/* Enhanced Description */}
          <div className="bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/40 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center font-medium">
              🚀 Hiện tại shop đã tích hợp <span className="font-bold text-purple-600 dark:text-purple-400">nạp tự động</span>, chỉ cần ghi đúng nội dung để được xử lý <span className="font-bold text-pink-600 dark:text-pink-400">nhanh nhất</span>!
            </p>
          </div>

          {/* Premium License Info */}
          <div className="relative">
            <Alert className="border-0 bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 dark:from-red-900/30 dark:via-pink-900/30 dark:to-purple-900/30 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 animate-pulse rounded-lg"></div>
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 animate-bounce" />
              <AlertDescription className="text-red-700 dark:text-red-300 font-semibold text-base relative z-10">
                ⚡ Mỗi ngày bạn sẽ có <Badge className="mx-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 animate-pulse">3 lượt</Badge> đổi license cho mỗi tool, sẽ reset mỗi ngày
              </AlertDescription>
            </Alert>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-50"></div>

          {/* Premium Action Links */}
          <div className="space-y-4">
            <div className="grid gap-3">
              <Button
                size="lg"
                className="justify-start gap-3 h-auto py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                data-testid="link-group-chat"
              >
                <div className="p-2 bg-white/20 rounded-full">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">GROUP GIAO LƯU</div>
                  <div className="text-sm opacity-90">Mua bán tool mod chất lượng cao</div>
                </div>
              </Button>
              
              <Button
                size="lg"
                className="justify-start gap-3 h-auto py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                data-testid="link-zalo-chat"
              >
                <div className="p-2 bg-white/20 rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">BOX CHAT ZALO</div>
                  <div className="text-sm opacity-90">Giao lưu và hỗ trợ 24/7</div>
                </div>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-semibold mb-3">
                🌟 Ra mắt web bán captcha cao cấp:
              </p>

              <div className="grid gap-3">
                <Button
                  size="default"
                  className="justify-center gap-2 h-auto py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
                  onClick={() => window.open('https://api.linhcong.net', '_blank', 'noopener,noreferrer')}
                  data-testid="link-website"
                >
                  <ExternalLink className="h-4 w-4" />
                  api.linhcong.net
                </Button>

                <Button
                  size="default"
                  className="justify-center gap-2 h-auto py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
                  onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                  data-testid="link-facebook"
                >
                  <Facebook className="h-4 w-4" />
                  FACEBOOK CHỦ SHOP
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Close Button */}
          <div className="pt-6">
            <Button 
              onClick={handleClose}
              size="lg"
              className="w-full mx-auto block rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-lg px-12 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
              data-testid="button-close-welcome"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Đã hiểu rồi, vào shop thôi!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}