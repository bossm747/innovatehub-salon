import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Phone, 
  MapPin, 
  Star, 
  User, 
  Calendar,
  Lock,
  UserPlus,
  Scissors,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface CustomerLandingProps {
  onCustomerLogin: (customer: any) => void;
}

export default function CustomerLanding({ onCustomerLogin }: CustomerLandingProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ phone: "", pin: "" });
  const [registerForm, setRegisterForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    pin: "" 
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get services for display
  const { data: services = [] } = useQuery({
    queryKey: ["/api/customer/services"],
  });

  // Get staff for display
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/customer/staff"],
  });

  const featuredServices = (services as any[]).slice(0, 6);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const customer = await apiRequest("/api/customer/login", "POST", loginForm);
      toast({
        title: "Welcome back!",
        description: `Hello ${(customer as any).name}, you're now logged in.`,
      });
      onCustomerLogin(customer);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid phone number or PIN",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const customer = await apiRequest("/api/customer/register", "POST", {
        ...registerForm,
        portalPin: registerForm.pin
      });
      toast({
        title: "Registration successful!",
        description: `Welcome ${(customer as any).name}! You can now book appointments.`,
      });
      onCustomerLogin(customer);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestBooking = () => {
    navigate("/customer/book-guest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to JustPause
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            Your relaxation journey starts here
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-purple-100">
              <MapPin className="h-5 w-5" />
              <span>Balayan, Batangas</span>
            </div>
            <div className="flex items-center gap-2 text-purple-100">
              <Phone className="h-5 w-5" />
              <span>+63 917 123 4567</span>
            </div>
            <div className="flex items-center gap-2 text-purple-100">
              <Clock className="h-5 w-5" />
              <span>9AM - 8PM Daily</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Services & Info */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-6 w-6 text-purple-600" />
                  Featured Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {featuredServices.map((service: any) => (
                    <div key={service.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">₱{service.price}</Badge>
                        <span className="text-sm text-gray-500">{service.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(staff as any[]).slice(0, 4).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{member.name}</h5>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Login/Register */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">
                  Book Your Appointment
                </CardTitle>
                <p className="text-center text-gray-600">
                  Login to your account or book as a guest
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-phone">Phone Number</Label>
                        <Input
                          id="login-phone"
                          type="tel"
                          placeholder="+63 917 123 4567"
                          value={loginForm.phone}
                          onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-pin">PIN</Label>
                        <Input
                          id="login-pin"
                          type="password"
                          placeholder="Enter your 4-digit PIN"
                          value={loginForm.pin}
                          onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                          maxLength={4}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-phone">Phone Number</Label>
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+63 917 123 4567"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-email">Email (Optional)</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-pin">Create 4-digit PIN</Label>
                        <Input
                          id="register-pin"
                          type="password"
                          placeholder="Create a 4-digit PIN"
                          value={registerForm.pin}
                          onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value })}
                          maxLength={4}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Separator />
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Don't want to create an account?
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGuestBooking}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Book as Guest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-yellow-600">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Rated 5 stars by 200+ happy customers
                  </p>
                  <p className="text-xs text-gray-500">
                    Book now and experience the best spa services in Balayan!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}