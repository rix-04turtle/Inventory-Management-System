

import { DashboardLayout } from '@/components/applayout/with-dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Table, TableHeader, TableCell, TableBody, TableCaption,TableRow, TableFooter, TableHead } from '@/components/ui/table';
import {  CalendarIcon, ChevronDownIcon, HashIcon, TagIcon, DollarSignIcon, PackageIcon } from 'lucide-react';

const transactions = [
	// Multiple transactions per product
	{ id: 1, productId: 'P-001', name: 'Laptop', category: 'Electronics', type: 'added', quantity: 12, price: 1200, amount: 0, date: '2026-03-10' },
	{ id: 2, productId: 'P-001', name: 'Laptop', category: 'Electronics', type: 'sold', quantity: 5, price: 1200, amount: 5 * 1200, date: '2026-03-11' },
	{ id: 3, productId: 'P-002', name: 'Notebook', category: 'Stationery', type: 'added', quantity: 50, price: 3, amount: 0, date: '2026-03-09' },
	{ id: 4, productId: 'P-002', name: 'Notebook', category: 'Stationery', type: 'sold', quantity: 10, price: 3, amount: 10 * 3, date: '2026-03-10' },
	{ id: 5, productId: 'P-003', name: 'T-shirt', category: 'Clothing', type: 'added', quantity: 30, price: 15, amount: 0, date: '2026-03-08' },
	{ id: 6, productId: 'P-003', name: 'T-shirt', category: 'Clothing', type: 'sold', quantity: 8, price: 15, amount: 8 * 15, date: '2026-03-09' },
	{ id: 7, productId: 'P-004', name: 'Apple', category: 'Groceries', type: 'added', quantity: 100, price: 1, amount: 0, date: '2026-03-07' },
	{ id: 8, productId: 'P-004', name: 'Apple', category: 'Groceries', type: 'sold', quantity: 60, price: 1, amount: 60 * 1, date: '2026-03-08' },
	{ id: 9, productId: 'P-005', name: 'Water Bottle', category: 'Other', type: 'added', quantity: 20, price: 8, amount: 0, date: '2026-03-06' },
	{ id: 10, productId: 'P-005', name: 'Water Bottle', category: 'Other', type: 'sold', quantity: 5, price: 8, amount: 5 * 8, date: '2026-03-07' },
];


// Sort transactions by date descending
const sortedTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

export default function TransactionHistory() {
 return(
  <DashboardLayout>
   <div className="w-full mt-10 px-0">
	<h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
	 <CalendarIcon className="w-6 h-6" /> Transaction History
	</h1>
	<Card className="p-4 w-full">
	 <Table className="w-full">
	  <TableHeader>
	   <TableRow>
		<TableHead><HashIcon className="inline w-4 h-4 mr-1" />Txn ID</TableHead>
		<TableHead><HashIcon className="inline w-4 h-4 mr-1" />Product ID</TableHead>
		<TableHead><TagIcon className="inline w-4 h-4 mr-1" />Name</TableHead>
		<TableHead><PackageIcon className="inline w-4 h-4 mr-1" />Category</TableHead>
		<TableHead>Type</TableHead>
		<TableHead>Quantity</TableHead>
		<TableHead><DollarSignIcon className="inline w-4 h-4 mr-1" />Price</TableHead>
		<TableHead>Amount</TableHead>
		<TableHead><CalendarIcon className="inline w-4 h-4 mr-1" />Date</TableHead>
	   </TableRow>
	  </TableHeader>
	  <TableBody>
	   {sortedTransactions.map((txn) => (
		<TableRow key={txn.id}>
		 <TableCell>{txn.id}</TableCell>
		 <TableCell>{txn.productId}</TableCell>
		 <TableCell>{txn.name}</TableCell>
		 <TableCell>{txn.category}</TableCell>
		 <TableCell>
		  {txn.type === 'added' ? (
		   <Badge variant="success" className="bg-green-500 text-white">Added</Badge>
		  ) : (
		   <Badge variant="destructive" className="bg-red-500 text-white">Sold</Badge>
		  )}
		 </TableCell>
		 <TableCell>{txn.quantity}</TableCell>
		 <TableCell>${txn.price}</TableCell>
		 <TableCell>{txn.type === 'sold' ? `$${txn.amount}` : '-'}</TableCell>
		 <TableCell>{txn.date}</TableCell>
		</TableRow>
	   ))}
	  </TableBody>
	 </Table>
	</Card>
   </div>
  </DashboardLayout>
 );
}

