import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Upload, Edit } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { initialInventory, initialProductTypes } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const InventoryDialog = ({
  open,
  onOpenChange,
  onSave,
  inventoryItem,
  productTypes
}) => {
  const [productId, setProductId] = useState('');
  const [stock, setStock] = useState(0);
  React.useEffect(() => {
    if (inventoryItem) {
      setProductId(inventoryItem.productId);
      setStock(inventoryItem.stock);
    } else {
      setProductId('');
      setStock(0);
    }
  }, [inventoryItem, open]);
  const handleSubmit = () => {
    if (!productId) {
      alert("Please select a product.");
      return;
    }
    onSave({
      id: inventoryItem?.id,
      productId,
      stock: Number(stock)
    });
    onOpenChange(false);
  };
  const getProductName = pId => productTypes.find(p => p.id === pId)?.name || 'N/A';
  return <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{inventoryItem ? `Edit Stock for ${getProductName(inventoryItem.productId)}` : 'Add New Item to Inventory'}</DialogTitle>
                        <DialogDescription>
                            {inventoryItem ? 'Update the stock quantity for this item.' : 'Select a product and set its initial stock.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product" className="text-right">Product</Label>
                            <Select value={productId} onValueChange={setProductId} disabled={!!inventoryItem}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a product" /></SelectTrigger>
                                <SelectContent>
                                    {productTypes.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">Stock</Label>
                            <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>;
};
const Inventory = () => {
  const {
    toast
  } = useToast();
  const [productTypes] = useLocalStorage('productTypes', initialProductTypes);
  const [inventory, setInventory] = useLocalStorage('inventory', initialInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const getProductDetails = productId => {
    return productTypes.find(p => p.id === productId) || {};
  };
  const handleSaveInventory = item => {
    if (item.id) {
      setInventory(prev => prev.map(i => i.id === item.id ? {
        ...i,
        ...item
      } : i));
      toast({
        title: "Stock updated!"
      });
    } else {
      const existing = inventory.find(i => i.productId === item.productId);
      if (existing) {
        toast({
          title: "Item already in inventory.",
          description: "Please edit the existing item.",
          variant: "destructive"
        });
        return;
      }
      setInventory(prev => [...prev, {
        ...item,
        id: `inv-${Date.now()}`
      }]);
      toast({
        title: "Item added to inventory!"
      });
    }
    setEditingItem(null);
  };
  const openEditDialog = item => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };
  const openAddDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };
  const showToast = () => {
    toast({
      title: "🚧 Feature in progress!",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };
  return <>
          <Helmet>
            <title>Inventory - Beyond Smart Tech ERP</title>
            <meta name="description" content="Track and manage your product inventory." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
                <p className="text-muted-foreground">Manage stock levels for all products and accessories.</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={showToast}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Invoice
                </Button>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Item
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Current inventory levels for all items.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map(item => {
                const product = getProductDetails(item.productId);
                const isLowStock = item.stock < 15;
                return <TableRow key={item.id}>
                        <TableCell className="font-medium">{product.name || 'N/A'}</TableCell>
                        <TableCell>{product.type || 'N/A'}</TableCell>
                        <TableCell>{product.unit || 'N/A'}</TableCell>
                        <TableCell>
                          {isLowStock ? <Badge variant="destructive">{item.stock}</Badge> : <span className="font-semibold">{item.stock}</span>}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>;
              })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <InventoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveInventory} inventoryItem={editingItem} productTypes={productTypes.filter(pt => !inventory.some(inv => inv.productId === pt.id && inv.id !== editingItem?.id))} />
        </>;
};
export default Inventory;