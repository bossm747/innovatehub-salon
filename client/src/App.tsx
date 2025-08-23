import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Clients from "@/pages/clients";
import Services from "@/pages/services";
import Staff from "@/pages/staff";
import Inventory from "@/pages/inventory";
import POS from "@/pages/pos";
import Timesheet from "@/pages/timesheet";
import Marketing from "@/pages/marketing";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Documentation from "@/pages/documentation";
import Landing from "@/pages/landing";
import CustomerPortalMain from "@/pages/customer-portal-main";
import WalkInRegistration from "@/pages/walk-in";
import Preloader from "@/components/preloader";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function AdminRouter({ showDocs, setShowDocs }: { showDocs: boolean; setShowDocs: (show: boolean) => void }) {
  if (showDocs) {
    return <Documentation onBack={() => setShowDocs(false)} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/customers" component={Clients} />
      <Route path="/services" component={Services} />
      <Route path="/staff" component={Staff} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/pos" component={POS} />
      <Route path="/timesheet" component={Timesheet} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/walk-in" component={WalkInRegistration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function CustomerRouter() {
  return (
    <Switch>
      <Route path="/customer/*:rest?" component={CustomerPortalMain} />
      <Route component={() => <CustomerPortalMain />} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [appState, setAppState] = useState<'loading' | 'landing' | 'app'>('loading');

  // Always show preloader and landing page on every load

  const handlePreloaderComplete = () => {
    setAppState('landing');
  };

  const handleEnterApp = () => {
    localStorage.setItem('serenity-spa-visited', 'true');
    setAppState('app');
  };

  if (appState === 'loading') {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {appState === 'landing' ? (
          <Landing onEnter={handleEnterApp} />
        ) : (
          <Switch>
            {/* Customer Portal Routes */}
            <Route path="/customer/*:rest?">
              <CustomerRouter />
            </Route>
            
            {/* Admin Routes */}
            <Route>
              <div className="min-h-screen spa-background">
                {/* Admin Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                {/* Main content area */}
                <div className="admin-main-content">
                  {/* Admin Header */}
                  <Header 
                    onMenuClick={() => setSidebarOpen(true)} 
                    onDocsClick={() => setShowDocs(true)}
                  />
                  
                  {/* Page content */}
                  <main className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-full overflow-x-hidden bg-slate-50/30">
                    <div className="container-responsive">
                      <AdminRouter showDocs={showDocs} setShowDocs={setShowDocs} />
                    </div>
                  </main>
                </div>
              </div>
            </Route>
          </Switch>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
