import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Phone, 
  MapPin, 
  Star, 
  Calendar,
  Scissors,
  Sparkles,
  Heart,
  Shield,
  Award,
  Users,
  Mail,
  MessageCircle,
  ChevronRight,
  User,
  Timer,
  Flower2,
  LogIn,
  UserPlus
} from "lucide-react";

interface CustomerLandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function CustomerLanding({ onLoginClick, onRegisterClick }: CustomerLandingProps) {
  // Get services and staff for display
  const { data: services = [] } = useQuery({
    queryKey: ["/api/customer/services"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/customer/staff"],
  });

  const featuredServices = (services as any[]).slice(0, 8);
  const teamMembers = (staff as any[]).slice(0, 6);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0" 
        style={{ backgroundImage: "url('/hero-background.jpeg')" }}
      ></div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Stunning Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20"></div>
          {/* Enhanced Animated Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-75 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-20 right-1/4 w-28 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-65 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/3 right-1/5 w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '5s' }}></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            
            {/* Brand */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight uppercase">
                  JustPause
                </h1>
                <p className="text-xl text-purple-100 font-medium uppercase tracking-wider">
                  Salon & Spa
                </p>
              </div>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold leading-tight text-white mb-6 uppercase tracking-wide">
              Your Ultimate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 uppercase">
                Relaxation Destination
              </span>
            </h2>

            <p className="text-xl text-purple-100 leading-relaxed mb-12 max-w-3xl mx-auto">
              Experience premium spa and salon services in the heart of Balayan, Batangas. 
              Book your appointment online and discover why we're the most trusted wellness center.
            </p>

            {/* Quick Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-yellow-300" />
                  <div className="text-left">
                    <p className="font-semibold text-white uppercase tracking-wide">Location</p>
                    <p className="text-sm text-purple-100">Balayan, Batangas</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-green-300" />
                  <div className="text-left">
                    <p className="font-semibold text-white uppercase tracking-wide">Hours</p>
                    <p className="text-sm text-purple-100">9AM - 8PM Daily</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-blue-300" />
                  <div className="text-left">
                    <p className="font-semibold text-white uppercase tracking-wide">Contact</p>
                    <p className="text-sm text-purple-100">+63 917 123 4567</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-yellow-300 fill-current" />
                  <div className="text-left">
                    <p className="font-semibold text-white uppercase tracking-wide">Rating</p>
                    <p className="text-sm text-purple-100">5.0 Stars</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-4 text-lg"
                onClick={onRegisterClick}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Book Appointment Now
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                onClick={onLoginClick}
              >
                <LogIn className="mr-2 h-6 w-6" />
                Customer Login
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Licensed & Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm">200+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="text-sm">5-Star Rated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="text-center">
            <p className="text-sm mb-2">Discover Our Services</p>
            <ChevronRight className="h-6 w-6 mx-auto rotate-90" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-purple-50 to-pink-50 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
              Our Premium Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Indulge in our carefully curated selection of spa and salon treatments, 
              designed to rejuvenate your body, mind, and spirit.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              onClick={onRegisterClick}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Any Service Now
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredServices.map((service: any) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 rounded-full flex items-center justify-center group-hover:from-purple-300 group-hover:to-pink-300 transition-colors shadow-lg">
                      <Scissors className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{service.name}</h3>
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
                        onClick={onRegisterClick}
                      >
                        Book This Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
              Why Choose JustPause?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing you with exceptional service and unforgettable experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 rounded-full flex items-center justify-center shadow-lg">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Expert Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                Our certified therapists and stylists have years of experience in premium spa and salon services.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-200 via-cyan-200 to-sky-200 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Premium Products</h3>
              <p className="text-gray-600 leading-relaxed">
                We use only the finest, organic products that are safe for your skin and the environment.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">5-Star Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Rated 5 stars by over 200+ satisfied customers who keep coming back for more.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              onClick={onRegisterClick}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Start Your Journey Today
            </Button>
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

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Join hundreds of satisfied customers who trust JustPause for their wellness needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-4 text-lg"
                onClick={onRegisterClick}
              >
                <Calendar className="mr-2 h-6 w-6" />
                Book Appointment
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                onClick={onLoginClick}
              >
                <LogIn className="mr-2 h-6 w-6" />
                Customer Login
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Phone className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
              <h4 className="font-semibold mb-2">Call Us</h4>
              <p className="text-purple-100">+63 917 123 4567</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-green-300" />
              <h4 className="font-semibold mb-2">WhatsApp</h4>
              <p className="text-purple-100">Chat with us</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-blue-300" />
              <h4 className="font-semibold mb-2">Visit Us</h4>
              <p className="text-purple-100">Balayan, Batangas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-pink-300" />
              <h4 className="font-semibold mb-2">Open Daily</h4>
              <p className="text-purple-100">9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h3 className="text-2xl font-bold">JustPause Salon & Spa</h3>
          </div>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Your premier destination for relaxation and beauty in Balayan, Batangas. 
            Book online or call us to schedule your perfect spa day.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Licensed & Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span>200+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>5-Star Rated</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 JustPause Salon & Spa. All rights reserved. | Balayan, Batangas, Philippines
          </p>
        </div>
      </footer>
    </div>
  );
}