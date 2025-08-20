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
            <Card className="spa-card-shadow bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {filteredServices.map((service: any) => (
                    <div
                      key={service.id}
                      className="relative p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                      onClick={() => addToCart(service, 'service')}
                    >
                      <div className="text-center space-y-1">
                        <h3 className="font-semibold text-xs leading-tight text-slate-800 line-clamp-2 h-8">{service.name}</h3>
                        <div className="text-xs text-blue-600 font-medium">₱{service.price}</div>
                        <div className="text-xs text-slate-500">
                          {service.duration}min
                        </div>
                        <div className="pt-1">
                          <div className="w-full h-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded text-xs flex items-center justify-center font-medium transition-all duration-200">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <Card className="spa-card-shadow bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {(products as any[]).filter((product: any) => product.currentStock > 0).map((product: any) => (
                    <div
                      key={product.id}
                      className="relative p-3 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                      onClick={() => addToCart(product, 'product')}
                    >
                      <div className="text-center space-y-1">
                        <h3 className="font-semibold text-xs leading-tight text-slate-800 line-clamp-2 h-8">{product.name}</h3>
                        <div className="text-xs text-emerald-600 font-medium">₱{product.retailPrice}</div>
                        <div className="text-xs text-slate-500">
                          {product.brand || 'No Brand'}
                        </div>
                        <div className="text-xs text-orange-600 font-medium">
                          Stock: {product.currentStock}
                        </div>
                        <div className="pt-1">
                          <div className="w-full h-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded text-xs flex items-center justify-center font-medium transition-all duration-200">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card className="spa-card-shadow bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">Cart</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1">
                    {cart.length} items
                  </Badge>
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
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.type}`} className="flex items-center gap-2 p-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-800 truncate">{item.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Badge variant="outline" className="px-1 py-0 text-xs h-4">
                              {item.type}
                            </Badge>
                            <span>₱{item.price}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center transition-colors"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors ml-1"
                            onClick={() => removeFromCart(item.id, item.type)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right min-w-0">
                          <p className="font-bold text-xs text-purple-700">₱{item.total}</p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Discount:</span>
                          <span className="font-medium text-green-600">-₱{discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tax (12%):</span>
                          <span className="font-medium">₱{tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          <span>TOTAL:</span>
                          <span>₱{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="spa-card-shadow bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent font-bold">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === method.value 
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-400 shadow-lg' 
                            : 'bg-white hover:bg-orange-50 border-orange-200 text-slate-700 hover:border-orange-300'
                        }`}
                      >
                        <div className={paymentMethod === method.value ? 'text-white' : 'text-orange-600'}>
                          {method.icon}
                        </div>
                        <span className={`text-sm font-medium ${
                          paymentMethod === method.value ? 'text-white' : 'text-slate-700'
                        }`}>{method.label}</span>
                        {paymentMethod === method.value && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-3 rounded-lg border border-green-200">
                      <Label htmlFor="cash-amount" className="text-sm font-semibold text-green-700">Cash Received</Label>
                      <Input
                        id="cash-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-2 text-lg font-bold text-center border-green-300 focus:border-green-500"
                      />
                      {cashReceived > 0 && (
                        <div className="mt-2 p-2 bg-white rounded border border-green-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Total Due:</span>
                            <span className="font-bold">₱{total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Cash Received:</span>
                            <span className="font-bold">₱{cashReceived.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-1 mt-1">
                            <span>Change:</span>
                            <span>₱{Math.max(0, cashReceived - total).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-bold" 
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || (paymentMethod === "cash" && cashReceived < total)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Complete Transaction • ₱{total.toFixed(2)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modern Receipt Modal */}
      {showReceipt && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-sm bg-white border-0 shadow-2xl">
            <DialogHeader className="text-center">
              <DialogTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-xl">
                ✓ Transaction Complete
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Receipt #{lastTransaction?.transactionNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div id="receipt-content" className="bg-white p-4 font-mono text-sm border border-dashed border-slate-300 rounded">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                <div className="font-bold text-lg text-slate-800">JUSTPAUSE SALON & SPA</div>
                <div className="text-xs text-slate-600 mt-1">Professional Beauty Services</div>
                <div className="text-xs text-slate-600">Philippines</div>
                <div className="text-xs text-slate-600 mt-2">★★★★★ Thank You! ★★★★★</div>
              </div>
              
              {/* Transaction Details */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between text-xs">
                  <span>Receipt #:</span>
                  <span className="font-bold">{lastTransaction?.transactionNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-PH')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Time:</span>
                  <span>{new Date().toLocaleTimeString('en-PH')}</span>
                </div>
                {selectedCustomer && (
                  <div className="flex justify-between text-xs">
                    <span>Customer:</span>
                    <span className="font-medium">{selectedCustomer.name}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="text-xs font-bold mb-1">ITEMS PURCHASED:</div>
                {lastTransaction?.items.map((item: any, index: number) => (
                  <div key={index} className="mb-1">
                    <div className="flex justify-between">
                      <span className="text-xs">{item.name}</span>
                      <span className="text-xs font-bold">₱{item.total}</span>
                    </div>
                    <div className="text-xs text-slate-500 ml-2">
                      {item.quantity}x @ ₱{item.price} each
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between text-xs">
                  <span>Subtotal:</span>
                  <span>₱{lastTransaction?.subtotal}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>VAT (12%):</span>
                  <span>₱{lastTransaction?.tax}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Discount:</span>
                  <span>-₱{lastTransaction?.discount}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-slate-400 pt-1 mt-1">
                  <span>TOTAL:</span>
                  <span>₱{lastTransaction?.total}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between text-xs">
                  <span>Payment:</span>
                  <span className="uppercase font-medium">{lastTransaction?.paymentMethod}</span>
                </div>
                {paymentMethod === "cash" && cashReceived > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span>Cash Received:</span>
                      <span>₱{cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Change:</span>
                      <span>₱{Math.max(0, cashReceived - parseFloat(lastTransaction?.total || "0")).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-600">
                <div>Visit us again soon!</div>
                <div className="mt-1">Follow us on social media</div>
                <div className="mt-2 border-t border-dashed border-slate-400 pt-2">
                  {new Date().toLocaleString('en-PH')}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50" 
                onClick={() => {
                  const printContent = document.getElementById('receipt-content');
                  const printWindow = window.open('', '_blank');
                  if (printWindow && printContent) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Receipt</title>
                          <style>
                            body { font-family: monospace; font-size: 12px; margin: 20px; }
                            .receipt { max-width: 300px; margin: 0 auto; }
                          </style>
                        </head>
                        <body>
                          <div class="receipt">${printContent.innerHTML}</div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                onClick={() => setShowReceipt(false)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Done
              </Button>
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