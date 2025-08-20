import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  RefreshCw, 
  BarChart3,
  Package,
  Loader2
} from "lucide-react";

const categories = [
  { value: "hair-care", label: "Hair Care" },
  { value: "skin-care", label: "Skin Care" },
  { value: "tools", label: "Tools" },
  { value: "equipment", label: "Equipment" },
  { value: "retail", label: "Retail" },
];

const units = [
  { value: "pcs", label: "Pieces" },
  { value: "ml", label: "Milliliters" },
  { value: "g", label: "Grams" },
  { value: "kg", label: "Kilograms" },
  { value: "l", label: "Liters" },
  { value: "oz", label: "Ounces" },
];

interface EnhancedProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnhancedProductModal({ open, onOpenChange }: EnhancedProductModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<any>(null);

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      sku: "",
      barcode: "",
      costPrice: "0",
      retailPrice: "0",
      currentStock: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unit: "pcs",
      supplierId: "",
      imageUrl: "",
      imageName: "",
      aiGenerated: false,
      aiPrompt: "",
      marketPrice: "0",
      competitors: "",
      tags: "",
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertProductSchema>) => {
      const response = await apiRequest("/api/products", "POST", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      onOpenChange(false);
      form.reset();
      setImagePreview(null);
      setUploadedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setUploadedImage(data);
      setImagePreview(data.imageUrl);
      
      form.setValue('imageUrl', data.imageUrl);
      form.setValue('imageName', data.imageName);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const generateWithAI = async () => {
    const category = form.getValues('category');
    if (!category) {
      toast({
        title: "Select Category",
        description: "Please select a category first",
        variant: "destructive",
      });
      return;
    }

    // Get existing form data to enhance rather than replace
    const existingData = {
      name: form.getValues('name'),
      description: form.getValues('description'),
      brand: form.getValues('brand'),
      sku: form.getValues('sku'),
      barcode: form.getValues('barcode'),
      costPrice: form.getValues('costPrice'),
      retailPrice: form.getValues('retailPrice'),
      marketPrice: form.getValues('marketPrice'),
      minStockLevel: form.getValues('minStockLevel'),
      maxStockLevel: form.getValues('maxStockLevel'),
      unit: form.getValues('unit'),
    };

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, existingData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate product data');
      }

      const aiData = await response.json();
      
      // Only update fields that are empty or need enhancement
      if (!existingData.name || existingData.name === "") {
        form.setValue('name', aiData.name);
      }
      if (!existingData.description || existingData.description === "") {
        form.setValue('description', aiData.description);
      }
      if (!existingData.brand || existingData.brand === "") {
        form.setValue('brand', aiData.brand);
      }
      if (!existingData.sku || existingData.sku === "") {
        form.setValue('sku', aiData.sku);
      }
      if (!existingData.barcode || existingData.barcode === "") {
        form.setValue('barcode', aiData.barcode);
      }
      if (!existingData.costPrice || existingData.costPrice === "0") {
        form.setValue('costPrice', aiData.costPrice);
      }
      if (!existingData.retailPrice || existingData.retailPrice === "0") {
        form.setValue('retailPrice', aiData.retailPrice);
      }
      if (!existingData.marketPrice || existingData.marketPrice === "0") {
        form.setValue('marketPrice', aiData.marketPrice);
      }
      if (!existingData.unit || existingData.unit === "pcs") {
        form.setValue('unit', aiData.unit);
      }
      
      // Always update these research-based fields
      form.setValue('competitors', Array.isArray(aiData.competitors) ? aiData.competitors.join(', ') : '');
      form.setValue('tags', Array.isArray(aiData.tags) ? aiData.tags.join(', ') : '');
      form.setValue('aiGenerated', true);
      form.setValue('aiPrompt', aiData.aiPrompt);

      const hasExistingData = Object.values(existingData).some(value => value && value !== "" && value !== "0");
      
      toast({
        title: hasExistingData ? "AI Enhanced!" : "AI Generated!",
        description: hasExistingData 
          ? "Your product data has been enhanced with Philippine market research"
          : "Product data generated successfully from Philippine market research",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate product data with AI",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateSKU = async () => {
    const category = form.getValues('category');
    const brand = form.getValues('brand');
    const name = form.getValues('name');

    if (!category || !brand || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in category, brand, and name first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/ai/generate-sku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, brand, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SKU');
      }

      const data = await response.json();
      form.setValue('sku', data.sku);

      toast({
        title: "SKU Generated",
        description: "Unique SKU generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate SKU",
        variant: "destructive",
      });
    }
  };

  const generateBarcode = async () => {
    try {
      const response = await fetch('/api/ai/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate barcode');
      }

      const data = await response.json();
      form.setValue('barcode', data.barcode);

      toast({
        title: "Barcode Generated",
        description: "EAN-13 barcode generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate barcode",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: z.infer<typeof insertProductSchema>) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Product with AI Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm">Philippine Market AI Research</h3>
              <p className="text-xs text-slate-600 mt-1">
                Generate authentic product data based on real Philippine spa/salon market research
              </p>
            </div>
            <Button
              type="button"
              onClick={generateWithAI}
              disabled={isGeneratingAI || !form.getValues('category')}
              className="flex items-center gap-2"
            >
              {isGeneratingAI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <FormLabel>Product Image</FormLabel>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Click to upload image</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description" 
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SKU and Barcode Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      SKU
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateSKU}
                        className="h-6 px-2 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Barcode
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateBarcode}
                        className="h-6 px-2 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter barcode" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (₱) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retailPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Price (₱)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Market Price (₱)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock and Supplier Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
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
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* AI-Generated Tags and Competitors */}
            {form.watch('aiGenerated') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">AI-Generated Market Data</span>
                </div>
                
                {form.watch('tags') && (
                  <div>
                    <FormLabel className="text-sm">Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('tags')?.split(',').filter(Boolean).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {form.watch('competitors') && (
                  <div>
                    <FormLabel className="text-sm">Competitors</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('competitors')?.split(',').filter(Boolean).map((competitor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {competitor.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}