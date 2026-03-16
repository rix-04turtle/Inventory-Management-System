import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShoppingCart, Trash2, ArrowLeft, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('retailerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (productId, adminId) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.adminId === adminId)
    );
    setCart(updatedCart);
    localStorage.setItem('retailerCart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
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

      const token = localStorage.getItem('token'); // Assuming standard token storage

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
        
        router.push('/products/viewProduct');
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

  const totalCost = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <DashboardLayout>
      <Head>
        <title>Your Cart | Retailer</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8 mt-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/products/viewProduct')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Cart</h1>
            <p className="text-sm text-gray-500">Review your items before confirming the order.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Cart Items ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier (Admin Ref)</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.product.name}
                          <div className="text-xs text-muted-foreground">{item.product.category}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.adminId}</Badge>
                        </TableCell>
                        <TableCell>${Number(item.product.price).toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeFromCart(item.product.id, item.adminId)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  onClick={() => router.push('/products/viewProduct')}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex justify-between items-center bg-gray-50 border-t p-6">
              <div className="text-xl font-bold">
                Total: ${totalCost.toFixed(2)}
              </div>
              <Button 
                size="lg" 
                onClick={handleBuyNow} 
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4"/>
                {isProcessing ? 'Processing Order...' : 'Buy Now'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}