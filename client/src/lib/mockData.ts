// Mock data for tools and categories
export const mockCategories = [
  {
    id: "1",
    name: "Công cụ SEO",
    slug: "seo-tools",
    createdAt: new Date(),
  },
  {
    id: "2", 
    name: "Marketing",
    slug: "marketing",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Thiết kế",
    slug: "design", 
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Phân tích dữ liệu",
    slug: "analytics",
    createdAt: new Date(),
  }
];

export const mockTools = [
  {
    id: "1",
    name: "SEO Keyword Research Pro",
    description: "Công cụ nghiên cứu từ khóa chuyên nghiệp giúp bạn tìm ra các từ khóa có tiềm năng cao cho website của mình.",
    price: "299000",
    categoryId: "1",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    videoUrl: null,
    instructions: "# Hướng dẫn sử dụng SEO Keyword Research Pro\n\n## Bước 1: Cài đặt\n1. Tải file và giải nén\n2. Chạy file setup.exe\n\n## Bước 2: Sử dụng\n1. Nhập từ khóa gốc\n2. Chọn khu vực mục tiêu\n3. Phân tích kết quả",
    downloadUrl: "https://example.com/download/seo-pro",
    views: 1250,
    rating: "4.8",
    reviewCount: 89,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[0]
  },
  {
    id: "2",
    name: "Social Media Scheduler",
    description: "Lên lịch và quản lý nội dung trên các nền tảng mạng xã hội một cách tự động và hiệu quả.",
    price: "199000", 
    categoryId: "2",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    videoUrl: null,
    instructions: null,
    downloadUrl: "https://example.com/download/social-scheduler",
    views: 850,
    rating: "4.6",
    reviewCount: 42,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[1]
  },
  {
    id: "3",
    name: "Logo Design Assistant",
    description: "Công cụ thiết kế logo thông minh với AI giúp tạo ra những logo chuyên nghiệp trong vài phút.",
    price: "399000",
    categoryId: "3", 
    imageUrl: "https://images.unsplash.com/photo-1626785774625-0b0c2493f8bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    videoUrl: null,
    instructions: null,
    downloadUrl: "https://example.com/download/logo-designer",
    views: 2100,
    rating: "4.9",
    reviewCount: 156,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[2]
  },
  {
    id: "4",
    name: "Website Analytics Dashboard",
    description: "Bảng điều khiển phân tích website toàn diện với các chỉ số quan trọng và báo cáo chi tiết.",
    price: "599000",
    categoryId: "4",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    videoUrl: null,
    instructions: null,
    downloadUrl: "https://example.com/download/analytics-dashboard", 
    views: 720,
    rating: "4.7",
    reviewCount: 38,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[3]
  },
  {
    id: "5", 
    name: "Email Marketing Automation",
    description: "Tự động hóa email marketing với các template đẹp và hệ thống phân khúc khách hàng thông minh.",
    price: "450000",
    categoryId: "2",
    imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fce4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400", 
    videoUrl: null,
    instructions: null,
    downloadUrl: "https://example.com/download/email-automation",
    views: 1680,
    rating: "4.5", 
    reviewCount: 73,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(), 
    category: mockCategories[1]
  },
  {
    id: "6",
    name: "Content Writing Helper", 
    description: "Trợ lý viết nội dung AI giúp tạo ra các bài viết, bài đăng mạng xã hội và nội dung marketing chất lượng cao.",
    price: "349000",
    categoryId: "2",
    imageUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    videoUrl: null,
    instructions: null,
    downloadUrl: "https://example.com/download/content-writer",
    views: 940,
    rating: "4.4",
    reviewCount: 56,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: mockCategories[1]
  }
];

// Mock user data
export const mockUser = {
  id: "user-1",
  email: "demo@example.com", 
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  balance: "1000000", // 1,000,000 VND
  isAdmin: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser = {
  id: "admin-1", 
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150", 
  balance: "5000000", // 5,000,000 VND
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Default credentials
export const defaultCredentials = {
  user: {
    username: "demo",
    password: "demo123"
  },
  admin: {
    username: "admin", 
    password: "admin123"
  }
};