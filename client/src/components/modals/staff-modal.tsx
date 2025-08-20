import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStaffSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Common salon and spa specialties
const SALON_SPA_SPECIALTIES = [
  // Hair Services
  "Hair Cutting & Styling",
  "Hair Coloring",
  "Hair Highlights & Lowlights", 
  "Hair Extensions",
  "Keratin Treatment",
  "Hair Perming",
  "Hair Rebonding",
  "Bridal Hair Styling",
  
  // Facial & Skin Care
  "Classic Facial",
  "Anti-Aging Facial",
  "Acne Treatment",
  "Hydrafacial",
  "Microdermabrasion",
  "Chemical Peels",
  "Diamond Peel",
  "Oxygen Facial",
  
  // Body Treatments
  "Swedish Massage",
  "Deep Tissue Massage",
  "Hot Stone Massage",
  "Aromatherapy Massage",
  "Prenatal Massage",
  "Thai Massage",
  "Shiatsu Massage",
  "Reflexology",
  
  // Beauty Services
  "Manicure",
  "Pedicure",
  "Gel Nails",
  "Nail Art",
  "Eyebrow Threading",
  "Eyebrow Microblading",
  "Eyelash Extensions",
  "Makeup Application",
  
  // Spa Treatments
  "Body Scrub",
  "Body Wrap",
  "Cellulite Treatment",
  "Slimming Treatment",
  "Detox Treatment",
  "Couples Massage",
  
  // Specialized Services
  "Waxing (Full Body)",
  "IPL Hair Removal",
  "RF Skin Tightening",
  "Cavitation Treatment",
  "Permanent Makeup"
];

export default function StaffModal({ open, onOpenChange }: StaffModalProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertStaffSchema>>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      specialties: [],
      experience: 0,
      isActive: true,
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertStaffSchema>) => {
      const response = await apiRequest("/api/staff", "POST", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertStaffSchema>) => {
    // Ensure specialties is an array
    const formattedData = {
      ...data,
      specialties: Array.isArray(data.specialties) ? data.specialties : []
    };
    createStaffMutation.mutate(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-responsive max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-responsive-lg">Add Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to your salon and spa team
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-responsive">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter staff member's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="staff@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Massage Therapist, Esthetician" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="0"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => {
                const currentSpecialties = Array.isArray(field.value) ? field.value : [];
                return (
                  <FormItem>
                    <FormLabel>
                      Specialties {currentSpecialties.length > 0 && (
                        <span className="text-xs text-slate-500">({currentSpecialties.length} selected)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <ScrollArea className="h-48 border rounded-md p-3">
                        <div className="grid grid-cols-1 gap-2">
                          {SALON_SPA_SPECIALTIES.map((specialty) => {
                            const isChecked = currentSpecialties.includes(specialty);
                            
                            return (
                              <div key={specialty} className="flex items-center space-x-2">
                                <Checkbox
                                  id={specialty}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...currentSpecialties, specialty]);
                                    } else {
                                      field.onChange(currentSpecialties.filter((s) => s !== specialty));
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={specialty}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {specialty}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createStaffMutation.isPending}
              >
                {createStaffMutation.isPending ? "Adding..." : "Add Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
