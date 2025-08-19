import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarCheck, 
  Banknote, 
  Users, 
  Star,
  Plus,
  Calendar,
  UserPlus,
  MoreVertical,
  X
} from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppointmentModal from "@/components/modals/appointment-modal";
import ClientModal from "@/components/modals/client-modal";

export default function Dashboard() {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const { toast } = useToast();

  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      apiRequest(`/api/appointments/${appointmentId}/cancel`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", "date", today],
    queryFn: () => fetch(`/api/appointments?date=${today}`).then(res => res.json()),
  });

  if (statsLoading || appointmentsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-responsive-lg font-bold text-slate-900">Dashboard</h2>
          <p className="mt-2 text-responsive-base text-slate-600">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid-responsive-stats">
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <CalendarCheck className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                </div>
                <div className="ml-4 lg:ml-6">
                  <p className="text-responsive-sm font-medium text-slate-600">Today's Appointments</p>
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900">
                    {stats?.todayAppointments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <Banknote className="h-6 w-6 lg:h-8 lg:w-8 text-secondary" />
                </div>
                <div className="ml-4 lg:ml-6">
                  <p className="text-responsive-sm font-medium text-slate-600">Daily Revenue</p>
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900">
                    AED {typeof stats?.dailyRevenue === 'number' ? stats.dailyRevenue.toFixed(2) : parseFloat(stats?.dailyRevenue || "0").toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-accent" />
                </div>
                <div className="ml-4 lg:ml-6">
                  <p className="text-responsive-sm font-medium text-slate-600">Total Clients</p>
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900">
                    {stats?.totalClients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                </div>
                <div className="ml-4 lg:ml-6">
                  <p className="text-responsive-sm font-medium text-slate-600">Rating</p>
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900">4.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-responsive-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 lg:space-y-4">
                  <Button 
                    className="w-full justify-between bg-primary/10 hover:bg-primary/20 text-primary py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => setAppointmentModalOpen(true)}
                  >
                    <div className="flex items-center">
                      <Plus className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                      <span className="text-responsive-base font-medium">New Appointment</span>
                    </div>
                  </Button>
                  
                  <Button 
                    className="w-full justify-between bg-secondary/10 hover:bg-secondary/20 text-secondary py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => setClientModalOpen(true)}
                  >
                    <div className="flex items-center">
                      <UserPlus className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                      <span className="text-responsive-base font-medium">Add Client</span>
                    </div>
                  </Button>
                  
                  <Button 
                    className="w-full justify-between bg-accent/10 hover:bg-accent/20 text-accent py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => window.location.href = '/appointments'}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                      <span className="text-responsive-base font-medium">View Calendar</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-responsive-lg">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {!todayAppointments || !Array.isArray(todayAppointments) || (todayAppointments as any[])?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p>No appointments scheduled for today</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setAppointmentModalOpen(true)}
                    >
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(todayAppointments) && (todayAppointments as any[])?.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-slate-900">{appointment.time}</div>
                            <div className="text-xs text-slate-500">{appointment.duration} min</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{appointment.clientName}</div>
                            <div className="text-xs text-slate-500">{appointment.serviceName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' : 
                            appointment.status === 'pending' ? 'secondary' : 
                            appointment.status === 'cancelled' ? 'outline' : 'destructive'
                          }>
                            {appointment.status}
                          </Badge>
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this appointment for {appointment.clientName}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AppointmentModal 
        open={appointmentModalOpen} 
        onOpenChange={setAppointmentModalOpen} 
      />
      <ClientModal 
        open={clientModalOpen} 
        onOpenChange={setClientModalOpen} 
      />
    </>
  );
}
