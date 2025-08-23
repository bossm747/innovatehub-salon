import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  experience: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

interface BookingCalendarProps {
  selectedService?: Service;
  selectedStaff?: Staff;
  customerId?: string;
  onBookingComplete?: (booking: any) => void;
  showServiceSelection?: boolean;
  showStaffSelection?: boolean;
}

export default function BookingCalendar({ 
  selectedService, 
  selectedStaff, 
  customerId,
  onBookingComplete,
  showServiceSelection = true,
  showStaffSelection = true
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [localSelectedService, setLocalSelectedService] = useState<Service | undefined>(selectedService);
  const [localSelectedStaff, setLocalSelectedStaff] = useState<Staff | undefined>(selectedStaff);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/customer/services'],
    enabled: showServiceSelection,
  });

  // Fetch staff
  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ['/api/customer/staff'],
    enabled: showStaffSelection,
  });

  // Fetch availability for selected date and service
  const { data: timeSlots = [], isLoading: loadingSlots, refetch: refetchSlots } = useQuery<TimeSlot[]>({
    queryKey: ['/api/booking/availability', selectedDate.toISOString().split('T')[0], localSelectedService?.id, localSelectedStaff?.id],
    enabled: !!localSelectedService,
  });

  // Book appointment mutation
  const bookMutation = useMutation({
    mutationFn: async (bookingData: {
      customerId: string;
      serviceId: string;
      staffId: string;
      date: string;
      time: string;
      customerNotes?: string;
    }) => {
      return await apiRequest('/api/customer/book', 'POST', bookingData);
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking confirmed!",
        description: `Your appointment has been scheduled for ${format(selectedDate, 'MMMM dd, yyyy')} at ${selectedTime}.`,
      });
      setSelectedTime("");
      refetchSlots();
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onBookingComplete?.(booking);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Get week days
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }), // Monday start
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  });

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setLocalSelectedService(service);
    setSelectedTime("");
  };

  // Handle staff selection
  const handleStaffSelect = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    setLocalSelectedStaff(staffMember);
    setSelectedTime("");
  };

  // Handle booking
  const handleBooking = () => {
    if (!customerId) {
      toast({
        title: "Login required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!localSelectedService || !localSelectedStaff || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select service, staff, and time slot.",
        variant: "destructive",
      });
      return;
    }

    bookMutation.mutate({
      customerId: customerId,
      serviceId: localSelectedService.id,
      staffId: localSelectedStaff.id,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
    });
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  // Get slot availability status
  const getSlotStatus = (time: string): { available: boolean; staffName?: string } => {
    const slot = timeSlots.find(s => s.time === time);
    return {
      available: slot?.available ?? true,
      staffName: slot?.staffName
    };
  };

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      {showServiceSelection && (
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Service
            </CardTitle>
            <CardDescription>Choose the service you'd like to book</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={localSelectedService?.id || ""} onValueChange={handleServiceSelect}>
              <SelectTrigger data-testid="select-booking-service">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="secondary">{service.duration}min</Badge>
                        <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100">
                          ₱{service.price}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {localSelectedService && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">{localSelectedService.name}</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">{localSelectedService.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-purple-600 dark:text-purple-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {localSelectedService.duration} minutes
                  </span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                    ₱{localSelectedService.price}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Selection */}
      {showStaffSelection && localSelectedService && (
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Select Staff Member
            </CardTitle>
            <CardDescription>Choose your preferred staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={localSelectedStaff?.id || ""} onValueChange={handleStaffSelect}>
              <SelectTrigger data-testid="select-booking-staff">
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div>
                      <span>{member.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({member.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {localSelectedStaff && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">{localSelectedStaff.name}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">{localSelectedStaff.role}</p>
                {localSelectedStaff.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {localSelectedStaff.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {localSelectedStaff.experience} years experience
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      {localSelectedService && (showStaffSelection ? localSelectedStaff : true) && (
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Select Date & Time
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')} data-testid="button-prev-week">
                  ←
                </Button>
                <span className="text-sm font-medium">
                  {format(currentWeek, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')} data-testid="button-next-week">
                  →
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Available appointments in Philippine time (GMT+8)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Week View */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isPast = isBefore(day, startOfDay(new Date()));
                const dayIsToday = isToday(day);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(day);
                        setSelectedTime("");
                      }
                    }}
                    disabled={isPast}
                    className={`p-3 text-center rounded-lg border transition-all duration-200 ${
                      isPast
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                        : dayIsToday
                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                    data-testid={`date-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className="text-xs font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-bold ${dayIsToday && !isSelected ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Available Times - {format(selectedDate, 'EEEE, MMMM dd')}
                </h3>
                {loadingSlots && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                    Loading availability...
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {generateTimeSlots().map((time) => {
                  const { available, staffName } = getSlotStatus(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      className={`p-3 text-center rounded-lg border text-sm font-medium transition-all duration-200 ${
                        !available
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isSelected
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                          : "bg-white hover:bg-pink-50 border-gray-200 hover:border-pink-300"
                      }`}
                      data-testid={`time-${time}`}
                    >
                      <div>{time}</div>
                      {!available && staffName && (
                        <div className="text-xs text-gray-500 mt-1">
                          Booked
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded mr-1"></div>
                  Selected
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white border border-gray-200 rounded mr-1"></div>
                  Available
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                  Unavailable
                </div>
              </div>
            </div>

            {/* Booking Summary & Confirmation */}
            {selectedTime && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Booking Summary
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                      <p><span className="font-medium">Service:</span> {localSelectedService?.name}</p>
                      <p><span className="font-medium">Staff:</span> {localSelectedStaff?.name}</p>
                      <p><span className="font-medium">Date:</span> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
                      <p><span className="font-medium">Time:</span> {selectedTime}</p>
                      <p><span className="font-medium">Duration:</span> {localSelectedService?.duration} minutes</p>
                      <p><span className="font-medium">Price:</span> ₱{localSelectedService?.price}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleBooking}
                    disabled={bookMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    data-testid="button-confirm-booking"
                  >
                    {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}

            {/* No service selected message */}
            {!localSelectedService && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Please select a service to view available appointment times.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}