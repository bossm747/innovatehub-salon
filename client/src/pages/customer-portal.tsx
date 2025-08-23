import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Calendar, Clock, Phone, User, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import BookingCalendar from "@/components/booking-calendar";
import CustomerAppointments from "@/components/customer-appointments";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  experience: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerPortalEnabled: boolean;
}

export default function CustomerPortal() {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login form state
  const [loginForm, setLoginForm] = useState({ phone: "", portalPin: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    portalPin: ""
  });

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/customer/services'],
    enabled: true,
  });

  // Fetch staff
  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ['/api/customer/staff'],
    enabled: true,
  });

  // Login mutation
  const loginMutation = useMutation<Customer, Error, { phone: string; portalPin: string }>({
    mutationFn: async (credentials: { phone: string; portalPin: string }) => {
      return await apiRequest('/api/customer/login', 'POST', credentials);
    },
    onSuccess: (customer: Customer) => {
      setCurrentCustomer(customer);
      setActiveTab("book");
      toast({
        title: "Login successful!",
        description: `Welcome back, ${customer.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<Customer, Error, typeof registerForm>({
    mutationFn: async (customerData: typeof registerForm) => {
      return await apiRequest('/api/customer/register', 'POST', customerData);
    },
    onSuccess: (customer: Customer) => {
      setCurrentCustomer(customer);
      setActiveTab("book");
      toast({
        title: "Registration successful!",
        description: `Welcome to JustPause, ${customer.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.phone || !loginForm.portalPin) {
      toast({
        title: "Missing information",
        description: "Please enter your phone number and PIN.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.portalPin) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerForm);
  };

  const groupServicesByCategory = (services: Service[]) => {
    const categories = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
    return categories;
  };

  if (!currentCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-pink-500 mr-2" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                JustPause Customer Portal
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Book your spa appointments online, manage your profile, and enjoy exclusive offers. 
              Experience relaxation at your fingertips.
            </p>
          </div>

          {/* Services Preview */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-center mb-6">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupServicesByCategory(services)).map(([category, categoryServices]) => (
                <Card key={category} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold capitalize text-pink-600 dark:text-pink-400">
                      {category.replace('-', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''} available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryServices.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{service.name}</span>
                          <Badge variant="secondary">₱{service.price}</Badge>
                        </div>
                      ))}
                      {categoryServices.length > 3 && (
                        <p className="text-xs text-gray-500">+{categoryServices.length - 3} more...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Login/Register */}
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Login
                    </CardTitle>
                    <CardDescription>
                      Access your account with phone number and PIN
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-phone">Phone Number</Label>
                        <Input
                          id="login-phone"
                          type="tel"
                          placeholder="+63 912 345 6789"
                          value={loginForm.phone}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
                          data-testid="input-login-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-pin">4-Digit PIN</Label>
                        <Input
                          id="login-pin"
                          type="password"
                          placeholder="1234"
                          maxLength={4}
                          value={loginForm.portalPin}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, portalPin: e.target.value }))}
                          data-testid="input-login-pin"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Create Account
                    </CardTitle>
                    <CardDescription>
                      Join JustPause for exclusive access and rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name">Full Name *</Label>
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Maria Santos"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                            data-testid="input-register-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email Address *</Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="maria@example.com"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-register-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-phone">Phone Number *</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+63 912 345 6789"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                            data-testid="input-register-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-address">Address</Label>
                          <Input
                            id="register-address"
                            type="text"
                            placeholder="Balayan, Batangas"
                            value={registerForm.address}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
                            data-testid="input-register-address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-dob">Date of Birth</Label>
                          <Input
                            id="register-dob"
                            type="date"
                            value={registerForm.dateOfBirth}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            data-testid="input-register-dob"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-pin">Create 4-Digit PIN *</Label>
                          <Input
                            id="register-pin"
                            type="password"
                            placeholder="1234"
                            maxLength={4}
                            value={registerForm.portalPin}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, portalPin: e.target.value }))}
                            data-testid="input-register-pin"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Logged in customer view
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {currentCustomer.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your bookings and discover new services
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setCurrentCustomer(null)}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="book" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Book Service
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              My Appointments
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <h2 className="text-xl font-semibold">Book an Appointment</h2>
            <BookingCalendar 
              customerId={currentCustomer.id}
              onBookingComplete={(booking) => {
                // Refresh appointments list and switch to appointments tab
                queryClient.invalidateQueries({ queryKey: ['/api/customer', currentCustomer.id, 'appointments'] });
                setActiveTab("appointments");
              }}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <h2 className="text-xl font-semibold">My Appointments</h2>
            <CustomerAppointments customerId={currentCustomer.id} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Name</Label>
                    <p className="font-medium">{currentCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Email</Label>
                    <p className="font-medium">{currentCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Phone</Label>
                    <p className="font-medium">{currentCustomer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Portal Status</Label>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}