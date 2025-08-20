import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Star, Bus, Calendar, Edit, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StaffModal from "@/components/modals/staff-modal";

export default function Staff() {
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="grid-responsive-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex-responsive justify-between">
          <div>
            <h2 className="text-responsive-lg font-bold text-slate-900">Staff</h2>
            <p className="mt-2 text-responsive-base text-slate-600">Manage staff members and schedules</p>
          </div>
          <Button 
            className="button-responsive"
            onClick={() => setStaffModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>

        {/* Staff Grid */}
        {!staff || staff.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No staff members</h3>
              <p className="text-slate-500 mb-6">Get started by adding your first staff member</p>
              <Button onClick={() => setStaffModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member: any) => (
              <Card key={member.id} className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="mx-auto h-20 w-20 mb-3">
                      <AvatarImage src={`https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200&seed=${member.id}`} />
                      <AvatarFallback className="text-lg">
                        {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Experience:</span>
                      <span className="text-slate-900">{member.experience || 0} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Specialties:</span>
                      <span className="text-slate-900 text-right">
                        {member.specialties?.length > 0 
                          ? member.specialties.join(', ')
                          : 'None specified'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-900">4.9</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status:</span>
                      <Badge variant={member.isActive ? 'default' : 'secondary'}>
                        {member.isActive ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Schedule
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <StaffModal 
        open={staffModalOpen} 
        onOpenChange={setStaffModalOpen} 
      />
    </>
  );
}
