
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { POSProvider } from "@/context/POSContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import WaiterColorModal from "@/components/WaiterColorModal";

// Pages
import Login from "./pages/Login";
import POS from "./pages/POS";
import Tables from "./pages/Tables";
import Menu from "./pages/Menu";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Customizations from "./pages/Customizations";

// Components
import { TableMapEditor } from "./components/TableMap/TableMapEditor";

const queryClient = new QueryClient();

const App = () => {
  // Route guard for authenticated access
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/" replace />;
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AuthProvider>
                <WaiterColorModal />
                <POSProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/pos" element={<PrivateRoute><POS /></PrivateRoute>} />
                    <Route path="/tables" element={<PrivateRoute><Tables /></PrivateRoute>} />
                    <Route path="/tables/editor" element={<PrivateRoute><TableMapEditor /></PrivateRoute>} />
                    <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
                    <Route path="/customizations" element={<PrivateRoute><Customizations /></PrivateRoute>} />
                    <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                    <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
                    <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
                  </Routes>
                </POSProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
