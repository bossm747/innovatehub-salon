import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import CustomerLanding from "./customer-landing";
import CustomerDashboard from "./customer-dashboard";
import CustomerBooking from "./customer-booking";

export default function CustomerPortalMain() {
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if customer is already logged in (from localStorage)
  useEffect(() => {
    const savedCustomer = localStorage.getItem('customer-session');
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('customer-session');
      }
    }
    setIsLoading(false);
  }, []);

  const handleCustomerLogin = (customerData: any) => {
    setCustomer(customerData);
    // Save to localStorage for persistence
    localStorage.setItem('customer-session', JSON.stringify(customerData));
  };

  const handleCustomerLogout = () => {
    setCustomer(null);
    localStorage.removeItem('customer-session');
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
          <CustomerLanding onCustomerLogin={handleCustomerLogin} />
        )}
      </Route>
      <Route path="/customer">
        {customer ? (
          <CustomerDashboard 
            customer={customer} 
            onLogout={handleCustomerLogout} 
          />
        ) : (
          <CustomerLanding onCustomerLogin={handleCustomerLogin} />
        )}
      </Route>
    </Switch>
  );
}