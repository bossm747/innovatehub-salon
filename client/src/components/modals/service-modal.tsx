import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
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

const categories = [
  { value: "massage", label: "Massage" },
  { value: "facial", label: "Facial" },
  { value: "body-treatment", label: "Body Treatment" },
  { value: "hair", label: "Hair" },
  { value: "nail-care", label: "Nail Care" },
];

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: any; // For editing existing service
}

export default function ServiceModal({ open, onOpenChange, service }: ServiceModalProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertServiceSchema>>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      category: service?.category || "",
      duration: service?.duration || 60,
      price: service?.price || "0",
      isActive: service?.isActive ?? true,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertServiceSchema>) => {
      if (service?.id) {
        // Update existing service
        const response = await apiRequest(`/api/services/${service.id}`, "PUT", data);
        return response;
      } else {
        // Create new service
        const response = await apiRequest("/api/services", "POST", data);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: service?.id ? "Service updated successfully" : "Service added successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || (service?.id ? "Failed to update service" : "Failed to add service"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertServiceSchema>) => {
    // Validate required fields
    if (!data.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter service name",
        variant: "destructive",
      });
      return;
    }

    if (!data.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    createServiceMutation.mutate(data);
  };

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (open && service) {
      form.reset({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        duration: service.duration || 60,
        price: service.price || "0",
        isActive: service.isActive ?? true,
      });
    } else if (open && !service) {
      form.reset({
        name: "",
        description: "",
        category: "",
        duration: 60,
        price: "0",
        isActive: true,
      });
    }
  }, [open, service, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-responsive max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-responsive-lg">Add New Service</DialogTitle>
          <DialogDescription>
            Add a new service to your salon and spa catalog
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-responsive">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        step="15"
                        placeholder="60"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 15 : parseInt(e.target.value, 10);
                          field.onChange(isNaN(value) ? 15 : Math.max(15, value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₱) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? "0" : Math.max(0, numValue).toString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>1"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                disabled={createServiceMutation.isPending}
              >
                {createServiceMutation.isPending ? "Adding..." : "Add Service"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
