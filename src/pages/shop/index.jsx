import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isAddingId, setIsAddingId] = useState(null);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(qty) || qty < 1 ? 1 : qty,
    }));
  };

  const getProductQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BASE_URL}/user/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCartItems(data.data.items || []);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const API = `${BASE_URL}/products/all-retailer-inventory`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  const handleAddToCart = async (inventoryItem) => {
    try {
      setIsAddingId(inventoryItem._id);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to add items to cart!");
        return;
      }
      
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      
      // Get current cart
      const cartRes = await fetch(`${BASE_URL}/user/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cartData = await cartRes.json();
      const currentCart = cartData.data || { items: [] };
      let items = currentCart.items;
      
      // Check if item already exists
      const existingItemIndex = items.findIndex(i => 
        (i.retailerInventoryId._id || i.retailerInventoryId) === inventoryItem._id
      );

      const addQty = getProductQuantity(inventoryItem._id);

      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += addQty;
      } else {
        items.push({ retailerInventoryId: inventoryItem._id, quantity: addQty });
      }

      // Reset local quantity state after adding
      setQuantities((prev) => ({ ...prev, [inventoryItem._id]: 1 }));

      // Format items for update
      const updateItems = items.map(item => ({
        retailerInventoryId: item.retailerInventoryId._id || item.retailerInventoryId,
        quantity: item.quantity
      }));

      // Update cart
      const updateRes = await fetch(`${BASE_URL}/user/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: updateItems })
      });
      
      const updateData = await updateRes.json();
      if (updateData.success) {
        toast.success(`${inventoryItem.masterProductId?.productName} added to cart!`);
        fetchCartItems();
        setIsCartOpen(true);
      } else {
        toast.error(updateData.message || "Failed to add to cart");
      }
      
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingId(null);
    }
  };

  const handleRemoveFromCart = async (itemIdToRemove) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      
      // Update cart to filter out this item
      const updatedItems = cartItems
        .filter(item => (item.retailerInventoryId?._id || item.retailerInventoryId) !== itemIdToRemove)
        .map(item => ({
          retailerInventoryId: item.retailerInventoryId._id || item.retailerInventoryId,
          quantity: item.quantity
        }));

      const updateRes = await fetch(`${BASE_URL}/user/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: updatedItems })
      });
      
      const updateData = await updateRes.json();
      if (updateData.success) {
        toast.success("Item removed from cart");
        fetchCartItems();
      } else {
        toast.error(updateData.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Failed to remove item");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full">
        <div className="px-4 lg:px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Shop Products
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProducts} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button variant="secondary" onClick={() => setIsCartOpen(true)} className="relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="px-4 lg:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 && !loading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No products found from any retailers.
            </div>
          ) : (
            products.map((item) => {
              const master = item.masterProductId;
              if (!master) return null;
              return (
                <Card key={item._id} className="flex flex-col justify-between hover:shadow-lg transition-shadow bg-card">
                  <CardHeader className="pb-2">
                    <div className="aspect-square w-full relative mb-4 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {master.images && master.images.length > 0 ? (
                        <img 
                          src={master.images[0]} 
                          alt={master.productName} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No Image</span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1" title={master.productName}>
                        {master.productName}
                      </CardTitle>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        ${item.retailerPrice}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2 min-h-[40px]" title={master.description}>
                      {master.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">Retailer:</span> 
                        <span className="truncate max-w-[120px]" title={item.retailerId?.storeName || item.retailerId?.name}>
                          {item.retailerId?.storeName || item.retailerId?.name || 'Local Store'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span> 
                        <span>{master.catagory || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Stock:</span> 
                        <span className={item.stockQuantity > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                          {item.stockQuantity} available
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full border rounded-lg p-1 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleQuantityChange(item._id, getProductQuantity(item._id) - 1)}
                        disabled={getProductQuantity(item._id) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="text"
                        value={getProductQuantity(item._id)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setQuantities(prev => ({ ...prev, [item._id]: '' }));
                            return;
                          }
                          handleQuantityChange(item._id, val);
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '' || isNaN(e.target.value) || parseInt(e.target.value) < 1) {
                            handleQuantityChange(item._id, 1);
                          }
                        }}
                        className="w-14 h-8 text-center font-medium bg-transparent border-none shadow-none focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleQuantityChange(item._id, getProductQuantity(item._id) + 1)}
                        disabled={getProductQuantity(item._id) >= item.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stockQuantity <= 0 || isAddingId === item._id}
                    >
                      {isAddingId === item._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {item.stockQuantity > 0 ? (isAddingId === item._id ? "Adding..." : "Add to Cart") : "Out of Stock"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* Cart Side Sheet */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetContent className="w-full sm:max-w-md flex flex-col h-full right-0 p-0 sm:p-0">
            <div className="p-6 flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-2xl font-bold tracking-tight">Your Cart</SheetTitle>
                <SheetDescription>
                  Review items in your cart. You have {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {cartItems.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'items'}.
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto px-1 space-y-4 shadow-inner">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
                    <ShoppingCart className="w-12 h-12 opacity-20" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    {cartItems.map((cartItem, idx) => {
                      const master = cartItem.retailerInventoryId?.masterProductId || {};
                      const price = cartItem.retailerInventoryId?.retailerPrice || 0;
                      return (
                        <div key={idx} className="flex gap-4 items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 shadow-sm hover:bg-muted/50 transition-colors">
                          <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className="w-16 h-16 bg-white dark:bg-muted rounded-lg border border-border/50 overflow-hidden flex-shrink-0 shadow-sm">
                              {master.images && master.images.length > 0 ? (
                                <img src={master.images[0]} alt={master.productName} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground bg-slate-50 dark:bg-slate-800">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{master.productName || 'Unknown Product'}</div>
                              <div className="text-xs text-muted-foreground font-medium">Qty: <span className="text-foreground">{cartItem.quantity}</span></div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 pl-2 flex flex-col items-end gap-2">
                            <div className="text-sm font-bold">${price.toFixed(2)}</div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveFromCart(cartItem.retailerInventoryId?._id || cartItem.retailerInventoryId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="pt-6 mt-auto">
                  <div className="flex items-center justify-between font-semibold text-lg mb-4 px-1">
                    <span>Subtotal</span>
                    <span>${cartItems.reduce((acc, item) => acc + (item.quantity * (item.retailerInventoryId?.retailerPrice || 0)), 0).toFixed(2)}</span>
                  </div>
                  <Button className="w-full h-12 text-base rounded-xl shadow-md" size="lg" onClick={() => window.location.href = '/shop/cart'}>
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
