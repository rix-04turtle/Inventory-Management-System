
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';



const categories = [
  'Electronics',
  'Groceries',
  'Clothing',
  'Stationery',
  'Other',
];
const units = ['pcs', 'kg', 'litre', 'box', 'pack'];

export default function ProductList() {
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [minQty, setMinQty] = useState('');
  const [qty, setQty] = useState('');

  return (
    <DashboardLayout>
      <div className="w-full mt-10 space-y-6 px-0">
        <h1 className="text-3xl font-bold mb-4">Check your Products</h1>
        <Card className="p-6 space-y-4 w-full">
          {/* Category Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Name Input */}
          <div>
            <label className="block mb-1 font-medium">Product Name</label>
            <Input placeholder="Type product name..." />
          </div>

          {/* Product Price*/}
          <div>
            <label className="block mb-1 font-medium">Price Per Unit (RS.)</label>
            <Input type="number" min={0} placeholder="Type product price..." />
          </div>

          {/* Quantity and Unit */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Quantity</label>
              <Input type="number" min={0} value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Unit</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Minimum Quantity for Alert */}
          <div>
            <label className="block mb-1 font-medium">Minimum Quantity for Alert</label>
            <Input type="number" min={0} value={minQty} onChange={e => setMinQty(e.target.value)} placeholder="Set minimum quantity..." />
            {qty && minQty && Number(qty) <= Number(minQty) && (
              <Badge variant="destructive" className="mt-2">Alert: Quantity is at or below minimum!</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90">Add</button>
            <button type="button" className="bg-muted text-foreground px-6 py-2 rounded-md font-medium hover:bg-muted/80">Cancel</button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
