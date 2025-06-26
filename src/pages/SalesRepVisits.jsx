import React, { useState, useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from "@/components/ui/use-toast";
    import { PlusCircle, FileDown } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialSalesRepVisits, initialUsers } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';
    import { exportToPDF, exportToExcel } from '@/lib/export';

    const SalesRepVisits = () => {
        const { toast } = useToast();
        const { user } = useAuth();
        const [visits, setVisits] = useLocalStorage('salesRepVisits', initialSalesRepVisits);
        const [users] = useLocalStorage('users', initialUsers);

        const [clientName, setClientName] = useState('');
        const [phone, setPhone] = useState('');
        const [companyName, setCompanyName] = useState('');
        const [projectName, setProjectName] = useState('');
        const [notes, setNotes] = useState('');

        const userVisits = useMemo(() => {
            const visitsWithRepNames = visits.map(visit => {
                const rep = users.find(u => u.id === visit.ownerId);
                return { ...visit, repName: rep ? rep.name : 'Unknown' };
            });

            if (user?.role === 'Admin') {
                return visitsWithRepNames;
            }
            return visitsWithRepNames.filter(v => v.ownerId === user?.id);
        }, [visits, user, users]);

        const handleAddVisit = (e) => {
            e.preventDefault();
            if (!clientName || !phone) {
                toast({ variant: 'destructive', title: 'Client Name and Phone are required.' });
                return;
            }
            const newVisit = {
                id: `visit-${Date.now()}`,
                ownerId: user.id,
                clientName,
                phone,
                companyName,
                projectName,
                notes,
                visitDate: new Date().toISOString(),
            };
            setVisits(prev => [newVisit, ...prev]);
            toast({ title: 'Visit logged successfully!' });
            // Reset form
            setClientName(''); setPhone(''); setCompanyName(''); setProjectName(''); setNotes('');
        };

        const handleExport = (format) => {
            const data = userVisits;
            const columns = [
                { header: 'Rep Name', accessor: 'repName' },
                { header: 'Client', accessor: 'clientName' },
                { header: 'Company', accessor: 'companyName' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Date', accessor: 'visitDate' },
            ];
            const title = "Sales Rep Visits Report";
            const fileName = "SalesRepVisits";

            if (format === 'pdf') {
                exportToPDF(columns, data, title, fileName);
            } else {
                exportToExcel(data, fileName);
            }
            toast({ title: `Exporting data to ${format.toUpperCase()}` });
        };

        return (
            <>
                <Helmet>
                    <title>Sales Rep Visits - Beyond Smart Tech ERP</title>
                    <meta name="description" content="Log and track potential clients and sales visits." />
                </Helmet>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Sales Rep Visits</h1>
                            <p className="text-muted-foreground">Log potential clients and visit reports.</p>
                        </div>
                        {user?.role === 'Admin' && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleExport('pdf')}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
                                <Button variant="outline" onClick={() => handleExport('excel')}><FileDown className="mr-2 h-4 w-4" />Export Excel</Button>
                            </div>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Log New Visit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddVisit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Input placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} required />
                                    <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                                    <Input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                                    <Input placeholder="Project Name (Optional)" value={projectName} onChange={e => setProjectName(e.target.value)} />
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Visit Date: {new Date().toLocaleDateString()}</Label>
                                        <p className="text-sm text-muted-foreground">Date is automatically set to today and cannot be changed.</p>
                                    </div>
                                </div>
                                <Textarea placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                                <div className="space-y-2">
                                    <Label>File Attachment (Optional)</Label>
                                    <Input type="file" />
                                </div>
                                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Log Visit</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Logged Visits</CardTitle>
                            <CardDescription>A list of all your logged client visits.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {user?.role === 'Admin' && <TableHead>Rep Name</TableHead>}
                                        <TableHead>Client</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userVisits.map(visit => (
                                        <TableRow key={visit.id}>
                                            {user?.role === 'Admin' && <TableCell>{visit.repName}</TableCell>}
                                            <TableCell>{visit.clientName}</TableCell>
                                            <TableCell>{visit.companyName}</TableCell>
                                            <TableCell>{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="max-w-xs truncate">{visit.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    };

    export default SalesRepVisits;