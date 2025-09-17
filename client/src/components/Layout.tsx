import { useAuth } from "@/hooks/useAuth";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = false }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {isAuthenticated && showSidebar && (
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Sidebar />
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
