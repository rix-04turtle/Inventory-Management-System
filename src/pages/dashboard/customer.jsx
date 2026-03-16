import React from "react";
import { DashboardLayout } from "@/components/applayout/with-dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import AuthHOC from "@/components/AuthHOC";

function CustomerDashboard() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground mb-4">Here's your shopping overview.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shopping Cart</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Ready to checkout</div>
              <Button size="sm" onClick={() => router.push('/shop/cart')}>View Cart</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Purchases</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Track Orders</div>
              <p className="text-xs text-muted-foreground mt-1">Review your order history.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-lg border p-8 text-center bg-zinc-50 dark:bg-zinc-900 shadow-sm">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Discover New Products</h3>
          <p className="text-muted-foreground mb-4">Shop the latest selection of products from retailers near you.</p>
          <Button onClick={() => router.push('/shop')}>Go to Shop</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AuthHOC(CustomerDashboard);