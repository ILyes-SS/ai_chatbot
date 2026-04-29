"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function SidebarLayout({ 
  sidebar, 
  children 
}: { 
  sidebar: React.ReactNode, 
  children: React.ReactNode 
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {sidebar}
        
        {/* Mobile close button inside sidebar container */}
        {isMobileOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden absolute top-3 right-3 z-[60] bg-background/50 backdrop-blur rounded-full" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative flex flex-col w-full min-w-0">
        {/* Global Mobile Toggle Button (Top Left) */}
        <div className="md:hidden fixed top-6 left-3 z-40">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/80 backdrop-blur border border-border shadow-sm rounded-md"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="size-5 text-foreground" />
          </Button>
        </div>

        {children}
      </main>
    </div>
  );
}
