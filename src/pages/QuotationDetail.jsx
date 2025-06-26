import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useParams, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { useToast } from "@/components/ui/use-toast";
    import { ArrowLeft, Edit, Save, Upload, FileLock } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialQuotations, initialProjects, initialInventory, projectStageProgress, initialProductTypes } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';
    import { useNotifications } from '@/contexts/NotificationContext';

    const QuotationDetail = () => {
      const { id } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user } = useAuth();
      const { addNotificationForRoles } = useNotifications();

      const [quotations, setQuotations] = useLocalStorage('quotations', initialQuotations);
      const [projects, setProjects] = useLocalStorage('projects', initialProjects);
      const [inventory, setInventory] = useLocalStorage('inventory', initialInventory);
      const [productTypes] = useLocalStorage('productTypes', initialProductTypes);
      
      const [quotation, setQuotation] = useState(null);
      const [isEditing, setIsEditing] = useState(false);
      const [contractFile, setContractFile] = useState(null);

      const canRevert = user.role === 'Admin';

      useEffect(() => {
        const foundQuotation = quotations.find(q => q.id === id);
        if (foundQuotation) {
          setQuotation(foundQuotation);
        } else {
          navigate('/quotations');
        }
      }, [id, quotations, navigate]);

      const handleSave = () => {
        const originalQuotation = quotations.find(q => q.id === id);
        const isConverting = quotation.status === 'Accepted' && originalQuotation.status !== 'Accepted';
        const isReverting = user.role === 'Admin' && originalQuotation.status === 'Converted to Project' && quotation.status !== 'Converted to Project';

        if (isConverting) {
            if(!contractFile) {
                toast({ variant: 'destructive', title: 'Contract upload required to accept quotation.' });
                setQuotation(originalQuotation);
                return;
            }
            
            const newInventory = [...inventory];
            let canCreate = true;
            
            quotation.items.forEach(item => {
                const inventoryItemIndex = newInventory.findIndex(i => i.productId === item.productId);
                const product = productTypes.find(p => p.id === item.productId);
                const quantityToDeduct = product.unit === 'sqm' ? (item.width * item.height * item.quantity) : item.quantity;

                if (inventoryItemIndex > -1) {
                    if (newInventory[inventoryItemIndex].stock < quantityToDeduct) {
                        canCreate = false;
                        toast({ variant: "destructive", title: "Insufficient Stock", description: `Not enough stock for ${product.name}.` });
                    }
                } else {
                    canCreate = false;
                    toast({ variant: "destructive", title: `Product ${product.name} not found in Warehouse` });
                }
            });

            if (!canCreate) {
                setQuotation(originalQuotation);
                return;
            }

            quotation.items.forEach(item => {
                const inventoryItemIndex = newInventory.findIndex(i => i.productId === item.productId);
                const product = productTypes.find(p => p.id === item.productId);
                const quantityToDeduct = product.unit === 'sqm' ? (item.width * item.height * item.quantity) : item.quantity;
                newInventory[inventoryItemIndex].stock -= quantityToDeduct;

                if(newInventory[inventoryItemIndex].stock < 10) {
                     addNotificationForRoles({ roles: ['Admin', 'Warehouse'], message: `Low stock warning for ${product.name}: ${newInventory[inventoryItemIndex].stock} remaining.`, link: '/warehouse' });
                     toast({title: `Low stock email alert sent for ${product.name}.`});
                }
            });
            setInventory(newInventory);

            const newProject = {
              id: `PROJ-${String(projects.length + 1).padStart(3, '0')}`,
              quotationId: quotation.id,
              ownerId: quotation.ownerId,
              clientName: quotation.clientName,
              status: 'Measurements',
              progress: projectStageProgress['Measurements'],
              team: '',
              deliveryDate: '',
              date: new Date().toISOString(),
              attachments: [{ stage: 'Contract', file: contractFile.name, date: new Date().toISOString() }],
            };
            setProjects(prev => [...prev, newProject]);
            
            const finalQuotation = {...quotation, status: 'Converted to Project'};
            setQuotations(quotations.map(q => q.id === id ? finalQuotation : q));
            
            addNotificationForRoles({
                roles: ['Admin', 'Sales', 'Warehouse'],
                message: `Quotation ${quotation.id} accepted. New project ${newProject.id} created.`,
                link: `/projects/${newProject.id}`
            });
            toast({ title: "Project Created!", description: `${newProject.id} created, stock updated. Email alerts sent.` });
            navigate('/projects');
            return;
        }

        if (isReverting) {
            const projectToRevert = projects.find(p => p.quotationId === id);
            if (projectToRevert) {
                setProjects(prev => prev.filter(p => p.quotationId !== id));
                const newInventory = [...inventory];
                originalQuotation.items.forEach(item => {
                    const invIndex = newInventory.findIndex(i => i.productId === item.productId);
                    if (invIndex > -1) {
                         const product = productTypes.find(p => p.id === item.productId);
                         const quantityToReturn = product.unit === 'sqm' ? (item.width * item.height * item.quantity) : item.quantity;
                        newInventory[invIndex].stock += quantityToReturn;
                    }
                });
                setInventory(newInventory);
                toast({ title: "Project Reverted", description: "Stock has been returned to the warehouse." });
            }
        }
        
        setQuotations(quotations.map(q => q.id === id ? quotation : q));
        setIsEditing(false);
        toast({ title: "Quotation updated successfully!" });
      };

      if (!quotation) {
        return <div>Loading...</div>;
      }

      const isConverted = quotation.status === 'Converted to Project';

      return (
        <>
            <Helmet>
                <title>Quotation {quotation.id} - Beyond Smart Tech ERP</title>
            </Helmet>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
                    </Button>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} disabled={isConverted && !canRevert}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                        )}
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Quotation Details - {quotation.id}</CardTitle>
                        <CardDescription>Project: {isEditing ? <Input value={quotation.projectName} onChange={(e) => setQuotation({...quotation, projectName: e.target.value})} /> : quotation.projectName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><Label>Client</Label><p className="font-semibold">{isEditing ? <Input value={quotation.clientName} onChange={(e) => setQuotation({...quotation, clientName: e.target.value})} /> : quotation.clientName}</p></div>
                            <div><Label>Date</Label><p className="font-semibold">{new Date(quotation.date).toLocaleDateString()}</p></div>
                            <div><Label>Total</Label><p className="font-bold text-lg">${quotation.total.toFixed(2)}</p></div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            {isEditing ? (
                                <Select value={quotation.status} onValueChange={(status) => setQuotation(prev => ({ ...prev, status }))} disabled={isConverted && !canRevert}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Sent">Sent</SelectItem>
                                        <SelectItem value="Accepted">Accepted</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        {isConverted && <SelectItem value="Converted to Project" disabled>Converted to Project</SelectItem>}
                                    </SelectContent>
                                </Select>
                            ) : <p className="font-semibold">{quotation.status}</p>}
                        </div>
                        {isEditing && quotation.status === 'Accepted' && (
                            <div className="space-y-2 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                                <Label htmlFor="contract" className="font-semibold flex items-center gap-2"><Upload className="h-4 w-4"/>Upload Signed Contract (Required)</Label>
                                <Input id="contract" type="file" onChange={(e) => setContractFile(e.target.files[0])} />
                            </div>
                        )}
                        {isConverted && 
                         <div className="space-y-2 p-4 border-l-4 border-green-500 bg-green-500/10 rounded-r-lg">
                             <p className="font-semibold flex items-center gap-2"><FileLock className="h-4 w-4"/>This quotation has been converted to a project and is locked.</p>
                             {canRevert && <p className="text-sm text-muted-foreground">As an Admin, you can change the status to revert the project.</p>}
                         </div>
                        }
                    </CardContent>
                </Card>
            </div>
        </>
      );
    };

    export default QuotationDetail;