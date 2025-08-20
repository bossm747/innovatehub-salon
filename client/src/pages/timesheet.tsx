import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInMinutes, differenceInHours, parseISO } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  User,
  Timer,
  Play,
  TrendingUp,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Staff, TimeRecord } from "@shared/schema";

const clockActionSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  notes: z.string().optional(),
});

export default function Timesheet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("clock");

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: timeRecords = [] } = useQuery<TimeRecord[]>({
    queryKey: ["/api/time-records"],
  });

  const { data: attendanceReport = [] } = useQuery<any[]>({
    queryKey: ["/api/time-records/report"],
  });

  // Get active time record for selected staff
  const getActiveRecord = (staffId: string) => {
    return timeRecords.find((record: TimeRecord) => 
      record.staffId === staffId && record.status === 'active'
    );
  };

  // Forms for different actions
  const clockInForm = useForm({
    resolver: zodResolver(clockActionSchema),
    defaultValues: {
      staffId: "",
      notes: "",
    },
  });

  const clockOutForm = useForm({
    resolver: zodResolver(clockActionSchema.omit({ staffId: true })),
    defaultValues: {
      notes: "",
    },
  });

  const breakForm = useForm({
    resolver: zodResolver(clockActionSchema.omit({ staffId: true })),
    defaultValues: {
      notes: "",
    },
  });

  // Mutations for time tracking actions
  const clockInMutation = useMutation({
    mutationFn: async (data: { staffId: string; notes?: string }) => {
      return apiRequest('POST', '/api/time-records/clock-in', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-records"] });
      toast({ title: "Clocked in successfully" });
      clockInForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to clock in", variant: "destructive" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (data: { id: string; notes?: string }) => {
      return apiRequest('POST', `/api/time-records/${data.id}/clock-out`, { notes: data.notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-records"] });
      toast({ title: "Clocked out successfully" });
      clockOutForm.reset();
      setSelectedStaff("");
    },
    onError: () => {
      toast({ title: "Failed to clock out", variant: "destructive" });
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: async (data: { id: string; notes?: string }) => {
      return apiRequest('POST', `/api/time-records/${data.id}/start-break`, { notes: data.notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-records"] });
      toast({ title: "Break started" });
      breakForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to start break", variant: "destructive" });
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: async (data: { id: string; notes?: string }) => {
      return apiRequest('POST', `/api/time-records/${data.id}/end-break`, { notes: data.notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-records"] });
      toast({ title: "Break ended" });
      breakForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to end break", variant: "destructive" });
    },
  });

  // Handle form submissions
  const handleClockIn = (data: any) => {
    clockInMutation.mutate(data);
  };

  const handleClockOut = (data: any) => {
    const activeRecord = getActiveRecord(selectedStaff);
    if (activeRecord) {
      clockOutMutation.mutate({ id: activeRecord.id, notes: data.notes });
    }
  };

  const handleStartBreak = (data: any) => {
    const activeRecord = getActiveRecord(selectedStaff);
    if (activeRecord) {
      startBreakMutation.mutate({ id: activeRecord.id, notes: data.notes });
    }
  };

  const handleEndBreak = (data: any) => {
    const activeRecord = getActiveRecord(selectedStaff);
    if (activeRecord) {
      endBreakMutation.mutate({ id: activeRecord.id, notes: data.notes });
    }
  };

  // Calculate total hours worked
  const calculateHours = (startTime: string, endTime?: string) => {
    const start = parseISO(startTime);
    const end = endTime ? parseISO(endTime) : new Date();
    return differenceInHours(end, start);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Timesheet</h1>
          <p className="text-muted-foreground">
            Track staff attendance and working hours
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Time</p>
            <p className="text-lg font-mono">
              {format(currentTime, "MMM dd, yyyy HH:mm:ss")}
            </p>
          </div>
          <Clock className="h-6 w-6 text-primary" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          <TabsTrigger value="history">Live History</TabsTrigger>
          <TabsTrigger value="reports">Attendance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clock In Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-green-600" />
                  Clock In
                </CardTitle>
                <CardDescription>
                  Start your work shift
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...clockInForm}>
                  <form onSubmit={clockInForm.handleSubmit(handleClockIn)} className="space-y-4">
                    <FormField
                      control={clockInForm.control}
                      name="staffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Member</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedStaff(value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staff.map((member: any) => (
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
                      control={clockInForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Add any notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={clockInMutation.isPending || !selectedStaff || !!getActiveRecord(selectedStaff)}
                    >
                      {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Clock Out / Break Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-red-600" />
                  Clock Out & Breaks
                </CardTitle>
                <CardDescription>
                  End shift or manage breaks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStaff && getActiveRecord(selectedStaff) ? (
                  <>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Currently Working
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {staff.find((s: any) => s.id === selectedStaff)?.name} is currently clocked in
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Form {...breakForm}>
                        <form onSubmit={breakForm.handleSubmit(handleStartBreak)}>
                          <FormField
                            control={breakForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem className="mb-3">
                                <FormControl>
                                  <Input placeholder="Break notes..." {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            disabled={startBreakMutation.isPending}
                          >
                            <Coffee className="h-4 w-4 mr-2" />
                            Start Break
                          </Button>
                        </form>
                      </Form>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => endBreakMutation.mutate({ id: getActiveRecord(selectedStaff)?.id || "", notes: "" })}
                        disabled={endBreakMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        End Break
                      </Button>
                    </div>

                    <Form {...clockOutForm}>
                      <form onSubmit={clockOutForm.handleSubmit(handleClockOut)}>
                        <FormField
                          control={clockOutForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Clock out notes..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full mt-3 bg-red-600 hover:bg-red-700"
                          disabled={clockOutMutation.isPending}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Timer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff ? "Staff member is not clocked in" : "Select a staff member to manage their time"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Staff Status */}
          {timeRecords.filter((record: any) => record.status === 'active').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Currently Active Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeRecords
                    .filter((record: any) => record.status === 'active')
                    .map((record: any) => {
                      const staffMember = staff.find((s: any) => s.id === record.staffId);
                      const duration = differenceInMinutes(new Date(), parseISO(record.clockInTime));
                      
                      return (
                        <div key={record.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{staffMember?.name}</h4>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Active
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Started: {format(parseISO(record.clockInTime), "HH:mm")}
                          </p>
                          <p className="text-sm font-medium">
                            Duration: {formatDuration(duration)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Real-time Time Records
              </CardTitle>
              <CardDescription>
                Live view of all staff time tracking activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Break Time</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeRecords.map((record: any) => {
                    const staffMember = staff.find((s: any) => s.id === record.staffId);
                    const totalHours = record.clockOutTime 
                      ? calculateHours(record.clockInTime, record.clockOutTime)
                      : calculateHours(record.clockInTime);
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {staffMember?.name || 'Unknown Staff'}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(record.clockInTime), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(record.clockInTime), "HH:mm")}
                        </TableCell>
                        <TableCell>
                          {record.clockOutTime 
                            ? format(parseISO(record.clockOutTime), "HH:mm")
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {record.breakMinutes ? `${record.breakMinutes}m` : "-"}
                        </TableCell>
                        <TableCell>
                          {totalHours}h
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.status === 'active' ? 'default' : 'secondary'}
                            className={record.status === 'active' ? 'bg-green-600' : ''}
                          >
                            {record.status === 'active' ? 'Working' : 'Completed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {timeRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No time records found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Staff Attendance Report
              </CardTitle>
              <CardDescription>
                Comprehensive attendance analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {attendanceReport.reduce((sum: number, staff: any) => sum + (staff.totalHours || 0), 0)}h
                    </div>
                    <p className="text-sm text-muted-foreground">Total Hours This Week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {attendanceReport.reduce((sum: number, staff: any) => sum + (staff.daysWorked || 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Days Worked</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {attendanceReport.length > 0 
                        ? (attendanceReport.reduce((sum: number, staff: any) => sum + (staff.attendanceRate || 0), 0) / attendanceReport.length).toFixed(1)
                        : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average Attendance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {staff.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Days Worked</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Average Daily Hours</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Punctuality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceReport.map((staffReport: any) => {
                    const staffMember = staff.find((s: any) => s.id === staffReport.staffId);
                    
                    return (
                      <TableRow key={staffReport.staffId}>
                        <TableCell className="font-medium">
                          {staffMember?.name || 'Unknown Staff'}
                        </TableCell>
                        <TableCell>
                          {staffMember?.role || '-'}
                        </TableCell>
                        <TableCell>
                          {staffReport.daysWorked || 0}
                        </TableCell>
                        <TableCell>
                          {staffReport.totalHours || 0}h
                        </TableCell>
                        <TableCell>
                          {(staffReport.daysWorked || 0) > 0 
                            ? ((staffReport.totalHours || 0) / (staffReport.daysWorked || 1)).toFixed(1)
                            : 0}h
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(staffReport.attendanceRate || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[3rem]">
                              {staffReport.attendanceRate || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={(staffReport.punctualityScore || 0) >= 90 ? 'default' : 
                                   (staffReport.punctualityScore || 0) >= 70 ? 'secondary' : 'destructive'}
                          >
                            {(staffReport.punctualityScore || 0) >= 90 ? 'Excellent' :
                             (staffReport.punctualityScore || 0) >= 70 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {attendanceReport.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}