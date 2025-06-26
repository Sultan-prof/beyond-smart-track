
import React, { useState, useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Badge } from '@/components/ui/badge';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth } from '@/contexts/AuthContext';
    import { initialEmployeeFinancials, initialEmployees } from '@/lib/data';
    import { cn } from '@/lib/utils';
    import { PlusCircle } from 'lucide-react';

    const Custody = () => {
        const { toast } = useToast();
        const { user, users } = useAuth();
        const [employees] = useLocalStorage('employees', initialEmployees);
        const [financials, setFinancials] = useLocalStorage('employeeFinancials', initialEmployeeFinancials);
        
        const [selectedUserId, setSelectedUserId] = useState(user.id);
        const [amount, setAmount] = useState('');
        const [invoiceNumber, setInvoiceNumber] = useState('');
        const [notes, setNotes] = useState('');
        
        const isFinanceOrAdmin = user.role === 'Finance' || user.role === 'Admin';
        
        const currentFinancials = useMemo(() => {
            const targetUserId = isFinanceOrAdmin ? selectedUserId : user.id;
            return financials.find(f => f.userId === targetUserId) || { balance: 0, history: [] };
        }, [financials, selectedUserId, user.id, isFinanceOrAdmin]);

        const handleAddEntry = (e) => {
            e.preventDefault();
            const numericAmount = parseFloat(amount);
            if (!selectedUserId || !numericAmount || !invoiceNumber) {
                toast({ variant: 'destructive', title: 'Please fill all fields.' });
                return;
            }
            
            setFinancials(prev => {
                const financialRecordIndex = prev.findIndex(f => f.userId === selectedUserId);
                const newEntry = {
                    date: new Date().toISOString(),
                    amount: numericAmount,
                    invoiceNumber,
                    notes,
                    type: numericAmount > 0 ? 'credit' : 'debit'
                };
                if (financialRecordIndex > -1) {
                    const updatedRecord = { ...prev[financialRecordIndex] };
                    updatedRecord.balance += numericAmount;
                    updatedRecord.history.push(newEntry);
                    return prev.map((item, index) => index === financialRecordIndex ? updatedRecord : item);
                } else {
                    const employee = employees.find(e => e.userId === selectedUserId);
                    return [...prev, {
                        userId: selectedUserId,
                        employeeId: employee?.id,
                        balance: numericAmount,
                        history: [newEntry]
                    }];
                }
            });
            
            toast({ title: 'Custody record updated!' });
            setAmount(''); setInvoiceNumber(''); setNotes('');
        };
        
        return (
            <>
                <Helmet>
                    <title>My Custody - Beyond Smart Tech ERP</title>
                </Helmet>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Custody</h1>
                        <p className="text-muted-foreground">Your personal financial records and company assets.</p>
                    </div>

                    {isFinanceOrAdmin && (
                        <Card>
                            <CardHeader><CardTitle>Manage User Custody</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddEntry} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Select User</Label>
                                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount (use - for debit)</Label>
                                            <Input type="number" placeholder="e.g., -500 or 1000" value={amount} onChange={e => setAmount(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Invoice Number</Label>
                                            <Input placeholder="INV-12345" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Notes</Label>
                                            <Input placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Attachment</Label>
                                            <Input type="file" />
                                        </div>
                                    </div>
                                    <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Entry</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Financial History</CardTitle>
                            <CardDescription>
                                {isFinanceOrAdmin ? `Showing records for ${users.find(u => u.id === selectedUserId)?.name}` : 'Your financial history with the company.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 text-lg font-bold flex justify-end items-center">
                                Current Balance:
                                <Badge variant={currentFinancials.balance < 0 ? 'destructive' : 'default'} className={cn('ml-2 text-lg', currentFinancials.balance >= 0 && "bg-green-600")}>
                                    ${currentFinancials.balance?.toFixed(2) || '0.00'}
                                </Badge>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentFinancials.history.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.invoiceNumber}</TableCell>
                                            <TableCell>{item.notes}</TableCell>
                                            <TableCell className={cn("text-right font-semibold", item.type === 'debit' ? 'text-red-500' : 'text-green-500')}>
                                                {item.type === 'debit' ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {currentFinancials.history.length === 0 && (
                                        <TableRow><TableCell colSpan="4" className="text-center text-muted-foreground">No financial records found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    };

    export default Custody;
