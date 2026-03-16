import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShoppingCart, Trash2, ArrowLeft, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CustomerCartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/user/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeFromCart = async (retailerInventoryId) => {
    try {
      const updatedItems = cartItems.filter(item => 
        (item.retailerInventoryId._id || item.retailerInventoryId) !== retailerInventoryId
      );
      
      const token = localStorage.getItem('token');
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      
      const formatForApi = updatedItems.map(item => ({
        retailerInventoryId: item.retailerInventoryId._id || item.retailerInventoryId,
        quantity: item.quantity
      }));

      const res = await fetch(`${BASE_URL}/user/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: formatForApi })
      });

      if (res.ok) {
        setCartItems(updatedItems);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const response = await fetch(`${BASE_URL}/orders/b2c-place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}) // Backend will read cart from db since items array is empty
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        setCartItems([]);
        router.push('/shop');
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

  const totalCost = cartItems.reduce((acc, item) => {
    const price = item.retailerInventoryId?.retailerPrice || 0;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <DashboardLayout>
      <Head>
        <title>Your Cart | Shop</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8 py-6 w-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/shop')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">Review your items before confirming the order.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Cart Items ({cartItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">Loading cart...</div>
            ) : cartItems.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Retailer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item, idx) => {
                      const inventory = item.retailerInventoryId;
                      if (!inventory || !inventory.masterProductId) return null;
                      
                      const product = inventory.masterProductId;
                      const retailer = inventory.retailerId;
                      const price = inventory.retailerPrice || 0;

                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {product.productName}
                            <div className="text-xs text-muted-foreground">{product.catagory}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{retailer?.storeName || retailer?.name || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>${price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="font-semibold">
                            ${(price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeFromCart(inventory._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
                <p>Your cart is empty.</p>
                <Button 
                  variant="link" 
                  className="mt-4"
                  onClick={() => router.push('/shop')}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </CardContent>
          {cartItems.length > 0 && (
            <CardFooter className="flex justify-between items-center bg-muted/30 border-t p-6">
              <div className="text-xl font-bold">
                Total: ${totalCost.toFixed(2)}
              </div>
              <Button 
                size="lg" 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4"/>
                {isProcessing ? 'Processing Order...' : 'Checkout'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
