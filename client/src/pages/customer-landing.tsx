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
  Sparkles,
  Heart,
  Shield,
  Award,
  Users,
  Mail,
  Facebook,
  MessageCircle,
  ChevronRight,
  Check,
  CreditCard,
  Timer,
  Flower2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerLandingProps {
  onCustomerLogin: (customer: any) => void;
}

export default function CustomerLanding({ onCustomerLogin }: CustomerLandingProps) {
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ phone: "", pin: "" });
  const [registerForm, setRegisterForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    pin: "" 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Get services and staff for display
  const { data: services = [] } = useQuery({
    queryKey: ["/api/customer/services"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/customer/staff"],
  });

  const featuredServices = (services as any[]).slice(0, 8);
  const teamMembers = (staff as any[]).slice(0, 6);

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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Login */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white rounded-full animate-pulse delay-150"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Brand & Info */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                      JustPause
                    </h1>
                    <p className="text-xl text-purple-100 font-medium">
                      Salon & Spa
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Your Ultimate
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                    Relaxation Destination
                  </span>
                </h2>

                <p className="text-xl text-purple-100 leading-relaxed">
                  Experience premium spa and salon services in the heart of Balayan, Batangas. 
                  Book your appointment online and discover why we're the most trusted wellness center.
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-yellow-300" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-sm text-purple-100">Balayan, Batangas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-green-300" />
                    <div>
                      <p className="font-semibold">Hours</p>
                      <p className="text-sm text-purple-100">9AM - 8PM Daily</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Phone className="h-6 w-6 text-blue-300" />
                    <div>
                      <p className="font-semibold">Contact</p>
                      <p className="text-sm text-purple-100">+63 917 123 4567</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-300 fill-current" />
                    <div>
                      <p className="font-semibold">Rating</p>
                      <p className="text-sm text-purple-100">5.0 Stars</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8"
                  onClick={() => scrollToSection('services')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Services
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 font-semibold px-8"
                  onClick={() => scrollToSection('contact')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Get in Touch
                </Button>
              </div>
            </div>

            {/* Right Side - Login/Register Form */}
            <div className="lg:flex lg:justify-end">
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Book Your Appointment
                  </CardTitle>
                  <p className="text-gray-600">
                    Login to your account or create a new one
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                      <TabsTrigger value="login" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Login
                      </TabsTrigger>
                      <TabsTrigger value="register" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="login-phone" className="font-semibold">Phone Number</Label>
                          <Input
                            id="login-phone"
                            type="tel"
                            placeholder="+63 917 123 4567"
                            value={loginForm.phone}
                            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="login-pin" className="font-semibold">PIN</Label>
                          <Input
                            id="login-pin"
                            type="password"
                            placeholder="Enter your 4-digit PIN"
                            value={loginForm.pin}
                            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                            maxLength={4}
                            className="mt-1"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold"
                          disabled={isLoading}
                          size="lg"
                        >
                          {isLoading ? "Logging in..." : "Login to Account"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 mt-6">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label htmlFor="register-name" className="font-semibold">Full Name</Label>
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="register-phone" className="font-semibold">Phone Number</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+63 917 123 4567"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="register-email" className="font-semibold">Email (Optional)</Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="register-pin" className="font-semibold">Create 4-digit PIN</Label>
                          <Input
                            id="register-pin"
                            type="password"
                            placeholder="Create a secure PIN"
                            value={registerForm.pin}
                            onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value })}
                            maxLength={4}
                            className="mt-1"
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
                    </TabsContent>
                  </Tabs>

                  <div className="text-center">
                    <Separator className="my-4" />
                    <p className="text-sm text-gray-600 mb-3">
                      Don't want to create an account?
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-purple-200 hover:bg-purple-50"
                      onClick={() => scrollToSection('contact')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Book via Phone Call
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
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
                        <span>200+ Happy Customers</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="text-center">
            <p className="text-sm mb-2">Discover More</p>
            <ChevronRight className="h-6 w-6 mx-auto rotate-90" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Premium Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Indulge in our carefully curated selection of spa and salon treatments, 
              designed to rejuvenate your body, mind, and spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredServices.map((service: any) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                      <Scissors className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          ₱{service.price}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Timer className="h-4 w-4" />
                          {service.duration}min
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => setActiveTab("login")}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8"
              onClick={() => setActiveTab("login")}
            >
              View All Services & Book
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose JustPause?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing you with exceptional service and unforgettable experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Expert Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                Our certified therapists and stylists have years of experience in premium spa and salon services.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Premium Products</h3>
              <p className="text-gray-600 leading-relaxed">
                We use only the finest, organic products that are safe for your skin and the environment.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Personalized Care</h3>
              <p className="text-gray-600 leading-relaxed">
                Every treatment is tailored to your unique needs and preferences for the best results.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5-Star Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Rated 5 stars by over 200+ satisfied customers who keep coming back for more.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Flexible Hours</h3>
              <p className="text-gray-600 leading-relaxed">
                Open 9AM to 8PM daily, with online booking available 24/7 for your convenience.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                <Flower2 className="h-10 w-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Relaxing Ambiance</h3>
              <p className="text-gray-600 leading-relaxed">
                Our serene environment is designed to help you unwind and escape from daily stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our skilled professionals are passionate about helping you look and feel your best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member: any) => (
              <Card key={member.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-purple-600 font-semibold">{member.role}</p>
                      <p className="text-gray-600 text-sm mt-2">{member.experience} years experience</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties?.slice(0, 3).map((specialty: string) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Visit Us Today
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Ready to experience the ultimate in relaxation and beauty? Contact us or visit our location.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Get in Touch</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Phone className="h-6 w-6 text-yellow-300" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-purple-100">+63 917 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-green-300" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-purple-100">hello@justpause.ph</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <MapPin className="h-6 w-6 text-blue-300" />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-purple-100">123 Wellness Street, Balayan, Batangas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-pink-300" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p className="text-purple-100">Monday - Sunday: 9:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Follow Us</h3>
                <div className="flex gap-4">
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    <Facebook className="mr-2 h-5 w-5" />
                    Facebook
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Book Form */}
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Quick Booking Request
                </CardTitle>
                <p className="text-gray-600 text-center">
                  Can't login? Send us a booking request and we'll contact you
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quick-name" className="font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="quick-name"
                    type="text"
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quick-phone" className="font-semibold text-gray-700">Phone Number</Label>
                  <Input
                    id="quick-phone"
                    type="tel"
                    placeholder="+63 917 123 4567"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quick-service" className="font-semibold text-gray-700">Preferred Service</Label>
                  <Input
                    id="quick-service"
                    type="text"
                    placeholder="e.g., Facial, Massage, Haircut"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quick-date" className="font-semibold text-gray-700">Preferred Date</Label>
                  <Input
                    id="quick-date"
                    type="date"
                    className="mt-1"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3"
                  size="lg"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Send Booking Request
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  We'll call you within 30 minutes to confirm your appointment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold">JustPause Salon & Spa</h3>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your premier destination for relaxation and beauty in Balayan, Batangas. 
              Book online or call us to schedule your perfect spa day.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>Licensed & Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>Health & Safety Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span>200+ Happy Customers</span>
              </div>
            </div>
            <Separator className="bg-gray-700" />
            <p className="text-gray-500 text-sm">
              © 2025 JustPause Salon & Spa. All rights reserved. | Balayan, Batangas, Philippines
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}