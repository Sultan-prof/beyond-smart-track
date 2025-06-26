
import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from "@/components/ui/use-toast";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { PlusCircle, Upload, Trash2, Edit } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProductTypes, userRoles } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';


    const UserDialog = ({ open, onOpenChange, onSave, userToEdit }) => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [role, setRole] = useState('Sales');
        const isEditing = !!userToEdit;

        React.useEffect(() => {
            if (userToEdit) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setPassword('');
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setRole('Sales');
            }
        }, [userToEdit, open]);

        const handleSubmit = () => {
            if(!name || !email || (!isEditing && !password) || !role) {
                alert('Please fill all fields');
                return;
            }
            const userData = { id: userToEdit?.id, name, email, role };
            if (password) {
                userData.password = password;
            }
            onSave(userData);
            onOpenChange(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Add'} User</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input type="password" placeholder={isEditing ? "New Password (optional)" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {userRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter><Button onClick={handleSubmit}>Save User</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const ProductTypeDialog = ({ open, onOpenChange, onSave, productType }) => {
        const [name, setName] = useState('');
        const [type, setType] = useState('Material');
        const [unit, setUnit] = useState('sqm');
        const [warranty, setWarranty] = useState(0);

        React.useEffect(() => {
            if (productType) {
                setName(productType.name);
                setType(productType.type);
                setUnit(productType.unit);
                setWarranty(productType.warranty);
            } else {
                setName('');
                setType('Material');
                setUnit('sqm');
                setWarranty(0);
            }
        }, [productType, open]);

        const handleSubmit = () => {
            onSave({ id: productType?.id, name, type, unit, warranty: Number(warranty) });
            onOpenChange(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{productType ? 'Edit' : 'Add'} Product Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Material">Material</SelectItem>
                                <SelectItem value="Accessory">Accessory</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select value={unit} onValueChange={setUnit}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sqm">sqm</SelectItem>
                                <SelectItem value="pcs">pcs</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Warranty (Years)" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
                    </div>
                    <DialogFooter><Button onClick={handleSubmit}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const Admin = () => {
      const { toast } = useToast();
      const { users, setUsers } = useAuth();
      const [productTypes, setProductTypes] = useLocalStorage('productTypes', initialProductTypes);
      
      const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
      const [editingProduct, setEditingProduct] = useState(null);
      const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
      const [editingUser, setEditingUser] = useState(null);

      const handleSaveProductType = (product) => {
        if (product.id) {
            setProductTypes(prev => prev.map(p => p.id === product.id ? { ...p, ...product } : p));
            toast({ title: "Product type updated!" });
        } else {
            setProductTypes(prev => [...prev, { ...product, id: `pt-${Date.now()}` }]);
            toast({ title: "Product type added!" });
        }
        setEditingProduct(null);
      };

      const handleDeleteProductType = (id) => {
        setProductTypes(prev => prev.filter(p => p.id !== id));
        toast({ title: "Product type deleted.", variant: "destructive" });
      };

      const handleSaveUser = (user) => {
        if (user.id) {
            setUsers(prev => prev.map(u => u.id === user.id ? {...u, ...user} : u));
            toast({ title: "User updated!" });
        } else {
            setUsers(prev => [...prev, { ...user, id: `user-${Date.now()}` }]);
            toast({ title: "User added!" });
        }
      };

      const handleDeleteUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast({ title: "User deleted.", variant: "destructive" });
      };

      const showToast = () => {
        toast({
          title: "🚧 Feature in progress!",
          description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        });
      };

      return (
        <>
          <Helmet><title>Admin - Beyond Smart Tech ERP</title></Helmet>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
              <p className="text-muted-foreground">Control all aspects of the ERP system.</p>
            </div>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="items">Items & Specs</TabsTrigger>
                <TabsTrigger value="system">System Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="users">
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center"><CardTitle>Manage Users</CardTitle><Button onClick={() => { setEditingUser(null); setIsUserDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/>Add User</Button></CardHeader>
                  <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell>{u.role}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setIsUserDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="items">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div><CardTitle>Items, Specs, and Warranties</CardTitle><CardDescription>Configure products, materials, and warranty periods.</CardDescription></div>
                    <Button onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Add Item Type</Button>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Unit</TableHead><TableHead>Warranty</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {productTypes.map(pt => (
                                <TableRow key={pt.id}>
                                    <TableCell>{pt.name}</TableCell><TableCell>{pt.type}</TableCell><TableCell>{pt.unit}</TableCell><TableCell>{pt.warranty} years</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(pt); setIsProductDialogOpen(true);}}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProductType(pt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="system">
                <Card>
                  <CardHeader><CardTitle>System Settings</CardTitle><CardDescription>Manage branding and other global settings.</CardDescription></CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2"><Label>Company Name</Label><Input defaultValue="Beyond Smart Glass" /></div>
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                         <img  class="h-16 w-16 rounded-lg object-contain border p-1" alt="Company Logo" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/0013e168-014e-47a1-84e3-702ea5906f5a/2182cdf5783315306f45f164ed32c425.png" />
                         <Button variant="outline" onClick={showToast}><Upload className="mr-2 h-4 w-4" /> Upload New Logo</Button>
                      </div>
                    </div>
                    <Button onClick={showToast}>Save Settings</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <ProductTypeDialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} onSave={handleSaveProductType} productType={editingProduct} />
          <UserDialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen} onSave={handleSaveUser} userToEdit={editingUser} />
        </>
      );
    };

    export default Admin;
