import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, CheckCircleIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800';
    case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
    case 'SUCCESS': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'FAILED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const API = `${BASE_URL}/orders/admin`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setError("You must be logged in to view orders.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setError('An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    setProcessingId(orderId);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const API = `${BASE_URL}/orders/approve`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: "SHIPPED" })
      });
      const data = await response.json();

      if (data.status === 'success') {
        toast.success(data.message || 'Order approved successfully!');
        // Update local state to reflect the shipped order
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: 'SHIPPED' } : order
        ));
      } else {
        toast.error(data.message || 'Failed to approve order.');
      }
    } catch (err) {
      console.error("Error approving order:", err);
      toast.error('An error occurred while approving the order.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage B2B Orders</h1>
            <p className="text-muted-foreground mt-2">View and approve incoming orders from retailers.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="gap-2">
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center p-10 border-dashed">
            <h3 className="text-xl font-medium text-gray-500">No incoming orders found</h3>
            <p className="text-gray-400 mt-2">When retailers place orders, they will appear here.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Retailer: {order.retailerId?.name || order.retailerId || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(order.orderStatus)} px-3 py-1 font-medium bg-opacity-20`}>
                        {order.orderStatus || 'PENDING'}
                      </Badge>
                      {order.orderStatus === 'PROCESSING' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(order._id)}
                          disabled={processingId === order._id}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                          {processingId === order._id ? (
                            <RefreshCwIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                          Approve & Ship
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow>
                        <TableHead className="pl-6">Product</TableHead>
                        <TableHead>SKU / ID</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right pr-6">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => {
                        const product = item.masterProductId;
                        const subtotal = item.quantity * (item.priceAtPurchase || 0);
                        
                        return (
                          <TableRow key={index} className="hover:bg-transparent">
                            <TableCell className="pl-6 font-medium">
                              {product?.name || 'Unknown Product'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product?.sku || product?._id?.slice(-6).toUpperCase() || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{(item.priceAtPurchase || product?.basePrice || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right pr-6 font-semibold">
                              ₹{subtotal.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/5 font-bold">
                        <TableCell colSpan={4} className="pl-6 text-right text-base text-gray-700">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right pr-6 text-xl text-green-700">
                          ₹{(order.totalAmount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
