import { Search, Bell, Menu, Book, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SalonLogo from "@/components/salon-logo";
import { useStaffAuth, useStaffLogout } from "@/hooks/useStaffAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
  onDocsClick?: () => void;
}

export default function Header({ onMenuClick, onDocsClick }: HeaderProps) {
  const { staff } = useStaffAuth();
  const staffLogout = useStaffLogout();

  const handleLogout = async () => {
    try {
      await staffLogout.mutateAsync();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="admin-header shadow-sm bg-white/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-slate-500">Manage your JustPause operations</p>
            </div>
            
            {/* Mobile - Empty space for floating logo */}
            <div className="lg:hidden flex-1"></div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search clients, appointments..."
                    className="w-64 pl-10"
                  />
                </div>
              </div>
              
              {onDocsClick && (
                <Button variant="ghost" size="sm" onClick={onDocsClick} className="text-slate-400 hover:text-slate-700">
                  <Book className="h-5 w-5" />
                </Button>
              )}
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-slate-400" />
                <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2 transition-colors">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-slate-900">{staff?.name || "Staff Member"}</div>
                      <div className="text-xs text-slate-500">{staff?.role || "Staff"}</div>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
                      <AvatarFallback>
                        {staff?.name ? staff.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ST'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Floating Logo Overlay - Positioned at header level */}
      <div className="lg:hidden fixed top-0 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <img 
          src="/justpause-logo-transparent.png" 
          alt="JustPause Salon & Spa" 
          className="h-16 w-auto mt-0"
          style={{ background: 'transparent' }}
        />
      </div>
      

    </>
  );
}
