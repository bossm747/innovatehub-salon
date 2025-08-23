import { useState } from "react";
import CustomerSidebar from "./customer-sidebar";
import CustomerHeader from "./customer-header";

interface CustomerLayoutProps {
  customer: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function CustomerLayout({ customer, onLogout, children }: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Customer Sidebar */}
      <CustomerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        customer={customer}
        onLogout={onLogout}
      />
      
      {/* Main content area */}
      <div className="lg:pl-80">
        {/* Customer Header */}
        <CustomerHeader 
          onMenuClick={() => setSidebarOpen(true)}
          customer={customer}
        />
        
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}