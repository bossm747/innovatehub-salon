import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import CustomerLanding from "./customer-landing";
import CustomerAuth from "./customer-auth";
import CustomerDashboard from "./customer-dashboard";
import CustomerBooking from "./customer-booking";

export default function CustomerPortalMain() {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [, navigate] = useLocation();

  // Check if customer is already logged in (from localStorage)
  useEffect(() => {
    const savedCustomer = localStorage.getItem('customer-session');
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
        setCurrentView('dashboard');
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('customer-session');
      }
    }
    setIsLoading(false);
  }, []);

  const handleCustomerLogin = (customerData: any) => {
    setCustomer(customerData);
    setCurrentView('dashboard');
    // Save to localStorage for persistence
    localStorage.setItem('customer-session', JSON.stringify(customerData));
  };

  const handleCustomerLogout = () => {
    setCustomer(null);
    setCurrentView('landing');
    localStorage.removeItem('customer-session');
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleRegisterClick = () => {
    setCurrentView('register');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/customer/book">
        {customer ? (
          <CustomerBooking customer={customer} />
        ) : (
          <CustomerAuth 
            onBack={handleBackToLanding}
            onCustomerLogin={handleCustomerLogin}
            defaultTab="register"
          />
        )}
      </Route>
      <Route path="/customer">
        {(() => {
          switch (currentView) {
            case 'login':
              return (
                <CustomerAuth 
                  onBack={handleBackToLanding}
                  onCustomerLogin={handleCustomerLogin}
                  defaultTab="login"
                />
              );
            case 'register':
              return (
                <CustomerAuth 
                  onBack={handleBackToLanding}
                  onCustomerLogin={handleCustomerLogin}
                  defaultTab="register"
                />
              );
            case 'dashboard':
              return customer ? (
                <CustomerDashboard 
                  customer={customer} 
                  onLogout={handleCustomerLogout} 
                />
              ) : (
                <CustomerLanding 
                  onLoginClick={handleLoginClick}
                  onRegisterClick={handleRegisterClick}
                />
              );
            default:
              return (
                <CustomerLanding 
                  onLoginClick={handleLoginClick}
                  onRegisterClick={handleRegisterClick}
                />
              );
          }
        })()}
      </Route>
    </Switch>
  );
}