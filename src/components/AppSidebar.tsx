import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, TrendingUp, Users, FileText, User, Shield, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/hooks/useAuth";
import { AnimatedTitle } from "./AnimatedTitle";
import { Button } from "@/components/ui/button";
import { ReportCrimeModal } from "./ReportCrimeModal";
import GradientText from "./GradientText";

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      gradient: "from-blue-400 to-cyan-400",
      hoverGradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Crime Trends",
      url: "/trends",
      icon: TrendingUp,
      gradient: "from-purple-400 to-pink-400",
      hoverGradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Demographics",
      url: "/demographics",
      icon: Users,
      gradient: "from-green-400 to-emerald-400",
      hoverGradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Administrative Units",
      url: "/admin/administrative-units",
      icon: Map,
      gradient: "from-orange-400 to-amber-400",
      hoverGradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Submit Report",
      url: "/submit-report",
      icon: FileText,
      protected: true,
      gradient: "from-red-400 to-rose-400",
      hoverGradient: "from-red-500 to-rose-500",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      protected: true,
      gradient: "from-indigo-400 to-violet-400",
      hoverGradient: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <Sidebar className="glass-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flip-container">
            <div className="flipper">
              <div className="front">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="back">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div>
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="text-lg font-semibold"
            >
              T•G Crime Lens
            </GradientText>
            {/* <p className="text-sm text-sidebar-foreground/70">Crime Analytics</p> */}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Hide protected items if user is not logged in
                if (item.protected && !user) {
                  return null;
                }
                
                const isActive = location.pathname === item.url;
                const isHovered = hoveredItem === item.title;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group relative overflow-hidden rounded-lg
                        transition-all duration-300 ease-out
                        ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/10'}
                      `}
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-4 py-2.5">
                        {/* Background gradient */}
                        <div className={`
                          absolute inset-0 opacity-0 transition-opacity duration-300
                          bg-gradient-to-r ${item.gradient}
                          group-hover:opacity-10
                          ${isActive ? 'opacity-15' : ''}
                        `} />
                        
                        {/* Icon with glow effect */}
                        <div className={`
                          relative flex items-center justify-center
                          transition-transform duration-300 ease-out
                          ${isHovered ? 'scale-110' : ''}
                          ${isActive ? 'scale-105' : ''}
                        `}>
                          <item.icon className={`
                            h-4 w-4 transition-all duration-300
                            ${isActive || isHovered ? 'text-white filter drop-shadow-glow' : 'text-sidebar-foreground/70'}
                          `} />
                        </div>

                        {/* Text with slide effect */}
                        <span className={`
                          relative font-medium transition-all duration-300
                          ${isActive ? 'text-white' : 'text-sidebar-foreground/70'}
                          group-hover:text-white group-hover:translate-x-1
                        `}>
                          {item.title}
                        </span>

                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        {/* Footer content moved to UnifiedFooter component */}
      </SidebarFooter>
      <ReportCrimeModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
    </Sidebar>
  );
};

// SidebarWrapper component that provides the layout structure
export const SidebarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="mb-6 px-4 py-2 bg-gray-900 dark:bg-black flex items-center justify-between rounded-lg shadow-lg">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-300 hover:text-white" />
                <AnimatedTitle 
                  text="Telangana State Crime Analytics Dashboard" 
                  className="text-xl md:text-2xl font-bold text-white"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setReportModalOpen(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Report Crime
              </Button>
            </div>
            {children}
          </div>
        </main>
        <ReportCrimeModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
        />
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
