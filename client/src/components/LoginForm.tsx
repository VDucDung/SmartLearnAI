import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Lock, User, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load remembered username on component mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remembered-username");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberAccount(true);
    }
  }, []);

  // Login mutation using React Query
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }

      return data;
    },
    onSuccess: (data) => {
      // Handle remember account
      if (rememberAccount) {
        localStorage.setItem("remembered-username", username);
      } else {
        localStorage.removeItem("remembered-username");
      }

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.firstName}!`,
      });

      // Invalidate user query and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tài khoản và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ username, password });
  };

  const handleForgotPassword = () => {
    toast({
      title: "Tính năng sắp ra mắt",
      description: "Chức năng quên mật khẩu đang được phát triển",
    });
  };

  const handleRegister = () => {
    setLocation("/register");
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Tính năng sắp ra mắt",
      description: "Đăng nhập Google đang được phát triển",
    });
  };


  const isLoading = loginMutation.isPending;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gray-800 text-white">
        {/* Blue Header */}
        <CardHeader className="bg-blue-600 text-center py-6">
          <CardTitle className="text-2xl font-bold text-white">
            Đăng Nhập
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            {/* Account/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-medium">
                Tài Khoản & Email
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
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Mật Khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-pressed={showPassword}
                  data-testid="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Account & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  data-testid="remember-checkbox"
                  checked={rememberAccount}
                  onCheckedChange={(checked) => setRememberAccount(checked as boolean)}
                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-white cursor-pointer"
                >
                  Nhớ Tài Khoản
                </Label>
              </div>
              
              <Button
                type="button"
                variant="link"
                className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal text-sm"
                onClick={handleForgotPassword}
                data-testid="forgot-password-link"
              >
                Quên/Đổi Mật Khẩu?
              </Button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              disabled={isLoading}
              data-testid="login-button"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
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

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-green-600 hover:bg-green-700 border-green-600 text-white font-medium"
              onClick={handleRegister}
              data-testid="register-button"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Đăng Kí
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="bg-red-600 hover:bg-red-700 border-red-600 text-white font-medium"
              onClick={handleGoogleLogin}
              data-testid="google-button"
            >
              <FcGoogle className="w-4 h-4 mr-2" />
              Google
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}