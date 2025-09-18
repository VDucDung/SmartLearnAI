import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { mockTools, mockCategories } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Tool, Category } from "@shared/schema";

export default function Tools() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof mockTools[0] | null>(null);

  // Use mock data instead of API calls
  const tools = mockTools;
  const categories = mockCategories;
  const toolsLoading = false;
  const categoriesLoading = false;

  // Mock purchase function - no actual payment processing
  const handlePurchaseSuccess = () => {
    toast({
      title: "Demo: Mua thành công",
      description: "Đây là demo - không có giao dịch thật sự được thực hiện",
    });
    setPurchaseDialogOpen(false);
    setSelectedTool(null);
  };

  // Mock discount validation - demo only  
  const handleValidateDiscount = () => {
    toast({
      title: "Demo: Mã giảm giá",
      description: "Đây là chức năng demo - không có mã giảm giá thật",
      variant: "default",
    });
  };

  // Filter tools based on search only
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePurchase = (toolId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để xem demo mua hàng",
        variant: "default",
      });
      return;
    }

    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      setSelectedTool(tool);
      setPurchaseDialogOpen(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedTool) return;
    handlePurchaseSuccess();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Thị trường{" "}
                <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  công cụ
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Khám phá bộ sưu tập công cụ chuyên nghiệp được tuyển chọn kỹ lưỡng
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            {/* Search */}
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công cụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-tools"
              />
            </div>

            {/* Results count */}
            {!toolsLoading && (
              <p className="text-sm text-muted-foreground text-center" data-testid="text-results-count">
                Hiển thị {filteredTools.length} công cụ
                {searchQuery && ` cho "${searchQuery}"`}
              </p>
            )}
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {toolsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-10 flex-1" />
                          <Skeleton className="h-10 w-10" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <ToolCard tool={tool} onPurchase={handlePurchase} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy công cụ</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Thử thay đổi từ khóa tìm kiếm"
                    : "Chưa có công cụ nào được thêm vào hệ thống"}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery("")}
                    data-testid="button-clear-search"
                  >
                    Xóa tìm kiếm
                  </Button>
                )}
              </div>
            )}
          </motion.div>
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
            
            {selectedTool && (
              <div className="py-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold" data-testid="text-purchase-tool-name">{selectedTool.name}</h4>
                    <p className="text-2xl font-bold text-primary" data-testid="text-purchase-tool-price">
                      {Number(selectedTool.price).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
                
                {/* Demo - Discount Code (disabled) */}
                <div className="space-y-2">
                  <Label htmlFor="discount-code">Mã giảm giá (demo)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount-code"
                      placeholder="Chức năng demo - không thực tế"
                      disabled
                      data-testid="input-discount-code"
                    />
                    <Button
                      variant="outline"
                      onClick={handleValidateDiscount}
                      data-testid="button-validate-discount"
                    >
                      Demo
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                data-testid="button-confirm-purchase"
              >
                Xác nhận mua (Demo)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
