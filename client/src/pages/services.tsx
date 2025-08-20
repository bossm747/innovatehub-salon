import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star, Scissors } from "lucide-react";
import ServiceModal from "@/components/modals/service-modal";

// Service categories will be dynamically generated from database

export default function Services() {
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid-responsive-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Generate categories dynamically from services data
  const generateCategories = () => {
    if (!services) return [{ id: "all", name: "All Services", count: 0 }];
    
    const uniqueCategories = [...new Set((services as any[]).map((service: any) => service.category))];
    const categories = [
      { id: "all", name: "All Services", count: services.length }
    ];
    
    uniqueCategories.forEach(category => {
      const count = (services as any[]).filter(s => s.category === category).length;
      categories.push({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        count
      });
    });
    
    return categories;
  };

  const categoriesWithCounts = generateCategories();

  const filteredServices = services?.filter((service: any) => 
    selectedCategory === "all" || service.category === selectedCategory
  ) || [];

  return (
    <>
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/salon-bg-3.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-white/90"></div>
        
        <div className="relative z-10 space-y-6 sm:space-y-8 p-4">
        <div className="flex-responsive justify-between">
          <div>
            <h2 className="text-responsive-lg font-bold text-slate-900">Services</h2>
            <p className="mt-2 text-responsive-base text-slate-600">Manage spa services and pricing</p>
          </div>
          <Button 
            className="button-responsive"
            onClick={() => setServiceModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Service Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categoriesWithCounts.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-sm"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Scissors className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-500 mb-6">
                {services?.length === 0 
                  ? "Get started by adding your first service"
                  : "No services found in this category"
                }
              </p>
              <Button onClick={() => setServiceModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service: any) => (
              <Card key={service.id} className="overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Scissors className="h-16 w-16 text-primary/40" />
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                    <span className="text-lg font-bold text-primary">₱{service.price}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                    <span>{service.duration} minutes</span>
                    <Badge variant="secondary">{service.category.replace('-', ' ')}</Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {service.description || "Professional spa service designed to rejuvenate and refresh."}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-600">4.8 (24 reviews)</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>

      <ServiceModal 
        open={serviceModalOpen} 
        onOpenChange={setServiceModalOpen} 
      />
    </>
  );
}
