import React from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PackageIcon, TagIcon, LayersIcon, HashIcon, DollarSignIcon } from 'lucide-react';

const products = [
  { id: 1, name: 'Laptop', category: 'Electronics', quantity: 12, price: 1200 },
  { id: 2, name: 'Notebook', category: 'Stationery', quantity: 50, price: 3 },
  { id: 3, name: 'T-shirt', category: 'Clothing', quantity: 30, price: 15 },
  { id: 4, name: 'Apple', category: 'Groceries', quantity: 100, price: 1 },
  { id: 5, name: 'Water Bottle', category: 'Other', quantity: 20, price: 8 },
];

export default function ProductsPage() {
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
                <TableHead><TagIcon className="inline w-4 h-4 mr-1" />Name</TableHead>
                <TableHead><PackageIcon className="inline w-4 h-4 mr-1" />Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead><DollarSignIcon className="inline w-4 h-4 mr-1" />Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>${product.price}</TableCell>
                </TableRow>
              ))}
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
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
}
