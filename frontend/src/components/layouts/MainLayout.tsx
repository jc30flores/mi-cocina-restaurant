
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  ShoppingCart, 
  ShoppingBag, 
  LayoutDashboard, 
  Globe, 
  Gift, 
  Users, 
  BarChart3,
  Settings,
  Monitor,
  HelpCircle,
  SlidersHorizontal
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const { t } = useLanguage();
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-3 py-2 rounded-lg whitespace-nowrap transition-colors duration-300
        text-[#d1d1d1]
        ${isActive
          ? "bg-primary text-white"
          : "hover:bg-accent hover:text-white"
        }
      `}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-medium text-xs sm:text-sm">{t(label)}</span>
      </div>
    </NavLink>
  );
};

// Navigation items
const navItems = [
  { to: "/pos", icon: <ShoppingCart className="h-4 w-4" />, label: "Punto de Venta" },
  { to: "/menu", icon: <ShoppingBag className="h-4 w-4" />, label: "Menú" },
  { to: "/inventory", icon: <LayoutDashboard className="h-4 w-4" />, label: "Inventario" },
  { to: "/online-orders", icon: <Globe className="h-4 w-4" />, label: "Pedidos en Línea" },
  { to: "/loyalty", icon: <Gift className="h-4 w-4" />, label: "Fidelización" },
  { to: "/employees", icon: <Users className="h-4 w-4" />, label: "Empleados" },
  { to: "/reports", icon: <BarChart3 className="h-4 w-4" />, label: "Reportes" },
  { to: "/customizations", icon: <SlidersHorizontal className="h-4 w-4" />, label: "Personalizaciones" },
  { to: "/settings", icon: <Settings className="h-4 w-4" />, label: "Configuración" },
  { to: "/hardware", icon: <Monitor className="h-4 w-4" />, label: "Hardware" },
  { to: "/help", icon: <HelpCircle className="h-4 w-4" />, label: "Ayuda" }
];

interface MainLayoutProps {
  children: React.ReactNode;
  /** Remove default padding on the main content */
  noPadding?: boolean;
  /** Render content full width, bypassing the container */
  fullWidth?: boolean;
  /** Hide the navigation header */
  hideNav?: boolean;
}

const MainLayout = ({ children, noPadding = false, fullWidth = false, hideNav = false }: MainLayoutProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { logout } = useAuth();
  const showNotImplemented = () => {
    toast({
      title: t("Funcionalidad no implementada"),
      description: t("Esta opción estará disponible próximamente"),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar - Hidden when hideNav is true */}
      {!hideNav && (
      <header className="bg-[#1e1e1e] text-[#f0f0f0] border-b border-[#555] h-16 sticky top-0 z-30">
        <div className="h-full flex items-center justify-between px-2 sm:px-4">
          {/* Navigation Menu - Horizontal with overflow scrolling */}
          <div className="flex-1 overflow-x-auto scrollbar-none">
            <nav className="flex">
              <ul className="flex space-x-1 pr-4">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavItem
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Tema oscuro y cierre de sesión */}
          <div className="flex-shrink-0 ml-2 flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-x-hidden ${noPadding ? '' : 'p-4'}`}>
        {fullWidth ? (
          children
        ) : (
          <div className="container mx-auto">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
