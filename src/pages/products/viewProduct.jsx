import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import toast from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ViewProduct = () => {
  const [productsData, setProductsData] = useState({});
  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const API = `${BASE_URL}/products/view`;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.status === 'success' && data.products) {
          const fetchedProducts = data.products;
          
          // Group products by adminId
          const groupedData = {};
          const adminsMap = new Map();

          fetchedProducts.forEach(product => {
            const adminId = product.adminId || 'Unknown Admin';
            
            if (!groupedData[adminId]) {
              groupedData[adminId] = [];
            }
            groupedData[adminId].push({
              id: product._id,
              name: product.name || product.productName,
              description: product.description,
              price: product.basePrice || product.price,
              stock: product.stockQuantity || product.quantity || 0,
              category: product.catagory || product.category,
              images: product.images || []
            });

            // Set admin entry if not exists
            if (!adminsMap.has(adminId)) {
              adminsMap.set(adminId, {
                id: adminId,
                name: adminId === 'Unknown Admin' ? 'Unknown Admin' : `Supplier ${adminId.slice(-4)}`
              });
            }
          });

          setProductsData(groupedData);
          setAdminsList(Array.from(adminsMap.values()));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(qty) || qty < 1 ? 1 : qty,
    }));
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('retailerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('retailerCart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      alert("Cannot order more than available stock");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id && item.adminId === selectedAdmin);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.adminId === selectedAdmin
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, adminId: selectedAdmin }];
    });

    // Reset quantity input after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const currentProducts = selectedAdmin ? productsData[selectedAdmin] || [] : [];
  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const removeFromCart = (productId, adminId) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.adminId === adminId)
    );
    setCart(updatedCart);
    localStorage.setItem('retailerCart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const updateCartQuantity = (product, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(product.id, selectedAdmin);
      return;
    }
    if (newQuantity > product.stock) {
      toast.error('Cannot order more than available stock');
      return;
    }
    
    setCart((prevCart) => prevCart.map((item) =>
      item.product.id === product.id && item.adminId === selectedAdmin
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartItem = (productId) => {
    return cart.find((item) => item.product.id === productId && item.adminId === selectedAdmin);
  };

  const handleBuyNow = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const API = `${BASE_URL}/orders/place`;

      // API expects { items: [{ id: productID, quantity: qty }] }
      const items = cart.map(item => ({
        id: item.product.id,
        quantity: item.quantity
      }));

      const token = localStorage.getItem('token'); 

      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Order placed successfully!</span>
            <span className="text-sm">Total: ${data.totalAmount}</span>
            <span className="text-xs text-gray-500">Order ID: {data.orderId}</span>
          </div>,
          { duration: 5000 }
        );
        
        // Clear Cart
        setCart([]);
        localStorage.removeItem('retailerCart');
        setIsCartOpen(false);
        
      } else {
        toast.error(`Error: ${data.message || 'Failed to place order'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An error occurred while placing your order.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full mt-10 px-0">
      <Head>
        <title>View Products | Retailer</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
            <p className="text-sm text-gray-500 mt-1">Browse and order products from available admins.</p>
          </div>
          
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="default" 
                className="relative flex items-center gap-2 h-12 px-6"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">Cart</span>
                {cartTotalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1">
                    {cartTotalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Your Cart
                </SheetTitle>
                <SheetDescription>
                  Review items in your cart before checking out.
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 mt-6">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-sm text-gray-500">Qty: {item.quantity} × ${item.product.price}</span>
                          <span className="text-xs text-muted-foreground mt-1">Supplier: {item.adminId}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">${(item.quantity * item.product.price).toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item.product.id, item.adminId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-64">
                    <ShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Your cart is empty.</p>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="border-t pt-4 mt-auto space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${cartTotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.location.href = '/cart'}
                    >
                      View Full Cart
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleBuyNow}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Checkout Now'}
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Filters / Admin Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Supplier (Admin)</CardTitle>
            <CardDescription>Choose an admin to view their available product catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-4 text-center">Loading suppliers...</div>
            ) : (
              <Select onValueChange={(value) => setSelectedAdmin(value)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select an admin..." />
                </SelectTrigger>
                <SelectContent>
                  {adminsList.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Products Section */}
        {selectedAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Available Products</CardTitle>
                <CardDescription className="mt-1.5">
                  Showing products for {adminsList.find(a => a.id === selectedAdmin)?.name}
                </CardDescription>
              </div>
              {cart.length > 0 && (
                <Button 
                  onClick={() => setIsCartOpen(true)}
                >
                  Place Order ({cartTotalItems})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {currentProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 flex flex-col hover:shadow-md transition-shadow duration-200 bg-white group text-sm">
                      {product.images && product.images.length > 0 && (
                        <div className="w-full h-32 mb-2 bg-gray-50 rounded-md overflow-hidden relative">
                          <Carousel className="w-full h-full max-w-[12rem] mx-auto">
                            <CarouselContent>
                              {product.images.map((imgUrl, srcIndex) => (
                                <CarouselItem key={srcIndex}>
                                  <div className="w-full h-32 flex items-center justify-center">
                                    <img 
                                      src={imgUrl} 
                                      alt={`${product.name} - Image ${srcIndex + 1}`} 
                                      className="object-contain w-full h-full p-1"
                                      onError={(e) => { e.target.src = 'https://placehold.co/200?text=No+Image' }}
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            {product.images.length > 1 && (
                              <>
                                <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80" />
                                <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 bg-white/80" />
                              </>
                            )}
                          </Carousel>
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight mb-1" title={product.name}>
                          {product.name}
                        </h3>
                        <div className="mb-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{product.category || 'N/A'}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2 hidden sm:block" title={product.description}>
                          {product.description || '-'}
                        </p>
                        
                        <div className="mt-auto pt-2 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-none">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${product.stock > 0 ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                              {product.stock} left
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t mt-2">
                        {(() => {
                          const cartItem = getCartItem(product.id);
                          
                          if (cartItem) {
                            return (
                              <div className="flex items-center justify-between border rounded-lg p-1 bg-gray-50/50">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-600 hover:text-black hover:bg-gray-200" 
                                  onClick={() => updateCartQuantity(product, cartItem.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="text"
                                  value={cartItem.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      // Allow empty state while typing, handled gracefully
                                      updateCartQuantity(product, 0); 
                                      return;
                                    }
                                    const qty = parseInt(val, 10);
                                    if (!isNaN(qty)) {
                                      updateCartQuantity(product, qty);
                                    }
                                  }}
                                  className="w-14 h-8 text-center font-medium bg-transparent border-none shadow-none focus-visible:ring-0"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-600 hover:text-black hover:bg-gray-200"
                                  onClick={() => updateCartQuantity(product, cartItem.quantity + 1)}
                                  disabled={cartItem.quantity >= product.stock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          }

                          return (
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="w-full gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic py-4">No products found for this admin.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewProduct;
