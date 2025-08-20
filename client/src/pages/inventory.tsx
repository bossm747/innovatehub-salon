import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  ShoppingCart,
  Truck,
  TrendingDown,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import EnhancedProductModal from "@/components/modals/enhanced-product-modal";
import SupplierModal from "@/components/modals/supplier-modal";
import StockAdjustmentModal from "@/components/modals/stock-adjustment-modal";
import type { Product, Supplier } from "@shared/schema";

// Product categories will be dynamically generated from database

export default function Inventory() {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [stockAdjustmentModalOpen, setStockAdjustmentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: lowStockProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/low-stock"],
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory-transactions"],
  });

  if (productsLoading || suppliersLoading) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  // Generate categories dynamically from products data
  const generateProductCategories = () => {
    if (!products || products.length === 0) return [{ id: "all", name: "All Products", count: 0 }];
    
    const uniqueCategories = Array.from(new Set(products.map((product: any) => product.category)));
    const categories = [
      { id: "all", name: "All Products", count: products.length }
    ];
    
    uniqueCategories.forEach(category => {
      const count = products.filter(p => p.category === category).length;
      categories.push({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        count
      });
    });
    
    return categories;
  };

  const categoriesWithCounts = generateProductCategories();

  const filteredProducts = (products || []).filter((product: any) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum: number, product: any) => 
    sum + (parseFloat(product.retailPrice || "0") * (product.currentStock || 0)), 0) || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  const activeSuppliers = suppliers?.filter((s: any) => s.isActive).length || 0;

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex-responsive justify-between">
          <div>
            <h2 className="text-responsive-lg font-bold text-slate-900">Inventory Management</h2>
            <p className="mt-2 text-responsive-base text-slate-600">Manage products, suppliers, and stock levels</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="button-responsive"
              onClick={() => setSupplierModalOpen(true)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
            <Button 
              className="button-responsive"
              onClick={() => setProductModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Products</p>
                  <p className="text-2xl font-semibold text-slate-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Inventory Value</p>
                  <p className="text-2xl font-semibold text-slate-900">₱{totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-slate-900">{lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Suppliers</p>
                  <p className="text-2xl font-semibold text-slate-900">{activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="transactions">Stock Movements</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Search and Categories */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 mb-6">
                    {products?.length === 0 
                      ? "Get started by adding your first product"
                      : "No products match your search criteria"
                    }
                  </p>
                  <Button onClick={() => setProductModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                          {product.brand && (
                            <p className="text-sm text-slate-500">{product.brand}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setStockAdjustmentModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Current Stock:</span>
                          <span className={`text-sm font-medium ${
                            product.currentStock <= product.minStockLevel ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {product.currentStock} {product.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Cost Price:</span>
                          <span className="text-sm font-medium">₱{product.costPrice}</span>
                        </div>
                        {product.retailPrice && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500">Retail Price:</span>
                            <span className="text-sm font-medium">₱{product.retailPrice}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{product.category.replace('-', ' ')}</Badge>
                        {product.currentStock <= product.minStockLevel && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers?.map((supplier: any) => (
                <Card key={supplier.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{supplier.name}</h3>
                        {supplier.contactPerson && (
                          <p className="text-sm text-slate-500">{supplier.contactPerson}</p>
                        )}
                      </div>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {supplier.email && (
                        <div className="flex items-center text-sm text-slate-600">
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-slate-600">
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="text-sm text-slate-600">
                          <span>{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Stock Movements</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <TrendingDown className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p>No stock movements recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions?.slice(0, 10).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'purchase' ? 'bg-green-100' :
                            transaction.type === 'sale' ? 'bg-blue-100' :
                            transaction.type === 'adjustment' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            <Package className={`h-4 w-4 ${
                              transaction.type === 'purchase' ? 'text-green-600' :
                              transaction.type === 'sale' ? 'text-blue-600' :
                              transaction.type === 'adjustment' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {transaction.reason || 'No reason provided'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            {transaction.type === 'purchase' || transaction.type === 'adjustment' ? '+' : '-'}
                            {transaction.quantity}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedProductModal 
        open={productModalOpen} 
        onOpenChange={setProductModalOpen} 
      />
      <SupplierModal 
        open={supplierModalOpen} 
        onOpenChange={setSupplierModalOpen} 
      />
      <StockAdjustmentModal 
        open={stockAdjustmentModalOpen} 
        onOpenChange={setStockAdjustmentModalOpen}
        product={selectedProduct}
      />
    </>
  );
}