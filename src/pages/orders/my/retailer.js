import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PackageIcon, CalendarIcon, DollarSignIcon, TagIcon, CreditCardIcon, RefreshCwIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getDateFromObjectId = (objectId) => {
  if (!objectId) return null;
  try {
    return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
  } catch (e) {
    return null;
  }
};

const formatDate = (dateValue, objectId) => {
  const finalDate = dateValue ? new Date(dateValue) : getDateFromObjectId(objectId);
  if (!finalDate || isNaN(finalDate.getTime())) return 'N/A';
  
  return finalDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

const MyOrdersRetailers = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receivingId, setReceivingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const API = `${BASE_URL}/orders`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setError("You must be logged in to view your orders.");
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
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    setReceivingId(orderId);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const API = `${BASE_URL}/orders/receive`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
         // Update visually instantly
         setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: 'DELIVERED' } : o));
      } else {
         alert(data.message || "Failed to mark as delivered");
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setReceivingId(null);
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
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-2">View and track all your wholesale purchases.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="gap-2">
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 bg-opacity-20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : orders.length === 0 && !error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <PackageIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-semibold">No orders found</h2>
              <p className="text-muted-foreground mt-2">You haven't placed any orders yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4 border-b flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TagIcon className="h-4 w-4" /> Order #{order._id?.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(order.createdAt, order._id)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus || 'N/A'}
                    </Badge>
                    {order.orderStatus === 'SHIPPED' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptDelivery(order._id)}
                        disabled={receivingId === order._id}
                        className="bg-green-600 hover:bg-green-700 text-white mt-2"
                      >
                        {receivingId === order._id ? (
                           <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Accept Delivery
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                              {item.masterProductId?.images?.[0] ? (
                                <img 
                                  src={item.masterProductId.images[0]} 
                                  alt={item.masterProductId?.name || 'Product'} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <PackageIcon className="h-6 w-6 m-2 text-muted-foreground opacity-50" />
                              )}
                            </div>
                            {item.masterProductId?.name || 'Unknown Product'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.masterProductId?.sku || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">${item.priceAtPurchase?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${((item.priceAtPurchase || 0) * (item.quantity || 0)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="flex flex-col md:flex-row justify-between bg-muted/20 p-6 border-t items-start md:items-center">
                    <div className="flex items-center gap-4 text-sm mb-4 md:mb-0">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCardIcon className="h-4 w-4" />
                        Payment Status: 
                        <Badge variant="secondary" className={`${getStatusColor(order.paymentDetails?.status)} ml-1`}>
                          {order.paymentDetails?.status || 'PENDING'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right w-full md:w-auto">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-2xl font-bold flex items-center justify-end">
                        <DollarSignIcon className="h-5 w-5" />
                        {order.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyOrdersRetailers;
