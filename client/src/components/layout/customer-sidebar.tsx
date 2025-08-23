import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home,
  Calendar, 
  User, 
  History,
  Phone,
  MapPin,
  LogOut,
  X,
  Sparkles,
  Clock,
  Star,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onLogout: () => void;
}

const customerNavigation = [
  { name: "Dashboard", href: "/customer", icon: Home },
  { name: "Book Appointment", href: "/customer/book", icon: Calendar },
  { name: "My Profile", href: "/customer/profile", icon: User },
  { name: "Appointment History", href: "/customer/history", icon: History },
];

const contactInfo = [
  { 
    name: "Call Us", 
    href: "tel:+639171234567", 
    icon: Phone, 
    value: "+63 917 123 4567",
    color: "text-green-600"
  },
  { 
    name: "Visit Us", 
    href: "#", 
    icon: MapPin, 
    value: "Balayan, Batangas",
    color: "text-blue-600"
  },
  { 
    name: "WhatsApp", 
    href: "https://wa.me/639171234567", 
    icon: MessageCircle, 
    value: "Chat with us",
    color: "text-green-500"
  },
];

export default function CustomerSidebar({ isOpen, onClose, customer, onLogout }: CustomerSidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">JustPause</h2>
              <p className="text-sm text-gray-600">Customer Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {customer?.name || 'Guest User'}
              </h3>
              <p className="text-sm text-gray-600">
                {customer?.phone || 'Customer'}
              </p>
              <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                VIP Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Your Account
            </h4>
            {customerNavigation.map((item) => {
              const isActive = location === item.href || 
                (item.href === "/customer" && location === "/customer") ||
                (item.href !== "/customer" && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                      isActive
                        ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-r-2 border-purple-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Next Appointment</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Total Visits</span>
                </div>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Member Since</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2024</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contact Us
            </h4>
            <div className="space-y-1">
              {contactInfo.map((contact) => (
                <a
                  key={contact.name}
                  href={contact.href}
                  className="flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors group"
                  target={contact.href.startsWith('http') ? '_blank' : '_self'}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <contact.icon className={cn("mr-3 h-4 w-4 flex-shrink-0", contact.color)} />
                  <div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Business Hours
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-medium text-gray-900">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saturday - Sunday</span>
                <span className="font-medium text-gray-900">9:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}