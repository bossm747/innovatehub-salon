import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Phone, AlertCircle } from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";

interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes?: string;
  totalAmount: string;
  bookingSource: string;
  customerNotes?: string;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: string;
  };
  staff: {
    id: string;
    name: string;
    role: string;
  };
}

interface CustomerAppointmentsProps {
  customerId: string;
}

export default function CustomerAppointments({ customerId }: CustomerAppointmentsProps) {
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/customer', customerId, 'appointments'],
  });

  const getAppointmentStatusColor = (status: string, appointmentDate: string) => {
    const aptDate = parseISO(`${appointmentDate}T00:00:00`);
    const isPastAppointment = isPast(aptDate);

    if (status === 'cancelled') return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    if (isPastAppointment && status === 'confirmed') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
  };

  const getDateLabel = (dateString: string) => {
    const aptDate = parseISO(`${dateString}T00:00:00`);
    if (isToday(aptDate)) return 'Today';
    if (isTomorrow(aptDate)) return 'Tomorrow';
    return format(aptDate, 'EEEE, MMMM dd, yyyy');
  };

  const getStatusLabel = (status: string, appointmentDate: string) => {
    const aptDate = parseISO(`${appointmentDate}T00:00:00`);
    const isPastAppointment = isPast(aptDate);

    if (status === 'cancelled') return 'Cancelled';
    if (isPastAppointment && status === 'confirmed') return 'Completed';
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending Confirmation';
    return 'Confirmed';
  };

  // Sort appointments: upcoming first, then past appointments
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = parseISO(`${a.date}T${a.time}`);
    const dateB = parseISO(`${b.date}T${b.time}`);
    
    const isPastA = isPast(dateA);
    const isPastB = isPast(dateB);
    
    // Upcoming appointments first, sorted by date ascending
    if (!isPastA && !isPastB) return dateA.getTime() - dateB.getTime();
    if (!isPastA && isPastB) return -1;
    if (isPastA && !isPastB) return 1;
    
    // Past appointments last, sorted by date descending
    return dateB.getTime() - dateA.getTime();
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-pink-600 rounded-full mr-3"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading your appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No appointments yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Book your first service to get started on your wellness journey!
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              Book Your First Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = sortedAppointments.filter(apt => 
    !isPast(parseISO(`${apt.date}T${apt.time}`)) && apt.status !== 'cancelled'
  );
  
  const pastAppointments = sortedAppointments.filter(apt => 
    isPast(parseISO(`${apt.date}T${apt.time}`)) || apt.status === 'cancelled' || apt.status === 'completed'
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Upcoming Appointments ({upcomingAppointments.length})
          </h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-0 shadow-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 backdrop-blur-sm border-l-4 border-l-pink-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {appointment.service.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.service.description}
                          </p>
                        </div>
                        <Badge className={getAppointmentStatusColor(appointment.status, appointment.date)}>
                          {getStatusLabel(appointment.status, appointment.date)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                          <span className="font-medium">{getDateLabel(appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-pink-500" />
                          <span>{appointment.time} ({appointment.duration} mins)</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <User className="h-4 w-4 mr-2 text-pink-500" />
                          <span>{appointment.staff.name}</span>
                        </div>
                      </div>

                      {appointment.customerNotes && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Your notes:</span> {appointment.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ₱{appointment.totalAmount}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Booked {appointment.bookingSource === 'online' ? 'online' : 'via phone'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Past Appointments ({pastAppointments.length})
          </h3>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-0 shadow-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between opacity-75">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {appointment.service.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {appointment.service.description}
                          </p>
                        </div>
                        <Badge className={getAppointmentStatusColor(appointment.status, appointment.date)}>
                          {getStatusLabel(appointment.status, appointment.date)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{format(parseISO(`${appointment.date}T00:00:00`), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{appointment.time} ({appointment.duration} mins)</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4 mr-2" />
                          <span>{appointment.staff.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 text-right">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        ₱{appointment.totalAmount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Appointment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Appointments:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{appointments.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Upcoming:</span>
                  <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">{upcomingAppointments.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">{pastAppointments.length}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₱{appointments.reduce((total, apt) => total + parseFloat(apt.totalAmount), 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}