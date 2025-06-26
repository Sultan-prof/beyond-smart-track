import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Badge } from "@/components/ui/badge";
    import { PlusCircle, Edit, FileDown } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialInventory, initialProductTypes } from '@/lib/data';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { exportToPDF, exportToExcel } from '@/lib/export';
    import { useAuth } from '@/contexts/AuthContext';

    const AddProductDialog = ({ open, onOpenChange, onSave }) => {
        const [name, setName] = useState('');
        const [unit, setUnit] = useState('sqm');
        const [quantity, setQuantity] = useState(0);

        const handleSubmit = () => {
            if (!name || !unit || quantity <= 0) {
                alert("Please fill all fields correctly.");
                return;
            }
            onSave({ name, unit, quantity: Number(quantity) });
            onOpenChange(false);
            setName('');
            setUnit('sqm');
            setQuantity(0);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Product to Warehouse</DialogTitle>
                        <DialogDescription>Create a new product type and add its initial stock.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} />
                        <Select value={unit} onValueChange={setUnit}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sqm">sqm</SelectItem>
                                <SelectItem value="pcs">pcs</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Initial Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>Add Product</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const EditStockDialog = ({ open, onOpenChange, onSave, inventoryItem, productTypes }) => {
        const [stock, setStock] = useState(0);
        
        React.useEffect(() => {
            if (inventoryItem) {
                setStock(inventoryItem.stock);
            }
        }, [inventoryItem, open]);

        const handleSubmit = () => {
            onSave({ ...inventoryItem, stock: Number(stock) });
            onOpenChange(false);
        };

        const getProductName = pId => productTypes.find(p => p.id === pId)?.name || 'N/A';

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Stock for {getProductName(inventoryItem?.productId)}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const Warehouse = () => {
        const { toast } = useToast();
        const { user } = useAuth();
        const [productTypes, setProductTypes] = useLocalStorage('productTypes', initialProductTypes);
        const [inventory, setInventory] = useLocalStorage('inventory', initialInventory);
        const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
        const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
        const [editingItem, setEditingItem] = useState(null);

        const canEdit = user?.role === 'Admin' || user?.role === 'Warehouse';

        const getProductDetails = productId => productTypes.find(p => p.id === productId) || {};

        const handleSaveNewProduct = (productData) => {
            const newProductType = {
                id: `pt-${Date.now()}`,
                name: productData.name,
                type: productData.unit === 'sqm' ? 'Material' : 'Accessory',
                unit: productData.unit,
                warranty: 1,
            };
            setProductTypes(prev => [...prev, newProductType]);

            const newInventoryItem = {
                id: `inv-${Date.now()}`,
                productId: newProductType.id,
                stock: productData.quantity,
            };
            setInventory(prev => [...prev, newInventoryItem]);
            toast({ title: "Product added successfully!" });
        };

        const handleUpdateStock = (item) => {
            setInventory(prev => prev.map(i => i.id === item.id ? item : i));
            toast({ title: "Stock updated!" });
            setEditingItem(null);
        };

        const openEditDialog = (item) => {
            setEditingItem(item);
            setIsEditDialogOpen(true);
        };

        const handleExport = (format) => {
            const data = inventory.map(item => {
                const product = getProductDetails(item.productId);
                return {
                    Name: product.name,
                    Type: product.type,
                    Unit: product.unit,
                    Stock: item.stock,
                };
            });
            const columns = [
                { header: 'Name', accessor: d => d.Name },
                { header: 'Type', accessor: d => d.Type },
                { header: 'Unit', accessor: d => d.Unit },
                { header: 'Stock', accessor: d => d.Stock },
            ];
            const title = "Warehouse Stock Report";
            const fileName = "Warehouse_Stock";

            if (format === 'pdf') {
                exportToPDF(columns, data, title, fileName);
            } else {
                exportToExcel({ data, columns, fileName });
            }
            toast({ title: `Exporting Warehouse Data to ${format.toUpperCase()}` });
        };

        return (
            <>
                <Helmet>
                    <title>Warehouse - Beyond Smart Tech ERP</title>
                    <meta name="description" content="Track and manage your product warehouse." />
                </Helmet>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
                            <p className="text-muted-foreground">Manage stock levels for all products and accessories.</p>
                        </div>
                        {canEdit && (
                            <div className="space-x-2">
                                <Button variant="outline" onClick={() => handleExport('pdf')}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
                                <Button variant="outline" onClick={() => handleExport('excel')}><FileDown className="mr-2 h-4 w-4" />Export Excel</Button>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                                </Button>
                            </div>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Levels</CardTitle>
                            <CardDescription>Current warehouse levels for all items.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Stock</TableHead>
                                        {canEdit && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map(item => {
                                        const product = getProductDetails(item.productId);
                                        const isLowStock = item.stock < 15;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{product.name || 'N/A'}</TableCell>
                                                <TableCell>{product.type || 'N/A'}</TableCell>
                                                <TableCell>{product.unit || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {isLowStock ? <Badge variant="destructive">{item.stock}</Badge> : <span className="font-semibold">{item.stock}</span>}
                                                </TableCell>
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                {canEdit && <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSave={handleSaveNewProduct} />}
                {canEdit && editingItem && <EditStockDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSave={handleUpdateStock} inventoryItem={editingItem} productTypes={productTypes} />}
            </>
        );
    };

    export default Warehouse;