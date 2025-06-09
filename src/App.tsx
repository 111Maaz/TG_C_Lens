import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/contexts/AuthContext";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SubmitReport from "./pages/SubmitReport";
import { FilterProvider } from "./contexts/FilterContext";
import Login from "./auth/pages/Login";
import Register from "./auth/pages/Register";
import ResetPassword from "./auth/pages/ResetPassword";
import Profile from "./auth/pages/Profile";
import Demographics from "./pages/Demographics";
import CrimeTrends from "./pages/CrimeTrends";
import { AutoWelcomePage } from "./components/AutoWelcomePage";
import { useState, useEffect } from "react";
import AdministrativeUnitsPage from "./pages/admin/administrative-units";
import AdminReportsPage from "./pages/admin/reports";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000); // 10 seconds total

    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return <AutoWelcomePage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    
                    {/* Dashboard routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/trends" element={<CrimeTrends />} />
                    <Route path="/demographics" element={<Demographics />} />
                    <Route path="/admin/administrative-units" element={<AdministrativeUnitsPage />} />
                    
                    {/* Protected routes */}
                    <Route 
                      path="/submit-report" 
                      element={
                        <ProtectedRoute>
                          <SubmitReport />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin routes - require admin role */}
                    <Route 
                      path="/admin/reports" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminReportsPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </FilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
