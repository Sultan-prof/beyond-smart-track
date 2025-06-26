
import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { DatePicker } from '@/components/DatePicker';
    import { useToast } from "@/components/ui/use-toast";
    import { PlusCircle, Trash2, ArrowLeft, Percent, CircleDollarSign } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth } from '@/contexts/AuthContext';
    import { initialProductTypes, initialInventory } from '@/lib/data';

    const initialItem = { id: Date.now(), productId: '', width: '', height: '', quantity: 1, price: '' };

    const QuotationCreate = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [quotations, setQuotations] = useLocalStorage('quotations', []);
      const [productTypes] = useLocalStorage('productTypes', initialProductTypes);
      const [inventory] = useLocalStorage('inventory', initialInventory);
      const { user, users } = useAuth();
      
      const [projectName, setProjectName] = useState('');
      const [date, setDate] = useState(new Date());
      const [client, setClient] = useState({ name: '', phone: '', email: '', city: '' });
      const [responsiblePersonId, setResponsiblePersonId] = useState(user.role === 'Admin' ? '' : user.id);
      const [items, setItems] = useState([initialItem]);
      
      const [discount, setDiscount] = useState('');
      const [discountType, setDiscountType] = useState('fixed');
      const [tax, setTax] = useState('');
      const [taxType, setTaxType] = useState('fixed');
      
      const [subtotal, setSubtotal] = useState(0);
      const [total, setTotal] = useState(0);

      useEffect(() => {
        const itemsSubtotal = items.reduce((acc, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
        }, 0);
        setSubtotal(itemsSubtotal);

        const discountValue = parseFloat(discount) || 0;
        const taxValue = parseFloat(tax) || 0;

        const discountAmount = discountType === 'percentage' ? itemsSubtotal * (discountValue / 100) : discountValue;
        const totalAfterDiscount = itemsSubtotal - discountAmount;
        const taxAmount = taxType === 'percentage' ? totalAfterDiscount * (taxValue / 100) : taxValue;
        const finalTotal = totalAfterDiscount + taxAmount;

        setTotal(finalTotal < 0 ? 0 : finalTotal);
      }, [items, discount, discountType, tax, taxType]);

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
        if (!client.name || !projectName || !date || (user.role === 'Admin' && !responsiblePersonId)) {
            toast({ variant: "destructive", title: "Please fill all required fields." });
            return;
        }
        const newQuotation = {
          id: `QT-${String(quotations.length + 1).padStart(3, '0')}`,
          projectName,
          clientName: client.name,
          clientInfo: client,
          city: client.city,
          status: 'Draft',
          total: total,
          subtotal: subtotal,
          discount: parseFloat(discount) || 0,
          discountType,
          tax: parseFloat(tax) || 0,
          taxType,
          date: date.toISOString(),
          items: items.filter(i => i.productId),
          ownerId: responsiblePersonId,
        };
        setQuotations(prev => [newQuotation, ...prev]);
        toast({
          title: "Quotation Created! 🎉",
          description: `${newQuotation.id} has been saved as a draft.`,
        });
        navigate('/quotations');
      };

      const getProductDetails = (productId) => productTypes.find(p => p.id === productId) || {};
      const salesAgents = users.filter(u => u.role === 'Sales' || u.role === 'Admin');

      return (
        <>
            <Helmet>
                <title>Create Quotation - Beyond Smart Tech ERP</title>
            </Helmet>
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
                </Button>
                <form onSubmit={handleCreateQuotation}>
                    <Card>
                    <CardHeader>
                        <CardTitle>Create New Quotation</CardTitle>
                        <CardDescription>Fill in the details to generate a new quote.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="project-name">Project Name</Label>
                                <Input id="project-name" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Quotation Date</Label>
                                <DatePicker date={date} setDate={setDate} />
                            </div>
                            {user.role === 'Admin' && (
                                <div className="space-y-2">
                                    <Label>Responsible Person</Label>
                                    <Select value={responsiblePersonId} onValueChange={setResponsiblePersonId} required>
                                        <SelectTrigger><SelectValue placeholder="Select a sales agent" /></SelectTrigger>
                                        <SelectContent>
                                            {salesAgents.map(agent => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                        <legend className="px-1 text-sm font-medium text-muted-foreground -ml-1">Client Details</legend>
                        <Input placeholder="Client Name" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} required/>
                        <Input placeholder="City" value={client.city} onChange={(e) => setClient({...client, city: e.target.value})}/>
                        <Input placeholder="Phone Number" value={client.phone} onChange={(e) => setClient({...client, phone: e.target.value})}/>
                        <Input placeholder="Email Address" type="email" value={client.email} onChange={(e) => setClient({...client, email: e.target.value})}/>
                        </fieldset>
                        
                        <div className="space-y-4">
                        <Label>Items</Label>
                        {items.map((item) => (
                            <motion.div 
                                key={item.id} 
                                className="grid grid-cols-12 gap-2 items-center border p-3 rounded-lg"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            >
                            <div className="col-span-12 md:col-span-4">
                                <Select value={item.productId} onValueChange={(value) => handleItemChange(item.id, 'productId', value)}>
                                <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                                <SelectContent>
                                    {inventory.map(inv => {
                                        const product = getProductDetails(inv.productId);
                                        return <SelectItem key={inv.id} value={inv.productId}>{product.name} (Stock: {inv.stock})</SelectItem>
                                    })}
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                               <Input placeholder="Width (m)" type="number" value={item.width} onChange={(e) => handleItemChange(item.id, 'width', e.target.value)} />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                               <Input placeholder="Height (m)" type="number" value={item.height} onChange={(e) => handleItemChange(item.id, 'height', e.target.value)} />
                            </div>
                            <div className="col-span-4 md:col-span-1">
                                <Input placeholder="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} required/>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <Input placeholder="Unit Price" type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} required/>
                            </div>
                            <div className="col-span-4 md:col-span-1 flex justify-end">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label>Discount</Label>
                                <div className="flex gap-2">
                                    <Select value={discountType} onValueChange={setDiscountType}>
                                        <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed"><CircleDollarSign className="h-4 w-4 inline-block mr-2"/>Fixed</SelectItem>
                                            <SelectItem value="percentage"><Percent className="h-4 w-4 inline-block mr-2"/>Percent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input id="discount" type="number" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)}/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>VAT / Tax</Label>
                                <div className="flex gap-2">
                                    <Select value={taxType} onValueChange={setTaxType}>
                                        <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed"><CircleDollarSign className="h-4 w-4 inline-block mr-2"/>Fixed</SelectItem>
                                            <SelectItem value="percentage"><Percent className="h-4 w-4 inline-block mr-2"/>Percent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input id="tax" type="number" placeholder="0.00" value={tax} onChange={(e) => setTax(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center font-bold text-xl mt-4">
                            <Label className="mr-4">Total:</Label>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">Create Quotation</Button>
                    </CardFooter>
                    </Card>
                </form>
            </div>
        </>
      );
    };

    export default QuotationCreate;
