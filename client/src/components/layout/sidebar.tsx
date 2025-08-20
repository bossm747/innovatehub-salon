import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Bus, 
  Package,
  CreditCard,
  Clock,
  Mail,
  BarChart3,
  Settings, 
  LogOut,
  X
} from "lucide-react";
import SalonLogo from "@/components/salon-logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Services", href: "/services", icon: Scissors },
  { name: "Staff", href: "/staff", icon: Bus },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "POS", href: "/pos", icon: CreditCard },
  { name: "Timesheet", href: "/timesheet", icon: Clock },
  { name: "Marketing", href: "/marketing", icon: Mail },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const secondaryNavigation = [
  { name: "Sign out", href: "/logout", icon: LogOut },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "admin-sidebar shadow-lg",
        !isOpen && "closed"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center space-x-3">
            <div className="md:hidden">
              <SalonLogo size="sm" showSubtext={false} showImage={true} />
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-slate-900">JustPause</h2>
              <p className="text-xs text-slate-500">Salon & Spa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/25" 
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    )}
                    onClick={() => onClose()}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    <span className="font-medium">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          
          {/* Secondary Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="space-y-2">
              {secondaryNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className="group flex items-center px-3 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 cursor-pointer">
                    <item.icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    <span className="font-medium">{item.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
