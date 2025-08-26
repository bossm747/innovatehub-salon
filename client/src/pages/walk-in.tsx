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
import { UserPlus, Search, Clock, Phone, Mail, MapPin, Calendar, CheckCircle, Users, PenTool, AlertCircle, Scissors } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import SignaturePad from "@/components/signature-pad";

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
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<'search' | 'service' | 'signature' | 'waiting'>('search');
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

  // Get waiting list
  const { data: waitingList = [] } = useQuery({
    queryKey: ['/api/walk-in/waiting-list'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Walk-in registration mutation
  const walkInMutation = useMutation({
    mutationFn: async (data: {
      customerId?: string;
      name: string;
      phone: string;
      email?: string;
      serviceId: string;
      staffId: string;
      notes?: string;
      signature?: string;
      isExistingCustomer: boolean;
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
    setCurrentStep('service');
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setShowNewClientForm(true);
    setSearchQuery("");
    setCurrentStep('service');
  };

  const handleServiceSelected = () => {
    if (!appointmentForm.serviceId) {
      toast({
        title: "Service required",
        description: "Please select a service for the appointment.",
        variant: "destructive",
      });
      return;
    }

    if (selectedClient) {
      // Existing customer needs to sign
      setCurrentStep('signature');
      setShowSignaturePad(true);
    } else {
      // New customer can proceed directly
      handleSubmit();
    }
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignaturePad(false);
    setCurrentStep('waiting');
    handleSubmit();
  };

  const handleSignatureCancel = () => {
    setShowSignaturePad(false);
    setCurrentStep('service');
  };

  const handleSubmit = () => {
    if (!appointmentForm.serviceId) {
      toast({
        title: "Service required",
        description: "Please select a service.",
        variant: "destructive",
      });
      return;
    }

    if (!appointmentForm.staffId) {
      toast({
        title: "Staff member required",
        description: "Please select a staff member.",
        variant: "destructive",
      });
      return;
    }

    let clientData;
    if (selectedClient) {
      clientData = {
        customerId: selectedClient.id,
        name: selectedClient.name,
        phone: selectedClient.phone ?? "",
        email: selectedClient.email ?? "",
        signature: signature ?? "",
        isExistingCustomer: true,
      };
    } else if (showNewClientForm) {
      if (!newClientForm.name?.trim() || !newClientForm.phone?.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter customer name and phone number.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate phone number format
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(newClientForm.phone.trim())) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number.",
          variant: "destructive",
        });
        return;
      }
      
      clientData = {
        ...newClientForm,
        name: newClientForm.name.trim(),
        phone: newClientForm.phone.trim(),
        email: newClientForm.email?.trim() ?? "",
        isExistingCustomer: false,
      };
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

  const resetForm = () => {
    setSelectedClient(null);
    setShowNewClientForm(false);
    setSearchQuery("");
    setSignature("");
    setCurrentStep('search');
    setNewClientForm({ name: "", phone: "", email: "" });
    setAppointmentForm({ serviceId: "", staffId: "", notes: "" });
  };

  const selectedService = services.find(s => s.id === appointmentForm.serviceId);
  const selectedStaff = staff.find(s => s.id === appointmentForm.staffId);

  // Show signature pad if needed
  if (showSignaturePad && selectedClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-6">
        <div className="max-w-6xl mx-auto">
          <SignaturePad
            customerName={selectedClient.name}
            onSave={handleSignatureSave}
            onCancel={handleSignatureCancel}
          />
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Tablet Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-12 w-12 text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Salon Tablet Check-In
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Welcome! Please register for your walk-in service
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep === 'search' ? 'text-blue-600' : currentStep === 'service' || currentStep === 'signature' || currentStep === 'waiting' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'search' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'service' || currentStep === 'signature' || currentStep === 'waiting' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Find Customer</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center ${currentStep === 'service' ? 'text-blue-600' : currentStep === 'signature' || currentStep === 'waiting' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'service' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'signature' || currentStep === 'waiting' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Select Service</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center ${currentStep === 'signature' ? 'text-blue-600' : currentStep === 'waiting' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'signature' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'waiting' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Sign & Wait</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Flow */}
          <div className="xl:col-span-2 space-y-6">
            {/* Step 1: Customer Search */}
            {currentStep === 'search' && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl flex items-center justify-center gap-3">
                    <Search className="h-6 w-6 text-blue-500" />
                    Find Existing Customer or Register New
                  </CardTitle>
                  <CardDescription className="text-base">
                    Search by name or phone number, or register as a new customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-lg font-medium">Search Customer</Label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Enter name or phone number..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="text-lg p-6 border-2"
                      data-testid="input-customer-search"
                    />
                  </div>

                  {/* Search Results */}
                  {searchQuery.length >= 2 && searchResults.length > 0 && (
                    <div className="border rounded-lg bg-white max-h-64 overflow-y-auto">
                      <div className="p-3 bg-gray-50 border-b font-medium text-gray-700">
                        Found {searchResults.length} customer(s)
                      </div>
                      {searchResults.map((client) => (
                        <div
                          key={client.id}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg text-gray-900">{client.name}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-gray-600 flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {client.phone}
                                </p>
                                <p className="text-gray-600 flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {client.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p className="font-medium">{client.totalVisits} visits</p>
                              <p>₱{client.totalSpent} spent</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">No customers found</p>
                      <p>Would you like to register as a new customer?</p>
                    </div>
                  )}

                  {/* Register New Customer Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="button"
                      onClick={handleNewClient}
                      size="lg"
                      className="px-8 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Register New Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Service Selection */}
            {currentStep === 'service' && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl flex items-center justify-center gap-3">
                    <Scissors className="h-6 w-6 text-purple-500" />
                    Select Your Service
                  </CardTitle>
                  <CardDescription className="text-base">
                    {selectedClient ? `Welcome back, ${selectedClient.name}!` : 'Choose the service you would like today'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info if New */}
                  {showNewClientForm && (
                    <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                      <h3 className="text-lg font-semibold text-blue-900">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-base font-medium">Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter full name"
                            value={newClientForm.name}
                            onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                            className="text-lg p-4 border-2"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-base font-medium">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="09XX XXX XXXX"
                            value={newClientForm.phone}
                            onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="text-lg p-4 border-2"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email" className="text-base font-medium">Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="customer@email.com"
                            value={newClientForm.email}
                            onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                            className="text-lg p-4 border-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Choose Your Service *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            appointmentForm.serviceId === service.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                          onClick={() => setAppointmentForm(prev => ({ ...prev, serviceId: service.id }))}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {service.duration} mins
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {service.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">₱{service.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staff Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Preferred Staff (Optional)</Label>
                    <Select value={appointmentForm.staffId} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, staffId: value }))}>
                      <SelectTrigger className="text-lg p-6 border-2">
                        <SelectValue placeholder="Any available staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any available staff member</SelectItem>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('search')}
                      size="lg"
                      className="flex-1 text-lg py-4"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleServiceSelected}
                      size="lg"
                      className="flex-1 text-lg py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {selectedClient ? (
                        <>
                          <PenTool className="mr-2 h-5 w-5" />
                          Proceed to Sign
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Waiting List */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Waiting List
                </CardTitle>
                <CardDescription>
                  Current walk-in customers waiting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waitingList.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No customers waiting</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingList.map((customer: any, index: number) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.serviceName}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Overview */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-purple-500" />
                  Today's Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.duration} mins</p>
                      </div>
                      <p className="text-sm font-semibold text-blue-600">₱{service.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
