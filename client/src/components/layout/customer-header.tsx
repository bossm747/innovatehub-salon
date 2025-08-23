import { Menu, Bell, Search, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CustomerHeaderProps {
  onMenuClick: () => void;
  customer: any;
}

export default function CustomerHeader({ onMenuClick, customer }: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Logo for mobile */}
      <div className="flex items-center lg:hidden">
        <h1 className="text-lg font-bold text-gray-900">JustPause</h1>
      </div>

      {/* Page title - hidden on mobile */}
      <div className="hidden lg:flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {customer?.name?.split(' ')[0] || 'Customer'}!
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search - hidden on small screens */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          {/* WhatsApp */}
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:bg-green-50"
            onClick={() => window.open('https://wa.me/639171234567', '_blank')}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Chat</span>
          </Button>

          {/* Call */}
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => window.open('tel:+639171234567', '_self')}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Call</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              2
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>

        {/* Customer avatar */}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{customer?.name || 'Customer'}</p>
            <p className="text-xs text-gray-500">VIP Member</p>
          </div>
        </div>
      </div>
    </header>
  );
}