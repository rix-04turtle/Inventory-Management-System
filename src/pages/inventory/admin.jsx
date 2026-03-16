import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageIcon, TagIcon, HashIcon, DollarSignIcon, ArchiveIcon } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminInventory = async () => {
    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const API = `${BASE_URL}/products/admin-inventory`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success' && data.inventory) {
        setProducts(data.inventory);
      }
    } catch (err) {
      console.error("Error fetching admin inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminInventory();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full mt-10 px-0">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ArchiveIcon className="w-6 h-6" /> My Wholesaler Inventory
        </h1>
        <Card className="p-4 w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"><HashIcon className="inline w-4 h-4 mr-1" />ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead><TagIcon className="inline w-4 h-4 mr-1" />Name</TableHead>
                <TableHead><PackageIcon className="inline w-4 h-4 mr-1" />Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Qty in Stock</TableHead>
                <TableHead>Min Qty</TableHead>
                <TableHead><DollarSignIcon className="inline w-4 h-4 mr-1" />Base Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">Loading inventory...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No inventory found for your account.</TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-mono text-xs max-w-[100px] truncate" title={product._id}>{product._id}</TableCell>
                    <TableCell>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.catagory || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{product.sku || '-'}</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>{product.minStockLevel || '-'}</TableCell>
                    <TableCell>${product.basePrice}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90"
            onClick={() => window.location.href = '/products/add'}
          >
            Add New Product
          </button>
          <button
            type="button"
            className="bg-muted text-foreground px-6 py-2 rounded-md font-medium hover:bg-muted/80"
            onClick={fetchAdminInventory}
          >
            Refresh
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}