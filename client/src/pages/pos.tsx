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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  QrCode,
  Banknote,
  Receipt,
  Printer,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const transactionFormSchema = z.object({
  clientId: z.string().optional(),
  staffId: z.string().min(1, "Staff member is required"),
  items: z.array(z.object({
    type: z.enum(['service', 'product']),
    id: z.string(),
    name: z.string(),
    price: z.string(),
    quantity: z.number(),
    total: z.string(),
  })),
  subtotal: z.string(),
  discount: z.string().default("0"),
  tax: z.string().default("0"),
  total: z.string(),
  paymentMethod: z.enum(["cash", "gcash", "maya", "qrph", "card"]),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

export default function POS() {
  const { toast } = useToast();
  const [cart, setCart] = useState<Array<{
    id: string;
    type: 'service' | 'product';
    name: string;
    price: string;
    quantity: number;
    total: string;
  }>>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [quickCustomerPhone, setQuickCustomerPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      clientId: "",
      staffId: "",
      items: [],
      subtotal: "0",
      discount: "0",
      tax: "0",
      total: "0",
      paymentMethod: "cash",
      paymentReference: "",
      notes: "",
    },
  });

  // Generate service categories dynamically from services data
  const generateServiceCategories = () => {
    if (!services) return [{ value: "all", label: "All Services" }];
    
    const uniqueCategories = [...new Set((services as any[]).map((service: any) => service.category))];
    const categories = [{ value: "all", label: "All Services" }];
    
    uniqueCategories.forEach(category => {
      categories.push({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
      });
    });
    
    return categories;
  };

  const serviceCategories = generateServiceCategories();

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
    { value: "gcash", label: "GCash", icon: <Smartphone className="h-4 w-4" /> },
    { value: "maya", label: "Maya (PayMaya)", icon: <Smartphone className="h-4 w-4" /> },
    { value: "qrph", label: "QR PH", icon: <QrCode className="h-4 w-4" /> },
    { value: "card", label: "Credit/Debit Card", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const filteredServices = selectedCategory === "all" 
    ? (services as any[])
    : (services as any[]).filter((service: any) => 
        service.category === selectedCategory
      );

  const addToCart = (item: any, type: 'service' | 'product') => {
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.type === type
    );

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].total = (
        parseFloat(updatedCart[existingIndex].price) * updatedCart[existingIndex].quantity
      ).toFixed(2);
      setCart(updatedCart);
    } else {
      const newItem = {
        id: item.id,
        type,
        name: item.name,
        price: type === 'service' ? item.price : item.retailPrice || item.costPrice,
        quantity: 1,
        total: type === 'service' ? item.price : item.retailPrice || item.costPrice,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (id: string, type: 'service' | 'product') => {
    setCart(cart.filter(item => !(item.id === id && item.type === type)));
  };

  const updateQuantity = (id: string, type: 'service' | 'product', newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id, type);
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.id === id && item.type === type) {
        return {
          ...item,
          quantity: newQuantity,
          total: (parseFloat(item.price) * newQuantity).toFixed(2)
        };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const discount = 0; // Can be implemented later
  const tax = subtotal * 0.12; // 12% VAT for Philippines
  const total = subtotal - discount + tax;

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/transactions", "POST", data);
      return response;
    },
    onSuccess: (transaction) => {
      setLastTransaction(transaction);
      setShowReceipt(true);
      clearCart();
      setSelectedCustomer(null);
      setCashReceived(0);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Transaction completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process transaction",
        variant: "destructive",
      });
    },
  });

  const createQuickCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("/api/clients", "POST", {
        name: customerData.name,
        phone: customerData.phone || "",
        email: customerData.email || "",
        address: "",
        status: "active"
      });
      return response;
    },
    onSuccess: (newClient) => {
      setSelectedCustomer(newClient);
      setShowQuickCustomer(false);
      setQuickCustomerName("");
      setQuickCustomerPhone("");
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "cash" && cashReceived < total) {
      toast({
        title: "Error",
        description: "Insufficient cash amount",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      clientId: selectedCustomer?.id,
      staffId: (staff as any[])[0]?.id, // Default to first staff member
      items: cart,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      paymentReference: paymentMethod !== "cash" ? `${paymentMethod.toUpperCase()}-${Date.now()}` : undefined,
      notes: ""
    };

    createTransactionMutation.mutate(transactionData);
  };

  const createQuickCustomer = () => {
    if (!quickCustomerName.trim()) return;

    createQuickCustomerMutation.mutate({
      name: quickCustomerName.trim(),
      phone: quickCustomerPhone.trim()
    });
  };

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex-responsive justify-between">
          <div>
            <h2 className="text-responsive-lg font-bold text-slate-900">Point of Sale</h2>
            <p className="mt-2 text-responsive-base text-slate-600">Process transactions and manage sales</p>
          </div>
          <Button 
            variant="outline"
            className="button-responsive"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Services and Products */}
          <div className="xl:col-span-2 space-y-6">
            {/* Service Categories */}
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="text-sm"
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Services Grid */}
            <Card className="spa-card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredServices.map((service: any) => (
                    <div
                      key={service.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => addToCart(service, 'service')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{service.name}</h3>
                        <Badge variant="outline">₱{service.price}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {service.duration} min • {service.category}
                      </p>
                      <Button size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <Card className="spa-card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(products as any[]).filter((product: any) => product.currentStock > 0).map((product: any) => (
                    <div
                      key={product.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => addToCart(product, 'product')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <Badge variant="outline">₱{product.retailPrice}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.brand} • Stock: {product.currentStock}
                      </p>
                      <Button size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card className="spa-card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Add services or products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.type} • ₱{item.price} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id, item.type)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="font-medium">₱{item.total}</p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₱{discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₱{tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="spa-card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.value}
                        variant={paymentMethod === method.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaymentMethod(method.value)}
                        className="flex items-center gap-2 justify-start p-3 h-auto"
                      >
                        {method.icon}
                        <span className="text-xs">{method.label}</span>
                      </Button>
                    ))}
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="space-y-2">
                      <Label htmlFor="cash-amount">Cash Received</Label>
                      <Input
                        id="cash-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      {cashReceived > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Change: ₱{Math.max(0, cashReceived - total).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || (paymentMethod === "cash" && cashReceived < total)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Complete Transaction (₱{total.toFixed(2)})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Complete</DialogTitle>
              <DialogDescription>
                Receipt for transaction #{lastTransaction?.transactionNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">JustPause Salon & Spa</h2>
                <p className="text-sm text-muted-foreground">Thank you for your business!</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transaction #:</span>
                  <span>{lastTransaction?.transactionNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                {selectedCustomer && (
                  <div className="flex justify-between text-sm">
                    <span>Customer:</span>
                    <span>{selectedCustomer.name}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                {lastTransaction?.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₱{item.total}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{lastTransaction?.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-₱{lastTransaction?.discount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₱{lastTransaction?.tax}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₱{lastTransaction?.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span className="capitalize">{lastTransaction?.paymentMethod}</span>
                </div>
                {paymentMethod === "cash" && cashReceived > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Cash Received:</span>
                    <span>₱{cashReceived.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === "cash" && cashReceived > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Change:</span>
                    <span>₱{Math.max(0, cashReceived - parseFloat(lastTransaction?.total || "0")).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button className="flex-1" onClick={() => setShowReceipt(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Customer Registration Modal */}
      <Dialog open={showQuickCustomer} onOpenChange={setShowQuickCustomer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Customer Registration</DialogTitle>
            <DialogDescription>
              Add customer details for this transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Name *</Label>
              <Input
                id="customer-name"
                value={quickCustomerName}
                onChange={(e) => setQuickCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={quickCustomerPhone}
                onChange={(e) => setQuickCustomerPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQuickCustomer(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={createQuickCustomer} className="flex-1" disabled={!quickCustomerName.trim()}>
                Add Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}