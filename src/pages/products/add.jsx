import { DashboardLayout } from "@/components/applayout/with-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const categories = [
  "Electronics",
  "Groceries",
  "Clothing",
  "Stationery",
  "Other",
];
const units = ["pcs", "kg", "litre", "box", "pack"];

export default function ProductList() {
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [minQty, setMinQty] = useState("");
  const [qty, setQty] = useState("");

  async function addingProduct() {
    const payload = {
      productCatagory: category,
      productName: productName,
      productStockQnt: Number(qty),
      productImage: productImage,
      productDescription: productDescription,
      productBasePrice: Number(productPrice),
      productminStockLevel: Number(minQty),
    };

    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const API = `${BASE_URL}/products/add`;

    try {
      const response = await fetch(API, params).then((rawData) =>
        rawData.json(),
      );
      console.log(response);
    } catch (err) {
      console.error("IT's a Error", err);
    }
  }

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
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Name Input */}
          <div>
            <label className="block mb-1 font-medium">Product Name</label>
            <Input 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Type product name..." 
            />
          </div>

          {/* Product Image Input */}
          <div>
            <label className="block mb-1 font-medium">Product Image URL</label>
            <Input 
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              placeholder="Enter image URL..." 
            />
          </div>

          {/* Product Description Input */}
          <div>
            <label className="block mb-1 font-medium">Product Description</label>
            <Input 
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Type product description..." 
            />
          </div>

          {/* Product Price*/}
          <div>
            <label className="block mb-1 font-medium">
              Price Per Unit (RS.)
            </label>
            <Input 
              type="number" 
              min={0} 
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="Type product price..." 
            />
          </div>

          {/* Quantity and Unit */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Quantity</label>
              <Input
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Unit</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Minimum Quantity for Alert */}
          <div>
            <label className="block mb-1 font-medium">
              Minimum Quantity for Alert
            </label>
            <Input
              type="number"
              min={0}
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="Set minimum quantity..."
            />
            {qty && minQty && Number(qty) <= Number(minQty) && (
              <Badge variant="destructive" className="mt-2">
                Alert: Quantity is at or below minimum!
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90"
              onClick={addingProduct}
            >
              Add
            </button>
            <button
              type="button"
              className="bg-muted text-foreground px-6 py-2 rounded-md font-medium hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
