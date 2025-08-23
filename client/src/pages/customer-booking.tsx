import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Check,
  Scissors,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface CustomerBookingProps {
  customer: any;
}

export default function CustomerBooking({ customer }: CustomerBookingProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Get services and staff
  const { data: services = [] } = useQuery({
    queryKey: ["/api/customer/services"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/customer/staff"],
  });

  // Available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30"
  ];

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select service, date, and time.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      await apiRequest("/api/customer/book", "POST", {
        customerId: customer.id,
        serviceId: selectedService.id,
        staffId: selectedStaff?.id || null,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        customerNotes: "",
      });

      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      });

      navigate("/customer");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/customer")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Book Appointment</h1>
              <p className="text-purple-100">Choose your service and preferred time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Step 1: Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-purple-600" />
                Step 1: Choose Your Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(services as any[]).map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      {selectedService?.id === service.id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">₱{service.price}</Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration}min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Staff Selection (Optional) */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Step 2: Choose Staff (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStaff === null
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedStaff(null)}
                  >
                    <div className="flex items-center gap-3">
                      {selectedStaff === null && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">Any Available Staff</h3>
                        <p className="text-sm text-gray-600">Let us choose for you</p>
                      </div>
                    </div>
                  </div>
                  
                  {(staff as any[]).map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedStaff?.id === member.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedStaff(member)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        {selectedStaff?.id === member.id && (
                          <Check className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {member.specialties?.slice(0, 2).map((specialty: string) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Date & Time Selection */}
          {selectedService && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    Step 3: Choose Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < today}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Step 4: Choose Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={selectedTime === time ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {formatTime(time)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Booking Summary & Confirm */}
          {selectedService && selectedDate && selectedTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
                        <p className="text-sm text-gray-600">Service: {selectedService.name}</p>
                        <p className="text-sm text-gray-600">Duration: {selectedService.duration} minutes</p>
                        <p className="text-sm text-gray-600">
                          Staff: {selectedStaff?.name || "Any available staff"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Appointment Details</h4>
                        <p className="text-sm text-gray-600">
                          Date: {format(selectedDate, "MMMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Time: {formatTime(selectedTime)}
                        </p>
                        <p className="text-lg font-bold text-purple-600 mt-2">
                          Total: ₱{selectedService.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isBooking ? "Confirming Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}