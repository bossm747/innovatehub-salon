import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Mail,
  Users,
  Upload,
  Send,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from "lucide-react";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
  audience: z.enum(["all_clients", "recent_clients", "vip_clients", "uploaded_leads"]),
  scheduleType: z.enum(["now", "scheduled"]),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

const csvUploadSchema = z.object({
  file: z.any().refine((file) => file?.length > 0, "CSV file is required"),
});

export default function Marketing() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: campaigns = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const { data: uploadedLeads = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/leads"],
  });

  const { data: campaignStats } = useQuery({
    queryKey: ["/api/marketing/stats"],
  });

  const campaignForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      audience: "all_clients",
      scheduleType: "now",
      scheduledDate: "",
      scheduledTime: "",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: z.infer<typeof campaignSchema>) => {
      const response = await apiRequest("/api/marketing/campaigns", "POST", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
      campaignForm.reset();
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Campaign Creation Failed",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest(`/api/marketing/campaigns/${campaignId}/send`, "POST");
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Sent",
        description: "Your email campaign has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/stats"] });
    },
  });

  const uploadLeadsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("csv", file);

      // Simulate upload progress
      const uploadPromise = apiRequest("/api/marketing/leads/upload", "POST", formData);
      
      // Mock progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 200);

      const response = await uploadPromise;
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Leads Uploaded",
        description: `Successfully uploaded ${data?.count || 0} leads from CSV file.`,
      });
      setCsvFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/leads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest(`/api/marketing/campaigns/${campaignId}`, "DELETE");
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Deleted",
        description: "Campaign has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
    },
  });

  const onCreateCampaign = (data: z.infer<typeof campaignSchema>) => {
    createCampaignMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleUploadLeads = () => {
    if (csvFile) {
      uploadLeadsMutation.mutate(csvFile);
    }
  };

  const getAudienceCount = (audience: string) => {
    switch (audience) {
      case "all_clients":
        return clients.length;
      case "recent_clients":
        return Math.floor(clients.length * 0.3);
      case "vip_clients":
        return Math.floor(clients.length * 0.1);
      case "uploaded_leads":
        return uploadedLeads.length;
      default:
        return 0;
    }
  };

  const { data: marketingStats } = useQuery({
    queryKey: ["/api/marketing/stats"],
    queryFn: () => fetch("/api/marketing/stats").then(res => res.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Email Marketing</h1>
          <p className="text-slate-600 mt-2">
            Create and manage email campaigns for your clients and leads
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>
                Design and schedule your email marketing campaign
              </DialogDescription>
            </DialogHeader>
            
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit(onCreateCampaign)} className="space-y-4">
                <FormField
                  control={campaignForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Spa Promotion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Relax and Rejuvenate this Summer!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_clients">
                            All Clients ({getAudienceCount("all_clients")} contacts)
                          </SelectItem>
                          <SelectItem value="recent_clients">
                            Recent Clients ({getAudienceCount("recent_clients")} contacts)
                          </SelectItem>
                          <SelectItem value="vip_clients">
                            VIP Clients ({getAudienceCount("vip_clients")} contacts)
                          </SelectItem>
                          <SelectItem value="uploaded_leads">
                            Uploaded Leads ({getAudienceCount("uploaded_leads")} contacts)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Content *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your email content here..."
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="scheduleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send Schedule</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="now">Send Now</SelectItem>
                          <SelectItem value="scheduled">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {campaignForm.watch("scheduleType") === "scheduled" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={campaignForm.control}
                      name="scheduledDate"
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
                      control={campaignForm.control}
                      name="scheduledTime"
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
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCampaignMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500"
                  >
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="spa-card-shadow bg-gradient-to-br from-pink-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{marketingStats?.totalCampaigns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="spa-card-shadow bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Emails Sent</p>
                <p className="text-2xl font-bold text-slate-900">{marketingStats?.totalSent?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="spa-card-shadow bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Open Rate</p>
                <p className="text-2xl font-bold text-slate-900">{marketingStats?.openRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="spa-card-shadow bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Click Rate</p>
                <p className="text-2xl font-bold text-slate-900">{marketingStats?.clickRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="spa-card-shadow bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900">{marketingStats?.conversionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload Section */}
        <Card className="spa-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-500" />
              Upload Leads
            </CardTitle>
            <CardDescription>
              Upload a CSV file with email leads for targeted campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="mb-2">
                    Choose CSV File
                  </Button>
                </label>
                <p className="text-sm text-gray-500">
                  CSV should contain: email, firstName, lastName, phone
                </p>
              </div>
            </div>

            {csvFile && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{csvFile.name}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setCsvFile(null)}
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button
                  onClick={handleUploadLeads}
                  disabled={uploadLeadsMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500"
                >
                  {uploadLeadsMutation.isPending ? "Uploading..." : "Upload Leads"}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audience Overview */}
        <Card className="spa-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              Audience Overview
            </CardTitle>
            <CardDescription>
              Current contact database statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">{clients.length}</p>
                <p className="text-sm text-slate-600">Total Clients</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{uploadedLeads.length}</p>
                <p className="text-sm text-slate-600">Uploaded Leads</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recent Clients (30 days)</span>
                <Badge variant="outline">{Math.floor(clients.length * 0.3)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">VIP Clients</span>
                <Badge variant="outline">{Math.floor(clients.length * 0.1)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Subscriptions</span>
                <Badge variant="outline">{Math.floor(clients.length * 0.15)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="spa-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-yellow-500" />
            Recent Campaigns
          </CardTitle>
          <CardDescription>
            Manage your email marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first email campaign to get started</p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: any) => (
                <div key={campaign.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">
                          {campaign.audience.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {campaign.status === "sent" ? "Sent" : "Draft"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => sendCampaignMutation.mutate(campaign.id)}
                          disabled={sendCampaignMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-green-600"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}