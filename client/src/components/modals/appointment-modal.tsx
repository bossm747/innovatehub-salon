import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const appointmentFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  status: z.string().default("confirmed"),
  notes: z.string().optional(),
  customerNotes: z.string().optional(),
  totalAmount: z.string().optional(),
}).refine((data) => {
  const appointmentDateTime = new Date(`${data.date}T${data.time}`);
  const now = new Date();
  return appointmentDateTime > now;
}, {
  message: "Appointment must be scheduled for a future date and time",
  path: ["date"]
});

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any; // For editing existing appointments
}

export default function AppointmentModal({ open, onOpenChange, appointment }: AppointmentModalProps) {
  const { toast } = useToast();

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      customerId: "",
      serviceId: "",
      staffId: "",
      date: "",
      time: "",
      status: "confirmed",
      notes: "",
      customerNotes: "",
      totalAmount: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentFormSchema>) => {
      if (appointment?.id) {
        // Update existing appointment
        const response = await apiRequest(`/api/appointments/${appointment.id}`, "PUT", data);
        return response;
      } else {
        // Create new appointment
        const response = await apiRequest("/api/appointments", "POST", data);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: appointment?.id ? "Appointment updated successfully" : "Appointment created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || (appointment?.id ? "Failed to update appointment" : "Failed to create appointment"),
        variant: "destructive",
      });
    },
  });

  // Reset form when modal opens/closes or appointment changes
  useEffect(() => {
    if (open && appointment) {
      form.reset({
        customerId: appointment.customerId ?? "",
        serviceId: appointment.serviceId ?? "",
        staffId: appointment.staffId ?? "",
        date: appointment.date ?? "",
        time: appointment.time ?? "",
        status: appointment.status ?? "confirmed",
        notes: appointment.notes ?? "",
        customerNotes: appointment.customerNotes ?? "",
        totalAmount: appointment.totalAmount ? String(appointment.totalAmount) : "",
      });
    } else if (open && !appointment) {
      form.reset({
        customerId: "",
        serviceId: "",
        staffId: "",
        date: "",
        time: "",
        status: "confirmed",
        notes: "",
        customerNotes: "",
        totalAmount: "",
      });
    }
  }, [open, appointment, form]);

  const onSubmit = (data: z.infer<typeof appointmentFormSchema>) => {
    // Find selected service to get price and duration
    const selectedService = (services as any[]).find((s: any) => s.id === data.serviceId);
    if (!selectedService) {
      toast({
        title: "Error",
        description: "Please select a valid service",
        variant: "destructive",
      });
      return;
    }
    
    // Get default staff if none selected
    const selectedStaffId = data.staffId || (staff as any[])?.[0]?.id;
    if (!selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member or ensure staff data is loaded",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare submission data with proper types
    const submissionData = {
      customerId: data.customerId,
      serviceId: data.serviceId,
      staffId: selectedStaffId,
      date: data.date,
      time: data.time,
      duration: selectedService.duration,
      status: data.status || "confirmed",
      notes: data.notes || "",
      totalAmount: selectedService.price.toString(),
      bookingSource: "staff"
    };
    
    console.log('Submitting appointment data:', submissionData);
    createAppointmentMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-responsive max-h-[90vh] overflow-y-auto spa-modal-shadow">
        <DialogHeader>
          <DialogTitle className="text-responsive-lg">
            {appointment?.id ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment?.id ? "Update the appointment details" : "Create a new appointment for your client"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-responsive">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(customers) && customers.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(services) && services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.duration} min - ₱{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapist</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a therapist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(staff) && staff.map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests or notes..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                className="button-responsive"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="button-responsive"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
