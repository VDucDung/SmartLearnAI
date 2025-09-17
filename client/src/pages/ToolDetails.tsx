import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Eye,
  Star,
  ShoppingCart,
  Play,
  Download,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Tool, Category } from "@shared/schema";

export default function ToolDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  const { data: tool, isLoading } = useQuery<Tool & { category?: Category }>({
    queryKey: ["/api/tools", id],
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ toolId, discountCodeId }: { toolId: string; discountCodeId?: string }) => {
      return await apiRequest("POST", "/api/purchases", { toolId, discountCodeId });
    },
    onSuccess: () => {
      toast({
        title: "Mua thành công",
        description: "Công cụ đã được thêm vào danh sách đã mua",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPurchaseDialogOpen(false);
      setDiscountCode("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Lỗi",
        description: error.message || "Không thể mua công cụ",
        variant: "destructive",
      });
    },
  });

  const validateDiscountMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/discount-codes/validate", { code });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mã giảm giá hợp lệ",
        description: `Giảm ${data.discountType === 'percentage' ? data.discountValue + '%' : Number(data.discountValue).toLocaleString('vi-VN') + '₫'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Mã giảm giá không hợp lệ",
        description: error.message || "Mã giảm giá không tồn tại hoặc đã hết hạn",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để mua công cụ",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    setPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!tool) return;
    
    purchaseMutation.mutate({
      toolId: tool.id,
      discountCodeId: discountCode || undefined,
    });
  };

  const handleValidateDiscount = () => {
    if (discountCode.trim()) {
      validateDiscountMutation.mutate(discountCode.trim());
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-64 mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-6" />
              <Skeleton className="w-full h-48" />
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy công cụ</h1>
            <p className="text-muted-foreground mb-6">Công cụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/tools">
              <Button data-testid="button-back-to-tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/tools">
              <Button variant="ghost" className="mb-8" data-testid="button-back-to-tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Tool Image/Video */}
              <div className="relative mb-6">
                <img 
                  src={tool.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"} 
                  alt={tool.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {tool.category && (
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    {tool.category.name}
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  <Eye className="w-4 h-4" />
                  <span data-testid="text-tool-views">{tool.views} lượt xem</span>
                </div>
              </div>

              {/* Tool Info */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4" data-testid="text-tool-name">{tool.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                    <span>{Number(tool.rating).toFixed(1)} ({tool.reviewCount} đánh giá)</span>
                  </div>
                  <div className="text-3xl font-bold text-primary" data-testid="text-tool-price">
                    {Number(tool.price).toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-tool-description">
                  {tool.description}
                </p>
              </div>

              {/* Video Demo */}
              {tool.videoUrl && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Play className="mr-2 h-5 w-5" />
                      Video Demo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Video demo sẽ được hiển thị tại đây</p>
                        <a href={tool.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="mt-4" data-testid="button-watch-video">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Xem video
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              {tool.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hướng dẫn sử dụng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="content-tool-instructions">
                      {/* Simplified markdown rendering */}
                      <div dangerouslySetInnerHTML={{ 
                        __html: tool.instructions
                          .replace(/### (.*)/g, '<h4>$1</h4>')
                          .replace(/## (.*)/g, '<h3>$1</h3>')
                          .replace(/# (.*)/g, '<h2>$1</h2>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-6" data-testid="text-sidebar-price">
                    {Number(tool.price).toLocaleString('vi-VN')}₫
                  </div>
                  
                  <Button 
                    className="w-full mb-4" 
                    onClick={handlePurchase}
                    data-testid="button-purchase-tool"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Mua ngay
                  </Button>

                  {tool.downloadUrl && (
                    <Button variant="outline" className="w-full mb-6" asChild data-testid="button-preview-download">
                      <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Xem trước
                      </a>
                    </Button>
                  )}

                  <Separator className="mb-6" />

                  {/* Contact Options */}
                  <div>
                    <h3 className="font-semibold mb-4">Liên hệ hỗ trợ</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-contact-telegram">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Telegram
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-contact-zalo">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Zalo
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-contact-email">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent data-testid="dialog-purchase-confirmation">
            <DialogHeader>
              <DialogTitle>Xác nhận mua hàng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn mua công cụ này không?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold" data-testid="text-purchase-tool-name">{tool.name}</h4>
                  <p className="text-2xl font-bold text-primary" data-testid="text-purchase-tool-price">
                    {Number(tool.price).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
              
              {/* Discount Code Input */}
              <div className="space-y-2">
                <Label htmlFor="discount-code">Mã giảm giá (tùy chọn)</Label>
                <div className="flex gap-2">
                  <Input
                    id="discount-code"
                    placeholder="Nhập mã giảm giá"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    data-testid="input-discount-code"
                  />
                  <Button
                    variant="outline"
                    onClick={handleValidateDiscount}
                    disabled={!discountCode.trim() || validateDiscountMutation.isPending}
                    data-testid="button-validate-discount"
                  >
                    Kiểm tra
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPurchaseDialogOpen(false)}
                data-testid="button-cancel-purchase"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmPurchase}
                disabled={purchaseMutation.isPending}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending ? "Đang xử lý..." : "Xác nhận mua"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
