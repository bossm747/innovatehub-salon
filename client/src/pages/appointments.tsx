import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AppointmentModal from "@/components/modals/appointment-modal";
import BookingCalendar from "@/components/booking-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Appointments() {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", "date", selectedDate],
    queryFn: () => fetch(`/api/appointments?date=${selectedDate}`).then(res => res.json()),
  });

  const { data: allAppointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

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

  const deleteAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      apiRequest(`/api/appointments/${appointmentId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay(); // Day of week for first day
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const currentDay = today.getDate();

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/salon-bg-4.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-white/90"></div>
        
        <div className="relative z-10 space-y-6 sm:space-y-8 p-4">
        <div className="flex-responsive justify-between">
          <div>
            <h2 className="text-responsive-lg font-bold text-slate-900">Appointments</h2>
            <p className="mt-2 text-responsive-base text-slate-600">Manage bookings and schedule appointments</p>
          </div>
          <Button 
            className="button-responsive bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={() => setAppointmentModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Calendar View */}
        <Card className="mb-8 spa-card-shadow hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <CardTitle className="text-responsive-lg">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-primary/10"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 hover:bg-primary/10"
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    setSelectedDate(today.toISOString().split('T')[0]);
                  }}
                >
                  Today
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-primary/10"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mini Calendar */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-slate-600 py-2">{day}</div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="py-2"></div>;
                }
                
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;
                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const today = new Date();
                const isToday = 
                  day === today.getDate() && 
                  currentMonth.getMonth() === today.getMonth() && 
                  currentMonth.getFullYear() === today.getFullYear();
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`py-2 text-sm rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-primary text-white font-medium' 
                        : isToday 
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="spa-card-shadow hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-responsive-lg">Appointments for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {!appointments || !Array.isArray(appointments) || appointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No appointments scheduled for this date</p>
                <Button 
                  className="mt-4"
                  onClick={() => setAppointmentModalOpen(true)}
                >
                  Schedule Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(appointments) && appointments.map((appointment: any) => (
                  <div key={appointment.id} className="p-6 lg:p-8 border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className="text-center min-w-0">
                          <div className="text-lg font-semibold text-slate-900">{appointment.time}</div>
                          <div className="text-xs text-slate-500">{appointment.duration} min</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900">{appointment.clientName}</div>
                          <div className="text-sm text-slate-500">{appointment.serviceName}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {appointment.staffName && `with ${appointment.staffName}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'pending' ? 'secondary' : 
                          appointment.status === 'cancelled' ? 'outline' : 'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingAppointment(appointment);
                                setAppointmentModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
                                    Are you sure you want to cancel this appointment for {appointment.clientName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    {cancelAppointmentMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete this appointment for {appointment.clientName}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleteAppointmentMutation.isPending ? "Deleting..." : "Delete Permanently"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      <AppointmentModal 
        open={appointmentModalOpen} 
        onOpenChange={(open) => {
          setAppointmentModalOpen(open);
          if (!open) setEditingAppointment(null);
        }}
        appointment={editingAppointment}
      />
    </>
  );
}
