import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Facebook 
} from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal after a short delay for better UX on every page load/reload
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg w-full rounded-2xl p-0 overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300 [&>button]:hidden" 
        data-testid="modal-welcome" 
        aria-describedby="welcome-modal-description"
      >
        {/* Elegant Close Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-lg ring-1 ring-black/5 hover:bg-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all duration-200 z-50"
              data-testid="button-close-modal"
              aria-label="Đóng thông báo"
            >
              <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Đóng thông báo</p>
          </TooltipContent>
        </Tooltip>

        {/* Header with gradient and icon */}
        <DialogHeader className="bg-gradient-to-r from-rose-500 to-red-500 text-white p-6 relative">
          <DialogTitle className="text-center text-xl font-semibold tracking-tight flex items-center justify-center gap-2">
            <Megaphone className="h-5 w-5" />
            THÔNG BÁO
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5" id="welcome-modal-description">
          {/* Main Title with gradient text */}
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              SHOP TOOL/VPS NGỌC RỒNG ONLINE
            </h2>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
              PhamGiang.net
            </Badge>
          </div>

          <Separator className="opacity-30" />

          {/* Description */}
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed text-center">
            Hiện tại shop đã tích hợp nạp tự động, chỉ ý ghi đúng nội dung để được xử lý nhanh nhất
          </p>

          {/* License Info Alert */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
              Mỗi ngày bạn sẽ có <Badge variant="destructive" className="mx-1">3 lượt</Badge> đổi license cho mỗi tool, sẽ reset mỗi ngày
            </AlertDescription>
          </Alert>

          <Separator className="opacity-30" />

          {/* Action Links */}
          <div className="space-y-3">
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-auto py-3 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/20"
                onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                data-testid="link-group-chat"
              >
                <Users className="h-4 w-4" />
                GROUP GIAO LƯU, MUA BÁN TOOL MOD
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-auto py-3 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/20"
                onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                data-testid="link-zalo-chat"
              >
                <MessageSquare className="h-4 w-4" />
                BOX CHAT ZALO GIAO LƯU
              </Button>
            </div>

            <Separator className="opacity-30" />

            {/* Website and Facebook */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">Ra mắt web bán captcha:</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 h-auto py-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
                onClick={() => window.open('https://api.phamgiang.net', '_blank', 'noopener,noreferrer')}
                data-testid="link-website"
              >
                <ExternalLink className="h-4 w-4" />
                api.phamgiang.net
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 h-auto py-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
                onClick={() => window.open('#', '_blank', 'noopener,noreferrer')}
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
                FACEBOOK CHỦ SHOP
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button
              onClick={handleClose}
              size="lg"
              className="w-full sm:w-auto mx-auto block rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium px-8 shadow-lg hover:shadow-xl transition-all duration-200"
              data-testid="button-close-welcome"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}