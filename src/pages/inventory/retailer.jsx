import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageIcon, TagIcon, HashIcon, BarChartIcon, BoxIcon, StoreIcon } from 'lucide-react';

export default function RetailerInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRetailerInventory = async () => {
    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const API = `${BASE_URL}/products/inventory`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success' && data.inventory) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error("Error fetching retailer inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailerInventory();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full mt-10 px-0">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <StoreIcon className="w-6 h-6" /> My Retail Store Inventory
        </h1>
        <Card className="p-4 w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"><HashIcon className="inline w-4 h-4 mr-1" />ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead><TagIcon className="inline w-4 h-4 mr-1" />Product Name</TableHead>
                <TableHead><PackageIcon className="inline w-4 h-4 mr-1" />Category</TableHead>
                <TableHead><BoxIcon className="inline w-4 h-4 mr-1" />Stock Available</TableHead>
                <TableHead><BarChartIcon className="inline w-4 h-4 mr-1" />Quantity Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Loading inventory...</TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No inventory found. Start purchasing from wholesalers!</TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => {
                  const masterProduct = item.masterProductId || {};
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-mono text-xs max-w-[100px] truncate" title={item._id}>{item._id}</TableCell>
                      <TableCell>
                        {masterProduct.images && masterProduct.images[0] ? (
                          <img src={masterProduct.images[0]} alt={masterProduct.name || 'product'} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                        )}
                      </TableCell>
                      <TableCell>{masterProduct.name || 'Unknown Product'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{masterProduct.catagory || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">{item.stockQuantity}</TableCell>
                      <TableCell className="font-medium text-blue-600">{item.quantitySold || 0}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90"
          onClick={() => window.location.href = '/products/viewProduct'}
        >
          Buy Products
        </button>
        <button
          type="button"
          className="bg-muted text-foreground px-6 py-2 rounded-md font-medium hover:bg-muted/80"
          onClick={fetchRetailerInventory}
        >
          Refresh
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
}