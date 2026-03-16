import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageIcon, TagIcon, LayersIcon, HashIcon, DollarSignIcon } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const API = `${BASE_URL}/products/view`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success' && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <DashboardLayout>
      <div className="w-full mt-10 px-0">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LayersIcon className="w-6 h-6" /> Product List
        </h1>
        <Card className="p-4 w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"><HashIcon className="inline w-4 h-4 mr-1" />ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead><TagIcon className="inline w-4 h-4 mr-1" />Name</TableHead>
                <TableHead><PackageIcon className="inline w-4 h-4 mr-1" />Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Min Qty</TableHead>
                <TableHead><DollarSignIcon className="inline w-4 h-4 mr-1" />Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">Loading products...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No products found.</TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id || product.id}>
                    <TableCell className="font-mono text-xs max-w-[100px] truncate" title={product._id || product.id}>{product._id || product.id}</TableCell>
                    <TableCell>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name || 'product'} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                      )}
                    </TableCell>
                    <TableCell>{product.name || product.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.catagory || product.category || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={product.description}>{product.description || '-'}</TableCell>
                    <TableCell>{product.stockQuantity ?? product.quantity}</TableCell>
                    <TableCell>{product.minStockLevel || '-'}</TableCell>
                    <TableCell>${product.basePrice ?? product.price}</TableCell>
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
          Add Product
        </button>
        <button
          type="button"
          className="bg-muted text-foreground px-6 py-2 rounded-md font-medium hover:bg-muted/80"
          onClick={fetchProducts}
        >
          Refresh
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
}
