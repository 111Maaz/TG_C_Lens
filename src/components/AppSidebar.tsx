import React from "react";
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

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Crime Trends", 
      url: "/trends",
      icon: TrendingUp,
    },
    {
      title: "Demographics",
      url: "/demographics", 
      icon: Users,
    },
    {
      title: "Administrative Units",
      url: "/admin/administrative-units",
      icon: Map,
    },
    {
      title: "Submit Report",
      url: "/submit-report",
      icon: FileText,
      protected: true,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      protected: true,
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
            <h2 className="text-lg font-semibold text-sidebar-foreground">T•G Crime Lens</h2>
            <p className="text-sm text-sidebar-foreground/70">Crime Analytics</p>
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
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
        {/* <div className="text-xs text-sidebar-foreground/50">
          T•S Crime Lens v1.0
        </div> */}
        <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm mb-2">T•S Crime Lens v1.0</p>
            <div className="flex gap-3">
              {/* Facebook */}
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5v-2.2c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9H18l-.5 2.9h-2.5v7A10 10 0 0 0 22 12z"/>
              </svg>

              {/* Instagram */}
              <svg className="w-6 h-6" fill="#E1306C" viewBox="0 0 24 24">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/>
              </svg>

              {/* WhatsApp */}
              <svg className="w-6 h-6" fill="#25D366" viewBox="0 0 32 32">
                <path d="M16.001 3C9.373 3 3.998 8.373 3.998 15c0 2.647.897 5.087 2.414 7.08L5 28l6.175-1.963C13.097 27.034 14.518 27.5 16 27.5c6.627 0 12.001-5.373 12.001-12.5S22.627 3 16.001 3zm.01 22c-1.263 0-2.494-.324-3.58-.933l-.256-.145-3.681 1.17 1.188-3.583-.17-.276a8.964 8.964 0 0 1-1.413-4.882c0-4.963 4.038-9 9.002-9s9.001 4.037 9.001 9-4.037 9-9.001 9zm5.136-6.434c-.283-.141-1.674-.828-1.933-.922-.259-.096-.449-.141-.638.141-.189.283-.735.922-.9 1.111-.165.189-.331.212-.614.071-.283-.142-1.196-.44-2.28-1.402-.843-.75-1.411-1.677-1.577-1.96-.165-.283-.018-.437.124-.578.127-.126.283-.33.425-.496.142-.165.189-.283.283-.472.094-.188.047-.354-.023-.496-.071-.141-.638-1.54-.875-2.111-.231-.554-.466-.48-.638-.488l-.544-.01a1.05 1.05 0 0 0-.758.354c-.259.283-.99.968-.99 2.357s1.015 2.725 1.157 2.913c.142.188 1.998 3.06 4.844 4.288.677.292 1.205.465 1.617.595.679.216 1.296.186 1.783.113.544-.081 1.674-.683 1.911-1.343.236-.661.236-1.228.165-1.343-.071-.117-.259-.188-.543-.33z"/>
              </svg>

            </div>
          </div>

      </SidebarFooter>
    </Sidebar>
  );
};

// SidebarWrapper component that provides the layout structure
export const SidebarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="mb-6 px-4 py-2 glass-heading flex items-center gap-4">
              <SidebarTrigger />
              <AnimatedTitle 
                text="Telangana State Crime Analytics Dashboard" 
                className="text-xl md:text-2xl font-bold text-gray-900"
              />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
