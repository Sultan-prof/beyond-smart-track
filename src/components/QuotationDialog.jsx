
import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { useToast } from "@/components/ui/use-toast";
    import { PlusCircle, Trash2 } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';

    const initialItem = { id: Date.now(), productId: '', quantity: 1, price: '' };

    const QuotationDialog = ({ open, onOpenChange, onSave }) => {
      const { toast } = useToast();
      const [productTypes] = useLocalStorage('productTypes', []);
      
      const [client, setClient] = useState({ name: '', phone: '', email: '', city: '' });
      const [items, setItems] = useState([initialItem]);
      const [discount, setDiscount] = useState('');
      const [total, setTotal] = useState(0);

      useEffect(() => {
        const calculateTotal = () => {
          const itemsTotal = items.reduce((acc, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
          }, 0);
          const finalTotal = itemsTotal - (parseFloat(discount) || 0);
          setTotal(finalTotal < 0 ? 0 : finalTotal);
        };
        calculateTotal();
      }, [items, discount]);

      const handleAddItem = () => {
        setItems([...items, { ...initialItem, id: Date.now() }]);
      };
      
      const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
      };
      
      const handleItemChange = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
      };

      const handleCreateQuotation = (e) => {
        e.preventDefault();
        if (!client.name) {
            toast({ variant: "destructive", title: "Client name is required." });
            return;
        }
        const newQuotation = {
          clientName: client.name,
          clientInfo: client,
          city: client.city,
          status: 'Draft',
          total: total,
          date: new Date().toISOString().split('T')[0],
          items: items.filter(i => i.productId)
        };
        onSave(newQuotation);
        setClient({ name: '', phone: '', email: '', city: '' });
        setItems([initialItem]);
        setDiscount('');
        onOpenChange(false);
      };

      const getProductById = (id) => productTypes.find(p => p.id === id);

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Quotation</DialogTitle>
              <DialogDescription>Fill in details to generate a new quote. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateQuotation} className="grid gap-6 py-4">
              <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                <legend className="px-1 text-sm font-medium text-muted-foreground -ml-1">Client Details</legend>
                <Input placeholder="Client Name" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} required/>
                <Input placeholder="City" value={client.city} onChange={(e) => setClient({...client, city: e.target.value})}/>
                <Input placeholder="Phone Number" value={client.phone} onChange={(e) => setClient({...client, phone: e.target.value})}/>
                <Input placeholder="Email Address" type="email" value={client.email} onChange={(e) => setClient({...client, email: e.target.value})}/>
              </fieldset>
              
              <div className="space-y-4">
                <Label>Items</Label>
                {items.map((item, index) => (
                  <motion.div 
                      key={item.id} 
                      className="grid grid-cols-12 gap-2 items-center border p-3 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="col-span-12 md:col-span-5">
                      <Select value={item.productId} onValueChange={(value) => handleItemChange(item.id, 'productId', value)}>
                        <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                        <SelectContent>
                          {productTypes.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <Input placeholder={getProductById(item.productId)?.unit === 'sqm' ? 'Area (m²)' : 'Quantity (pcs)'} type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} required/>
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <Input placeholder="Unit Price" type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} required/>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
              </Button>

              <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t">
                  <Label htmlFor="discount" className="text-right">Discount ($)</Label>
                  <Input id="discount" type="number" className="max-w-xs" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)}/>
              </div>
              <div className="flex justify-end items-center font-bold text-xl">
                  <Label className="mr-4">Total:</Label>
                  <span>${total.toFixed(2)}</span>
              </div>
            
              <DialogFooter>
                <Button type="submit">Save Quotation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default QuotationDialog;
