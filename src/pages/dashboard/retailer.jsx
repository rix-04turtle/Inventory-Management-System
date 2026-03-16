import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/applayout/with-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Store } from "lucide-react";

export default function RetailerDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    // Basic stats mockup for retailer dashboard
    setStats({ products: 12, orders: 34 });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Retailer Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-4">Welcome back to your store overview.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Placeholder for more retailer-specific components */}
        <div className="mt-8 rounded-lg border p-8 text-center bg-zinc-50 dark:bg-zinc-900 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Track Your Inventory & Sales</h3>
          <p className="text-muted-foreground mb-4">You can manage your shop, view your inventory, and place new orders to the wholesaler from the sidebar.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
