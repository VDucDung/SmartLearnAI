import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserPlus, LogIn } from "lucide-react";

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Register mutation using React Query
  const registerMutation = useMutation({
    mutationFn: async ({ email, fullName, username, password }: { email: string; fullName: string; username: string; password: string }) => {
      // For now, return a mock response since this is a demo
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username === "existing") {
            reject(new Error("Tài khoản đã tồn tại"));
          } else {
            resolve({ 
              user: { 
                id: Date.now(),
                username,
                email,
                firstName: fullName.split(' ')[0],
                fullName 
              } 
            });
          }
        }, 1000);
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng ${data.user.firstName}! Vui lòng đăng nhập để tiếp tục.`,
      });

      // Redirect to login page
      setLocation("/login");
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName || !username || !password) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tất cả thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập địa chỉ email hợp lệ",
        variant: "destructive",
      });
      return;
    }

    // Username validation
    if (username.length < 3 || username.length > 40) {
      toast({
        title: "Tài khoản không hợp lệ",
        description: "Tài khoản phải từ 3-40 ký tự",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast({
        title: "Mật khẩu không hợp lệ",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ email, fullName, username, password });
  };

  const handleBackToLogin = () => {
    setLocation("/login");
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="flex gap-6">
      {/* Register Form */}
      <div className="flex-1 max-w-md">
        <Card className="overflow-hidden border-0 shadow-2xl bg-gray-800 text-white">
          {/* Green Header */}
          <CardHeader className="bg-green-600 text-center py-6">
            <CardTitle className="text-2xl font-bold text-white">
              Đăng Ký
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Địa Chỉ E-Mail (*)
                </Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white font-medium">
                  Họ và Tên (*)
                </Label>
                <Input
                  id="fullName"
                  data-testid="fullname-input"
                  type="text"
                  placeholder=""
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-medium">
                  Tài Khoản (*)
                </Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Mật Khẩu (*)
                </Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                disabled={isLoading}
                data-testid="register-button"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400 font-medium">
                  - HOẶC -
                </span>
              </div>
            </div>

            {/* Back to Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-medium"
              onClick={handleBackToLogin}
              data-testid="back-to-login-button"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Đăng Nhập
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rules Section */}
      <div className="w-80">
        <Card className="overflow-hidden border-0 shadow-2xl bg-gray-800 text-white">
          {/* Green Header */}
          <CardHeader className="bg-green-600 text-center py-4">
            <CardTitle className="text-xl font-bold text-white">
              Quy Tắc
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-gray-300 space-y-3">
              <p>
                <strong>- Tài khoản chỉ được dùng a-z 0-9!</strong>
              </p>
              
              <p>
                <strong>- Nhập đúng địa chỉ Email thật để lấy lại Password khi quên!</strong>
              </p>
              
              <p>
                <strong>- Tài khoản tối thiểu 6 ký tự và tối đa 40 ký tự, không được là một con số!</strong>
              </p>
              
              <p>
                <strong>- Mật khẩu tối thiểu 6 ký tự, phải bao gồm chữ và số!</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}