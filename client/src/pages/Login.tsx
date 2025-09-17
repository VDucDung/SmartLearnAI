import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { LoginForm } from "@/components/LoginForm";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </Layout>
  );
}