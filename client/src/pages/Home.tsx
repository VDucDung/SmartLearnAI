import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShoppingBag, 
  CreditCard, 
  History, 
  TrendingUp, 
  Star,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Khám phá công cụ",
      description: "Xem các công cụ mới nhất",
      href: "/tools",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Công cụ đã mua",
      description: "Quản lý công cụ của bạn",
      href: "/purchased-tools",
      icon: Star,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Nạp tiền",
      description: "Nạp tiền vào tài khoản",
      href: "/deposit",
      icon: CreditCard,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Lịch sử",
      description: "Xem lịch sử giao dịch",
      href: "/history",
      icon: History,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Welcome Hero */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Chào mừng trở lại,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  {user?.firstName || "bạn"}!
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Sẵn sàng khám phá các công cụ mới và quản lý bộ sưu tập của bạn
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center space-x-2 px-4 py-2 bg-background/80 backdrop-blur rounded-lg border">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Số dư:</span>
                  <span className="text-sm font-bold text-emerald-600" data-testid="text-user-balance-hero">
                    {Number(user?.balance || 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <Link href="/tools">
                  <Button data-testid="button-explore-tools">
                    Khám phá công cụ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-8">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <Link href={action.href}>
                      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                          <p className="text-muted-foreground text-sm">{action.description}</p>
                          <ArrowRight className="h-4 w-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Activity Preview */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Tổng quan hoạt động</h2>
                <Link href="/dashboard">
                  <Button variant="outline" data-testid="link-view-dashboard">
                    Xem dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                        <p className="text-2xl font-bold text-primary" data-testid="text-total-spent">
                          0₫
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Công cụ đã mua</p>
                        <p className="text-2xl font-bold" data-testid="text-purchased-tools-count">0</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Thành viên từ</p>
                        <p className="text-2xl font-bold" data-testid="text-member-since">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Tools Preview */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Công cụ nổi bật</h2>
                <Link href="/tools">
                  <Button variant="outline" data-testid="link-view-all-tools">
                    Xem tất cả
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Khám phá công cụ mới</h3>
                <p className="text-muted-foreground mb-4">
                  Bắt đầu hành trình của bạn bằng cách khám phá các công cụ chất lượng cao
                </p>
                <Link href="/tools">
                  <Button data-testid="button-browse-tools">
                    Duyệt công cụ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
