import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';

const ViewProduct = () => {
  const [productsData, setProductsData] = useState({});
  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const API = `${BASE_URL}/products/view`;

      try {
        const response = await fetch(API);
        const data = await response.json();
        if (data.status === 'success' && data.products) {
          const fetchedProducts = data.products;
          
          // Group products by adminId
          const groupedData = {};
          const adminsMap = new Map();

          fetchedProducts.forEach(product => {
            const adminId = product.adminId || 'Unknown Admin';
            
            if (!groupedData[adminId]) {
              groupedData[adminId] = [];
            }
            groupedData[adminId].push({
              id: product._id,
              name: product.name || product.productName,
              description: product.description,
              price: product.basePrice || product.price,
              stock: product.stockQuantity || product.quantity || 0,
              category: product.catagory || product.category
            });

            // Set admin entry if not exists
            if (!adminsMap.has(adminId)) {
              adminsMap.set(adminId, {
                id: adminId,
                name: adminId === 'Unknown Admin' ? 'Unknown Admin' : `Supplier ${adminId.slice(-4)}`
              });
            }
          });

          setProductsData(groupedData);
          setAdminsList(Array.from(adminsMap.values()));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(qty) || qty < 1 ? 1 : qty,
    }));
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('retailerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('retailerCart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      alert("Cannot order more than available stock");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id && item.adminId === selectedAdmin);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.adminId === selectedAdmin
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, adminId: selectedAdmin }];
    });

    // Reset quantity input after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const currentProducts = selectedAdmin ? productsData[selectedAdmin] || [] : [];
  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <DashboardLayout>
      <div className="w-full mt-10 px-0">
      <Head>
        <title>View Products | Retailer</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
            <p className="text-sm text-gray-500 mt-1">Browse and order products from available admins.</p>
          </div>
          <Button 
            variant="default" 
            className="relative flex items-center gap-2 h-12 px-6"
            onClick={() => window.location.href = '/cart'}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">Cart</span>
            {cartTotalItems > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1">
                {cartTotalItems}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters / Admin Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Supplier (Admin)</CardTitle>
            <CardDescription>Choose an admin to view their available product catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-4 text-center">Loading suppliers...</div>
            ) : (
              <Select onValueChange={(value) => setSelectedAdmin(value)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select an admin..." />
                </SelectTrigger>
                <SelectContent>
                  {adminsList.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Products Section */}
        {selectedAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
              <CardDescription>
                Showing products for {adminsList.find(a => a.id === selectedAdmin)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock Available</TableHead>
                        <TableHead className="w-[150px]">Quantity</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 max-w-[200px] truncate" title={product.description}>
                            {product.description || '-'}
                          </TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                              {product.stock} in stock
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={product.stock}
                              value={quantities[product.id] || ''}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              placeholder="Qty"
                              disabled={product.stock === 0}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              size="sm"
                            >
                              Add to Cart
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 italic py-4">No products found for this admin.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewProduct;
