import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Phone, Bell, Clock, Send, Settings2 } from "lucide-react";

interface NotificationSettings {
  id?: string;
  spaName: string;
  spaEmail: string;
  spaPhone?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  confirmationEnabled: boolean;
  reminderEnabled: boolean;
  reminderHours: number;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NotificationSettings>({
    spaName: "Serenity Spa",
    spaEmail: "",
    spaPhone: "",
    emailEnabled: true,
    smsEnabled: false,
    confirmationEnabled: true,
    reminderEnabled: true,
    reminderHours: 24,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/notification-settings"],
    onSuccess: (data) => {
      if (data) {
        setFormData(data);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: NotificationSettings) =>
      apiRequest("/api/notification-settings", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof NotificationSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email & SMS Notifications
          </CardTitle>
          <CardDescription>
            Configure automatic appointment confirmations and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Business Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spaName">Business Name</Label>
                  <Input
                    id="spaName"
                    value={formData.spaName}
                    onChange={(e) => handleInputChange("spaName", e.target.value)}
                    placeholder="Your spa/salon name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spaEmail">Business Email</Label>
                  <Input
                    id="spaEmail"
                    type="email"
                    value={formData.spaEmail}
                    onChange={(e) => handleInputChange("spaEmail", e.target.value)}
                    placeholder="notifications@yourspa.com"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This email will be used as the sender for notifications
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spaPhone">Business Phone (Optional)</Label>
                <Input
                  id="spaPhone"
                  value={formData.spaPhone ?? ""}
                  onChange={(e) => handleInputChange("spaPhone", e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  pattern="[+]?[0-9\s\-\(\)]+"
                  title="Please enter a valid phone number"
                />
              </div>
            </div>

            {/* Email Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send appointment confirmations and reminders via email
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailEnabled}
                    onCheckedChange={(checked) => handleInputChange("emailEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Appointment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Send confirmation emails when appointments are booked
                    </p>
                  </div>
                  <Switch
                    checked={formData.confirmationEnabled}
                    onCheckedChange={(checked) => handleInputChange("confirmationEnabled", checked)}
                    disabled={!formData.emailEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminder emails before appointments
                    </p>
                  </div>
                  <Switch
                    checked={formData.reminderEnabled}
                    onCheckedChange={(checked) => handleInputChange("reminderEnabled", checked)}
                    disabled={!formData.emailEnabled}
                  />
                </div>

                {formData.reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderHours">Reminder Timing</Label>
                    <Select
                      value={formData.reminderHours.toString()}
                      onValueChange={(value) => handleInputChange("reminderHours", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="4">4 hours before</SelectItem>
                        <SelectItem value="12">12 hours before</SelectItem>
                        <SelectItem value="24">24 hours before (1 day)</SelectItem>
                        <SelectItem value="48">48 hours before (2 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* SMS Settings (Future Feature) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS Notifications
              </h3>
              
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Enable SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      SMS functionality coming soon - integrate with local SMS providers
                    </p>
                  </div>
                  <Switch
                    checked={false}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}