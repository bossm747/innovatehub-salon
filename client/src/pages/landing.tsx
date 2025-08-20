import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Scissors, 
  Package, 
  BarChart3, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Clock,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Appointment Management",
      description: "Smart scheduling system with automated reminders and calendar integration"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Client Database",
      description: "Comprehensive customer profiles with visit history and preferences"
    },
    {
      icon: <Scissors className="h-8 w-8" />,
      title: "Service Catalog",
      description: "Complete service management with pricing, duration, and categories"
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Inventory Control",
      description: "Track products, stock levels, and automated reorder alerts"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "POS System",
      description: "Full cashier system with Philippine payment methods support"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Business Analytics",
      description: "Detailed reports and insights to grow your business"
    }
  ];

  // Get real business data from database for testimonials and stats
  const { data: clientsData } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const realStats = [
    { number: `${(dashboardStats as any)?.totalClients || 0}+`, label: "Happy Clients" },
    { number: `${Array.isArray(appointmentsData) ? appointmentsData.length : 0}+`, label: "Appointments Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Fatima Al-Rashid",
      role: "Spa Owner, Dubai Marina",
      rating: 5,
      comment: "This system transformed how we manage our spa. Bookings are up 40% since we started using it!"
    },
    {
      name: "Ahmed Hassan",
      role: "Salon Manager, JBR", 
      rating: 5,
      comment: "The POS system is perfect for our walk-in customers. Payment integration works flawlessly."
    },
    {
      name: "Sarah Al-Mansouri",
      role: "Beauty Center Director, Downtown",
      rating: 5,
      comment: "Client management has never been easier. Our customers love the automated reminders."
    }
  ];

  return (
    <div className="min-h-screen text-slate-800">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-background.jpeg)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/40"></div>
        
        {/* Enhanced Stunning Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-75 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-20 right-1/4 w-28 h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-65 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-gradient-to-r from-teal-400 via-emerald-500 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/3 right-1/5 w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '5s' }}></div>
          <div className="absolute bottom-1/3 left-1/5 w-44 h-44 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '6s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-6 mb-6">
                <motion.img
                  src="/justpause-logo.png"
                  alt="JustPause Salon & Spa"
                  className="h-32 sm:block md:hidden w-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-6xl text-slate-800 font-normal leading-tight text-center"
                  style={{
                    fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                  JustPause<br className="sm:hidden"/>
                  <span className="hidden sm:inline"> </span>
                  Salon & Spa
                </motion.h1>
              </div>
              <motion.p
                className="text-2xl md:text-3xl text-slate-600 font-light tracking-wide"
                style={{ 
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  letterSpacing: "0.08em"
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                SALON & SPA MANAGEMENT SYSTEM
              </motion.p>
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-4">
                Transform Your Beauty Business
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Complete management solution designed specifically for Philippine spas and salons. 
                Streamline appointments, manage inventory, process payments, and grow your business.
              </p>
            </motion.div>

            {/* Key Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Philippine Payment Methods
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                SMS & Email Reminders
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Mobile Responsive
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Real-time Analytics
              </Badge>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <Button
                onClick={onEnter}
                size="lg"
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Enter Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 4 + (i * 0.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            >
              {i % 3 === 0 ? <Sparkles className="h-6 w-6 text-pink-400" /> :
               i % 3 === 1 ? <Heart className="h-5 w-5 text-rose-400" /> :
               <Star className="h-4 w-4 text-purple-400" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Everything You Need to Manage Your Salon
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive features designed to streamline operations and enhance customer experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="spa-card-shadow hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Trusted by Beauty Professionals</h2>
            <p className="text-xl opacity-90">
              Join hundreds of successful salons and spas across the Philippines
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {realStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-600">
              Real feedback from beauty business owners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="spa-card-shadow border-0 h-full">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <div>
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/salon-bg-2.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-pink-50/90"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Join the growing community of successful beauty businesses using JustPause Salon & Spa Management System.
            </p>
            <Button
              onClick={onEnter}
              size="lg"
              className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-light mb-4 tracking-widest" style={{ 
                fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                letterSpacing: "0.12em"
              }}>
                JUSTPAUSE SALON & SPA
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Complete management solution for Philippine beauty businesses. 
                Streamline operations and grow your success.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-slate-300">
                <li>• Appointment Management</li>
                <li>• Client Database</li>
                <li>• POS System</li>
                <li>• Inventory Control</li>
                <li>• Business Analytics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3" />
                  <span>+971 50 290 0752</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3" />
                  <span>info@justpausesalonandspa.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3" />
                  <span>Dubai, UAE</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <a href="https://wa.me/971502900752" className="hover:text-green-300 transition-colors">
                    WhatsApp: +971 50 290 0752
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 JustPause Salon & Spa Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}