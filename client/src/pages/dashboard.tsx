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

  const { data: stats, isLoading: statsLoading } = useQuery<{
    todayAppointments: number;
    dailyRevenue: number | string;
    totalClients: number;
    monthlyRevenue: number | string;
  }>({
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
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 shadow-lg">
                  <CalendarCheck className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
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
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg group-hover:from-emerald-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                  <Banknote className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="ml-4 lg:ml-6">
                  <p className="text-responsive-sm font-medium text-slate-600">Daily Revenue</p>
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-slate-900">
                    ₱{typeof stats?.dailyRevenue === 'number' ? stats.dailyRevenue.toFixed(2) : parseFloat(stats?.dailyRevenue || "0").toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg group-hover:from-purple-600 group-hover:to-violet-700 transition-all duration-300 shadow-lg">
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
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
          
          <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
            <CardContent className="card-responsive">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg group-hover:from-orange-600 group-hover:to-amber-700 transition-all duration-300 shadow-lg">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
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
            <Card className="spa-card-shadow hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 border-rose-200 shadow-rose-100/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-responsive-lg bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 lg:space-y-4">
                  <Button 
                    className="w-full justify-between bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl border-0"
                    onClick={() => setAppointmentModalOpen(true)}
                  >
                    <div className="flex items-center">
                      <Plus className="mr-3 h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      <span className="text-responsive-base font-medium text-white">New Appointment</span>
                    </div>
                  </Button>
                  
                  <Button 
                    className="w-full justify-between bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl border-0"
                    onClick={() => setClientModalOpen(true)}
                  >
                    <div className="flex items-center">
                      <UserPlus className="mr-3 h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      <span className="text-responsive-base font-medium text-white">Add Client</span>
                    </div>
                  </Button>
                  
                  <Button 
                    className="w-full justify-between bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 lg:py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl border-0"
                    onClick={() => window.location.href = '/appointments'}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-3 h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      <span className="text-responsive-base font-medium text-white">View Calendar</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="spa-card-shadow hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 border-cyan-200 shadow-cyan-100/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-responsive-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-bold">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {!todayAppointments || !Array.isArray(todayAppointments) || (todayAppointments as any[])?.length === 0 ? (
                  <div className="text-center py-8 px-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-slate-200">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">No appointments scheduled for today</p>
                    <p className="text-sm text-slate-500 mb-4">Start by scheduling your first appointment</p>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => setAppointmentModalOpen(true)}
                    >
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(todayAppointments) && (todayAppointments as any[])?.map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]">
                        <div className="flex items-center space-x-4">
                          <div className="text-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-3 rounded-lg shadow-lg">
                            <div className="text-sm font-semibold">{appointment.time}</div>
                            <div className="text-xs opacity-90">{appointment.duration} min</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-900 mb-1">{appointment.clientName}</div>
                            <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full inline-block">{appointment.serviceName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 
                            appointment.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg' : 
                            appointment.status === 'cancelled' ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                          }`}>
                            {appointment.status}
                          </div>
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all duration-300">
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
