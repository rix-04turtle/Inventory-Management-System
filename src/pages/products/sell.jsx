import React, { useState } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const products = [
  { id: 1, name: 'Laptop', category: 'Electronics', quantity: 12 },
  { id: 2, name: 'Notebook', category: 'Stationery', quantity: 50 },
  { id: 3, name: 'T-shirt', category: 'Clothing', quantity: 30 },
  { id: 4, name: 'Apple', category: 'Groceries', quantity: 100 },
  { id: 5, name: 'Water Bottle', category: 'Other', quantity: 20 },
];

export default function SellPage() {
  const [selectedId, setSelectedId] = useState('');
  const [soldQty, setSoldQty] = useState('');
  const selectedProduct = products.find(p => p.id === Number(selectedId));
  const remaining = selectedProduct ? selectedProduct.quantity - (Number(soldQty) || 0) : '';

  return (
    <DashboardLayout>
      <div className="w-full mt-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sell Product</h1>
        <Card className="p-6 space-y-6 w-full">
          {/* Product Selection */}
          <div>
            <label className="block mb-1 font-medium">Select Product</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name} <Badge variant="outline" className="ml-2">{product.category}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale History and Edit */}
          {selectedProduct && (
            <>
              <div>
                <label className="block mb-1 font-medium">Quantity Stored</label>
                <Input value={selectedProduct.quantity} disabled />
              </div>
              <div>
                <label className="block mb-1 font-medium">Quantity Sold</label>
                <Input type="number" min={0} max={selectedProduct.quantity} value={soldQty} onChange={e => setSoldQty(e.target.value)} placeholder="Enter sold quantity" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Quantity Remaining</label>
                <Input value={remaining} disabled />
                {remaining !== '' && Number(remaining) < 5 && (
                  <Badge variant="destructive" className="mt-2">Low stock! Consider restocking.</Badge>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="secondary" onClick={() => window.location.href = '/products/add'}>
                  Restock Item
                </Button>
                <Button type="button" variant="default">
                  Save Sale
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
