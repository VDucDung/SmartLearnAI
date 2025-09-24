import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WelcomeModal } from "@/components/WelcomeModal";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tools from "@/pages/Tools";
import ToolDetails from "@/pages/ToolDetails";
import PurchasedTools from "@/pages/PurchasedTools";
import Deposit from "@/pages/Deposit";
import History from "@/pages/History";
import AdminPanel from "@/pages/AdminPanel";
import Checkout from "@/pages/Checkout";
import Statistics from "@/pages/Statistics";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/" component={Home} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/:id" component={ToolDetails} />
      <Route path="/statistics" component={Statistics} />
      
      {isAuthenticated && (
        <>
          <Route path="/purchased-tools" component={PurchasedTools} />
          <Route path="/deposit" component={Deposit} />
          <Route path="/history" component={History} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/:section" component={AdminPanel} />
          <Route path="/checkout" component={Checkout} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <TooltipProvider>
            <Toaster />
            <WelcomeModal />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
