import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Plus,
  History,
  Settings,
  LogOut,
  Sparkles,
  CreditCard
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface CustomerDashboardProps {
  customer: any;
  onLogout: () => void;
}

export default function CustomerDashboard({ customer, onLogout }: CustomerDashboardProps) {
  const [, navigate] = useLocation();

  // Get customer's appointments
  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: [`/api/customer/${customer.id}/appointments`],
  });

  const upcomingAppointments = (appointments as any[]).filter((apt: any) => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    return aptDate > new Date() && apt.status !== 'cancelled';
  });

  const pastAppointments = (appointments as any[]).filter((apt: any) => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    return aptDate <= new Date() || apt.status === 'completed';
  });

  const handleBookAppointment = () => {
    navigate("/customer/book");
  };

  const handleViewProfile = () => {
    navigate("/customer/profile");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarImage src={customer.profileImageUrl} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {customer.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {customer.name}!
                </h1>
                <p className="text-purple-100">
                  Ready for your next relaxing experience?
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleBookAppointment}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="border-white text-white hover:bg-white/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  <p className="text-sm text-gray-600">Upcoming Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pastAppointments.length}</p>
                  <p className="text-sm text-gray-600">Completed Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">VIP</p>
                  <p className="text-sm text-gray-600">Member Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button onClick={handleBookAppointment} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Book New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No upcoming appointments
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Book your next relaxing spa session with us!
                    </p>
                    <Button onClick={handleBookAppointment}>
                      <Plus className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">
                              {appointment.serviceName}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.time)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {appointment.staffName || 'Any available staff'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="text-right">
                              <p className="font-semibold text-purple-600">
                                ₱{appointment.totalAmount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Appointment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No appointment history
                    </h3>
                    <p className="text-gray-600">
                      Your completed appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">
                              {appointment.serviceName}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.time)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="text-right">
                              <p className="font-semibold text-gray-600">
                                ₱{appointment.totalAmount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={customer.profileImageUrl} />
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl font-bold">
                        {customer.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-gray-600">VIP Member since {formatDate(customer.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{customer.phone}</p>
                        </div>
                      </div>

                      {customer.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{customer.email}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {customer.address && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">{customer.address}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-purple-600">Member Status</p>
                          <p className="font-medium text-purple-700">VIP Customer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button onClick={handleViewProfile} className="w-full sm:w-auto">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
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