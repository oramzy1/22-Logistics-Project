import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Drivers from "./pages/Drivers";
import LiveTrips from "./pages/LiveTrips";
import Users from "./pages/Users";
import Payment from "./pages/Payment";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import{ AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login.tsx";
import { useEffect, useState } from "react";
import Promotions from "./pages/Promotions.tsx";

const queryClient = new QueryClient();

function MobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-6">🖥️</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Desktop Recommended</h1>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          The 22Logistics Admin Panel is optimized for larger screens. 
          Please use a desktop or laptop (768px+) for the best experience.
        </p>
        <p className="text-xs text-muted-foreground mt-6 opacity-60">
          Current width: {window.innerWidth}px
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
        <BrowserRouter>
         <MobileGuard>
           <Routes>
            <Route path="/login" element={<Login />} />
           <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/live-trips" element={<LiveTrips />} />
              <Route path="/users" element={<Users />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
           </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
         </MobileGuard>
        </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
