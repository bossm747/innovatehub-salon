import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Lock,
  UserPlus,
  Sparkles,
  Phone,
  User,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Heart,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerAuthProps {
  onBack: () => void;
  onCustomerLogin: (customer: any) => void;
  defaultTab?: "login" | "register";
}

export default function CustomerAuth({ onBack, onCustomerLogin, defaultTab = "login" }: CustomerAuthProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ phone: "", pin: "" });
  const [registerForm, setRegisterForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    pin: "",
    confirmPin: ""
  });

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

    if (registerForm.pin !== registerForm.confirmPin) {
      toast({
        title: "PIN mismatch",
        description: "Please make sure both PIN fields match",
        variant: "destructive",
      });
      return;
    }

    if (registerForm.pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JustPause</h1>
                <p className="text-sm text-gray-600">Customer Portal</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {activeTab === "login" ? "Welcome Back" : "Join JustPause"}
            </CardTitle>
            <p className="text-gray-600">
              {activeTab === "login" 
                ? "Sign in to manage your appointments" 
                : "Create an account to book appointments"
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-phone" className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="+63 917 123 4567"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-pin" className="font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      PIN
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="login-pin"
                        type={showPin ? "text" : "password"}
                        placeholder="Enter your 4-digit PIN"
                        value={loginForm.pin}
                        onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                        maxLength={4}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setActiveTab("register")}
                    className="text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Sign up here
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-6 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-phone" className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+63 917 123 4567"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email" className="font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="register-pin" className="font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Create 4-digit PIN
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="register-pin"
                        type={showPin ? "text" : "password"}
                        placeholder="Create a secure PIN"
                        value={registerForm.pin}
                        onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value })}
                        maxLength={4}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-pin" className="font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm PIN
                    </Label>
                    <Input
                      id="confirm-pin"
                      type={showPin ? "text" : "password"}
                      placeholder="Confirm your PIN"
                      value={registerForm.confirmPin}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPin: e.target.value })}
                      maxLength={4}
                      className="mt-2"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className="text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Sign in here
                  </button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Trust Indicators */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>Trusted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span>200+ Customers</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Option */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm mb-3">
            Prefer to book by phone?
          </p>
          <Button 
            variant="outline" 
            className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => window.open('tel:+639171234567', '_self')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call +63 917 123 4567
          </Button>
        </div>
      </div>
    </div>
  );
}