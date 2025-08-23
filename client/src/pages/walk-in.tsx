import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Clock, Phone, Mail, MapPin, Calendar, CheckCircle } from "lucide-react";
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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalVisits: number;
  totalSpent: string;
}

export default function WalkInRegistration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    serviceId: "",
    staffId: "",
    notes: "",
  });

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/customer/services'],
  });

  // Fetch staff
  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ['/api/customer/staff'],
  });

  // Quick search clients
  const { data: searchResults = [], refetch: searchClients } = useQuery<Client[]>({
    queryKey: ['/api/walk-in/quick-search', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  // Walk-in registration mutation
  const walkInMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email?: string;
      serviceId: string;
      staffId: string;
      notes?: string;
    }) => {
      return await apiRequest('/api/walk-in/register', 'POST', data);
    },
    onSuccess: (data: any) => {
      setShowSuccessMessage(true);
      toast({
        title: "Walk-in registration successful!",
        description: `${data.client.name} has been registered and appointment created.`,
      });
      // Reset forms
      setNewClientForm({ name: "", phone: "", email: "" });
      setAppointmentForm({ serviceId: "", staffId: "", notes: "" });
      setSelectedClient(null);
      setShowNewClientForm(false);
      setSearchQuery("");
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      searchClients();
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowNewClientForm(false);
    setSearchQuery("");
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setShowNewClientForm(true);
    setSearchQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentForm.serviceId || !appointmentForm.staffId) {
      toast({
        title: "Missing information",
        description: "Please select both service and staff member.",
        variant: "destructive",
      });
      return;
    }

    let clientData;
    if (selectedClient) {
      clientData = {
        name: selectedClient.name,
        phone: selectedClient.phone,
        email: selectedClient.email,
      };
    } else if (showNewClientForm) {
      if (!newClientForm.name || !newClientForm.phone) {
        toast({
          title: "Missing information",
          description: "Please enter customer name and phone number.",
          variant: "destructive",
        });
        return;
      }
      clientData = newClientForm;
    } else {
      toast({
        title: "No customer selected",
        description: "Please search for an existing customer or add a new one.",
        variant: "destructive",
      });
      return;
    }

    walkInMutation.mutate({
      ...clientData,
      ...appointmentForm,
    });
  };

  const selectedService = services.find(s => s.id === appointmentForm.serviceId);
  const selectedStaff = staff.find(s => s.id === appointmentForm.staffId);

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Registration Complete!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Walk-in customer has been successfully registered and appointment created.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <Button 
                onClick={() => setShowSuccessMessage(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                data-testid="button-register-another"
              >
                Register Another Walk-in
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/appointments'}
                className="w-full"
                data-testid="button-view-appointments"
              >
                View Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Walk-in Registration
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Quick registration for walk-in customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Search for existing customer or add new walk-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    data-testid="input-customer-search"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleNewClient}
                  data-testid="button-new-customer"
                >
                  New Customer
                </Button>
              </div>

              {/* Search Results */}
              {searchQuery.length >= 2 && searchResults.length > 0 && (
                <div className="border rounded-lg bg-white dark:bg-gray-700 max-h-48 overflow-y-auto">
                  {searchResults.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleClientSelect(client)}
                      data-testid={`client-search-result-${client.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {client.phone}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{client.totalVisits} visits</p>
                          <p>₱{client.totalSpent} spent</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Customer */}
              {selectedClient && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                          {selectedClient.name}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedClient.phone}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedClient.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          Existing Customer
                        </Badge>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {selectedClient.totalVisits} visits • ₱{selectedClient.totalSpent} spent
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* New Customer Form */}
              {showNewClientForm && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center mb-2">
                      <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                      <h3 className="font-semibold text-green-900 dark:text-green-100">New Walk-in Customer</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Full Name *</Label>
                        <Input
                          id="new-name"
                          placeholder="Enter full name"
                          value={newClientForm.name}
                          onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                          data-testid="input-new-client-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Phone Number *</Label>
                        <Input
                          id="new-phone"
                          type="tel"
                          placeholder="+63 912 345 6789"
                          value={newClientForm.phone}
                          onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                          data-testid="input-new-client-phone"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="new-email">Email Address (Optional)</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="email@example.com"
                          value={newClientForm.email}
                          onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                          data-testid="input-new-client-email"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Service & Staff Selection
              </CardTitle>
              <CardDescription>
                Choose service and preferred staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
                  <Select 
                    value={appointmentForm.serviceId} 
                    onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger data-testid="select-service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-sm text-gray-500 ml-4">₱{service.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member *</Label>
                  <Select 
                    value={appointmentForm.staffId} 
                    onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, staffId: value }))}
                  >
                    <SelectTrigger data-testid="select-staff">
                      <SelectValue placeholder="Select staff member" />
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
                </div>
              </div>

              {/* Service Details */}
              {selectedService && (
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                          {selectedService.name}
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                          {selectedService.description}
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Duration: {selectedService.duration} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-lg">
                          ₱{selectedService.price}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes..."
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  data-testid="input-appointment-notes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-6"
                disabled={walkInMutation.isPending}
                data-testid="button-complete-registration"
              >
                {walkInMutation.isPending ? "Processing..." : "Complete Walk-in Registration"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}