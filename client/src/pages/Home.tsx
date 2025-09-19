import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { mockTools, mockCategories, mockVPS } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  ShoppingCart,
  AlertCircle,
  Server,
  Cpu,
  HardDrive,
  Eye,
  ChevronUp,
  X
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

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof mockTools[0] | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Use mock data instead of API calls
  const tools = mockTools;
  const categories = mockCategories;
  const toolsLoading = false;
  const categoriesLoading = false;

  // Handle scroll to show/hide back to top button and calculate progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollY / documentHeight) * 100, 100);
      
      setShowBackToTop(scrollY > 400);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

  // Filter tools and VPS based on search
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredVPS = mockVPS.filter(vps => {
    const matchesSearch = vps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vps.specs.feature.toLowerCase().includes(searchQuery.toLowerCase());
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Global Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tools và VPS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-12 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-0 focus:border-gray-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-global-search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500 hover:text-red-700 transition-colors"
                    data-testid="button-clear-search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Tìm thấy {filteredTools.length} tools và {filteredVPS.length} VPS cho "{searchQuery}"
                </p>
              )}
            </div>
          </motion.div>

          {/* TOOL NRO Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TOOL NRO
              </span>
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-emerald-600 mx-auto rounded-full"></div>
          </motion.div>


          {/* Tools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            {toolsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
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
            ) : (searchQuery ? filteredTools : tools).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(searchQuery ? filteredTools : tools).map((tool, index) => (
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
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? `Không tìm thấy tool nào cho "${searchQuery}"` : "Không có tool nào"}
                </p>
              </div>
            )}
          </motion.div>

          {/* VPS Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  VPS VIỆT
                </span>
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            {(searchQuery ? filteredVPS : mockVPS).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchQuery ? filteredVPS : mockVPS).map((vps, index) => (
                  <motion.div
                    key={vps.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="overflow-hidden border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Server className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-lg mb-2">{vps.name}</h3>
                          <p className="text-2xl font-bold text-red-500 mb-1">
                            {Number(vps.price).toLocaleString('vi-VN')} ₫
                            <span className="text-sm font-normal text-gray-500"> / {vps.duration}</span>
                          </p>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <Cpu className="w-4 h-4" />
                            <span className="font-medium">{vps.specs.cores}</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <HardDrive className="w-4 h-4" />
                            <span className="font-medium">{vps.specs.ram}</span>
                          </div>
                          <div className="text-center text-sm text-blue-600 font-medium">
                            {vps.specs.feature}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Còn lại: {vps.availability.inStock}</span>
                          </div>
                          <div>
                            <span>Lượt mua: {vps.availability.purchased}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast({
                                title: "Cần đăng nhập",
                                description: "Vui lòng đăng nhập để xem demo mua VPS",
                                variant: "default",
                              });
                              return;
                            }
                            toast({
                              title: "Demo: Mua VPS",
                              description: "Đây là demo - không có giao dịch thật sự được thực hiện",
                            });
                          }}
                        >
                          XEM CHI TIẾT
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? `Không tìm thấy VPS nào cho "${searchQuery}"` : "Không có VPS nào"}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="relative">
              {/* Progress Circle */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - scrollProgress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Button */}
              <button
                onClick={scrollToTop}
                className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                data-testid="button-back-to-top"
              >
                <ChevronUp className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </motion.div>
        )}

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
