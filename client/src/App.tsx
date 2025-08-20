import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import MobileApp from "@/pages/mobile-app";
import HotelDashboard from "@/pages/hotel-dashboard";
import MerchantDashboard from "@/pages/merchant-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import HotelLogin from "@/pages/hotel-login";
import MerchantLogin from "@/pages/merchant-login";
import LandingPage from "@/pages/landing-page";
import MerchantLandingPage from "@/pages/merchant-landing";
import ClientLandingPage from "@/pages/client-landing";
import NotFound from "@/pages/not-found";
import Logo from "@/components/Logo";
import ClientRegister from "@/pages/client-register";
import TestApi from "@/pages/test-api";
import TestNotifications from "@/pages/test-notifications";
import TestRealScenarios from "@/pages/test-real-scenarios";
import TestValidation from "@/pages/test-validation";
import ClientDashboard from "@/pages/client-dashboard";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles: string[] }) {
  const [location, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      // Redirect to appropriate login page based on route
      if (location.includes("/admin")) {
        setLocation("/admin/login");
      } else if (location.includes("/hotel")) {
        setLocation("/hotel/login");
      } else if (location.includes("/merchant")) {
        setLocation("/merchant/login");
      }
      return;
    }

    const user = JSON.parse(userStr);
    if (!allowedRoles.includes(user.role)) {
      setLocation("/");
      return;
    }

    setIsAuthorized(true);
  }, [location, allowedRoles, setLocation]);

  if (isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return isAuthorized ? <Component /> : null;
}

function Navigation() {
  const [activeTab, setActiveTab] = useState("mobile");
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("hotel");
    localStorage.removeItem("merchant");
    window.location.href = "/";
  };

  const tabs = [
    { id: "landing", label: "Accueil", path: "/landing" },
    { id: "merchants", label: "Commerçants", path: "/landing1" },
    { id: "clients", label: "Application", path: "/landing2" },
    { id: "mobile", label: "App Mobile", path: "/" },
    { id: "hotel", label: "Dashboard Hôtel", path: "/hotel" },
    { id: "merchant", label: "Dashboard Commerçant", path: "/merchant" },
    { id: "admin", label: "Admin", path: "/admin" },
  ];

  return (
    <nav className="bg-zishop-blue shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Logo variant="yellow-blue" size="xl" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setLocation(tab.path);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-zishop-blue"
                        : "text-white hover:text-yellow-400 hover:bg-zishop-blue-light"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-white">
                  {user.username} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-white hover:text-yellow-400"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Wrapper pour ClientRegister compatible avec le routeur
function ClientRegisterRoute() {
  const [, setLocation] = useLocation();
  return (
    <ClientRegister
      onRegisterSuccess={() => setLocation("/client-dashboard")}
      onBackToLogin={() => setLocation("/")}
    />
  );
}
// Wrapper pour ClientDashboard compatible avec le routeur
function ClientDashboardRoute() {
  // Récupérer le client depuis localStorage
  const clientStr = localStorage.getItem("client");
  const client = clientStr ? JSON.parse(clientStr) : null;
  const lastHotelStr = localStorage.getItem("lastHotel");
  const lastHotel = lastHotelStr ? JSON.parse(lastHotelStr) : null;
  const [, setLocation] = useLocation();
  if (!client) {
    setLocation("/");
    return null;
  }
  return (
    <ClientDashboard
      client={client}
      lastHotel={lastHotel}
      onLogout={() => {
        localStorage.removeItem("client");
        setLocation("/");
      }}
      onStartShopping={() => setLocation("/")}
    />
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route path="/landing1" component={MerchantLandingPage} />
        <Route path="/landing2" component={ClientLandingPage} />
        <Route path="/" component={MobileApp} />
        
        {/* Login routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/hotel/login" component={HotelLogin} />
        <Route path="/merchant/login" component={MerchantLogin} />
        
        {/* Inscription client */}
        <Route path="/client/register" component={ClientRegisterRoute} />
        {/* Dashboard client direct */}
        <Route path="/client-dashboard" component={ClientDashboardRoute} />
        
        {/* Protected routes */}
        <Route path="/hotel">
          {() => <ProtectedRoute component={HotelDashboard} allowedRoles={["hotel"]} />}
        </Route>
        <Route path="/merchant">
          {() => <ProtectedRoute component={MerchantDashboard} allowedRoles={["merchant"]} />}
        </Route>
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
        </Route>
        
        <Route path="/test-api" component={TestApi} />
        <Route path="/test-notifications" component={TestNotifications} />
        <Route path="/test-real-scenarios" component={TestRealScenarios} />
        <Route path="/test-validation" component={TestValidation} />
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
