import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function SellPage() {
  const [inventory, setInventory] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [soldQty, setSoldQty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const API = `${BASE_URL}/products/inventory`;
        const token = localStorage.getItem('token');
        
        const response = await fetch(API, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.status === 'success') {
           setInventory(data.inventory || []);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  const selectedItem = inventory.find(p => p._id === selectedId);
  const remaining = selectedItem ? selectedItem.stockQuantity - (Number(soldQty) || 0) : '';

  return (
    <DashboardLayout>
      <div className="w-full mt-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sell Product</h1>
        <Card className="p-6 space-y-6 w-full">
          {loading ? (
             <p>Loading inventory...</p>
          ) : inventory.length === 0 ? (
             <p>Your inventory is empty. Complete and receive orders to populate it.</p>
          ) : (
            <>
              {/* Product Selection */}
              <div>
                <label className="block mb-1 font-medium">Select Product</label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.masterProductId?.name || 'Unknown'} 
                        <Badge variant="outline" className="ml-2">{item.masterProductId?.catagory || 'N/A'}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sale History and Edit */}
              {selectedItem && (
                <>
                  <div>
                    <label className="block mb-1 font-medium">Quantity Stored</label>
                    <Input value={selectedItem.stockQuantity} disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Quantity Sold</label>
                    <Input type="number" min={0} max={selectedItem.stockQuantity} value={soldQty} onChange={e => setSoldQty(e.target.value)} placeholder="Enter sold quantity" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Quantity Remaining</label>
                    <Input value={remaining} disabled />
                    {remaining !== '' && Number(remaining) < 5 && (
                      <Badge variant="destructive" className="mt-2">Low stock! Consider restocking.</Badge>
                    )}
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={() => window.location.href = '/products/viewProduct'}>
                      Restock Item
                    </Button>
                    <Button type="button" variant="default" onClick={() => toast.success("Sale feature coming soon!")}>
                      Save Sale
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
