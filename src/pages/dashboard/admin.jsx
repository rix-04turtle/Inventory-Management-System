import React, { useState, useEffect } from "react";
import { ChartAreaInteractive } from "@/components/applayout/chart-area-interactive";
import { DataTable } from "@/components/applayout/data-table";
import { SectionCards } from "@/components/applayout/section-cards";
import data from "../../app/dashboard/data.json";
import { DashboardLayout } from "@/components/applayout/with-dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";
import AuthHOC from "@/components/AuthHOC";

function AdminDashboardPage() {
  const [orderRequests, setOrderRequests] = useState([]);

  useEffect(() => {
    // Polling or initial load of order notifications
    const fetchOrders = () => {
      const stored = localStorage.getItem("adminOrderRequests");
      if (stored) {
        setOrderRequests(JSON.parse(stored));
      }
    };

    fetchOrders();
    // For demo purposes, we can poll lightly to feel like a real-time notification
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (orderId, action) => {
    const updated = orderRequests.map((order) => {
      if (order.orderId === orderId) {
        return {
          ...order,
          status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
        };
      }
      return order;
    });

    setOrderRequests(updated);
    localStorage.setItem("adminOrderRequests", JSON.stringify(updated));

    if (action === "ACCEPT") {
      toast.success(`Order ${orderId} Accepted!`);
    } else {
      toast.error(`Order ${orderId} Declined.`);
    }
  };

  const pendingOrders = orderRequests.filter((o) => o.status === "PENDING");
  const pastOrders = orderRequests.filter((o) => o.status !== "PENDING");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Notifications / Orders Section */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader className="pb-3 border-b mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    Pending Order Requests
                    {pendingOrders.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 rounded-full"
                      >
                        {pendingOrders.length} New
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Review and accept or decline incoming orders from retailers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No new order requests at the moment.
                </div>
              ) : (
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Retailer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.orderId}>
                          <TableCell className="font-mono font-medium">
                            {order.orderId}
                          </TableCell>
                          <TableCell>{order.retailerId}</TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">
                              {order.items
                                .map(
                                  (i) => `${i.product.name} (x${i.quantity})`,
                                )
                                .join(", ")}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${order.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                              onClick={() =>
                                handleAction(order.orderId, "ACCEPT")
                              }
                            >
                              <Check className="w-4 h-4 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                              onClick={() =>
                                handleAction(order.orderId, "DECLINE")
                              }
                            >
                              <X className="w-4 h-4 mr-1" /> Decline
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </DashboardLayout>
  );
}

export default AuthHOC(AdminDashboardPage, { requiredRole: "ADMIN" });
