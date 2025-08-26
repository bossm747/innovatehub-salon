
import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerAuth from "./customer-auth";
import CustomerLanding from "./customer-landing";
import CustomerDashboard from "./customer-dashboard";
import CustomerBooking from "./customer-booking";
import CustomerLayout from "@/components/layout/customer-layout";
import { useCustomerLogout } from "@/hooks/useCustomerAuth";
import { Loader2 } from "lucide-react";

type CustomerView = 'landing' | 'auth' | 'dashboard' | 'booking';

export default function CustomerPortalMain() {
  const [currentView, setCurrentView] = useState<CustomerView>('landing');
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const logout = useCustomerLogout();

  const handleLoginClick = () => setCurrentView('auth');
  const handleRegisterClick = () => setCurrentView('auth');
  const handleBackToLanding = () => setCurrentView('landing');
  
  const handleCustomerLogin = (customerData: any) => {
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setCurrentView('landing');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side even if server fails
      setCurrentView('landing');
      window.location.reload();
    }
  };

  const handleBookAppointment = () => setCurrentView('booking');
  const handleBackToDashboard = () => setCurrentView('dashboard');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show customer dashboard or booking
  if (isAuthenticated && customer) {
    if (currentView === 'booking') {
      return (
        <CustomerLayout customer={customer} onLogout={handleLogout}>
          <CustomerBooking 
            customer={customer}
            onBack={handleBackToDashboard}
          />
        </CustomerLayout>
      );
    }

    return (
      <CustomerLayout customer={customer} onLogout={handleLogout}>
        <CustomerDashboard 
          customer={customer}
          onBookAppointment={handleBookAppointment}
        />
      </CustomerLayout>
    );
  }

  // If not authenticated, show landing or auth based on current view
  if (currentView === 'auth') {
    return (
      <CustomerAuth 
        onBack={handleBackToLanding}
        onCustomerLogin={handleCustomerLogin}
      />
    );
  }

  // Default to landing page
  return (
    <CustomerLanding 
      onLoginClick={handleLoginClick}
      onRegisterClick={handleRegisterClick}
    />
  );
}
