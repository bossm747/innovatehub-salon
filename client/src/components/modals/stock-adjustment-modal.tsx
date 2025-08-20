import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const transactionTypes = [
  { value: "purchase", label: "Purchase (Stock In)" },
  { value: "sale", label: "Sale (Stock Out)" },
  { value: "adjustment", label: "Stock Adjustment" },
  { value: "waste", label: "Waste/Damage" },
];

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export default function StockAdjustmentModal({ 
  open, 
  onOpenChange, 
  product 
}: StockAdjustmentModalProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertInventoryTransactionSchema>>({
    resolver: zodResolver(insertInventoryTransactionSchema),
    defaultValues: {
      productId: product?.id || "",
      type: "adjustment",
      quantity: 0,
      unitCost: "0",
      totalCost: "0",
      reason: "",
      reference: "",
      staffId: "",
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertInventoryTransactionSchema>) => {
      const response = await apiRequest("/api/inventory-transactions", "POST", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-transactions"] });
      toast({
        title: "Success",
        description: "Stock adjustment recorded successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record stock adjustment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertInventoryTransactionSchema>) => {
    const adjustedData = {
      ...data,
      productId: product.id,
      totalCost: data.unitCost && data.quantity ? 
        (parseFloat(data.unitCost) * data.quantity).toString() : 
        data.totalCost
    };
    createTransactionMutation.mutate(adjustedData);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Adjustment - {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Current Stock:</span>
            <span className="font-medium">{product.currentStock} {product.unit}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Min Stock Level:</span>
            <span className="font-medium">{product.minStockLevel} {product.unit}</span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Enter quantity"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost (₱)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Invoice number, PO number, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reason for stock adjustment" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTransactionMutation.isPending}>
                {createTransactionMutation.isPending ? "Recording..." : "Record Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}