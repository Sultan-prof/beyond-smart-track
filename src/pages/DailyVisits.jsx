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
    import { initialDailyVisits } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';
    import { exportToPDF, exportToExcel } from '@/lib/export';
    import { useNotifications } from '@/contexts/NotificationContext';

    const DailyVisits = () => {
        const { toast } = useToast();
        const { user, users } = useAuth();
        const { addNotificationForRoles } = useNotifications();
        const [visits, setVisits] = useLocalStorage('dailyVisits', initialDailyVisits);

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
            addNotificationForRoles({
                roles: ['Admin'],
                message: `New daily visit logged by ${user.name} for ${clientName}.`,
                link: '/daily-visits'
            });
            setClientName(''); setPhone(''); setCompanyName(''); setProjectName(''); setNotes('');
        };

        const handleExport = (format) => {
            const data = userVisits.map(v => ({
                'Added By': v.repName,
                'Client': v.clientName,
                'Company': v.companyName,
                'Phone': v.phone,
                'Date': new Date(v.visitDate).toLocaleDateString(),
            }));

            const columns = [
                { header: 'Added By', accessor: 'Added By' },
                { header: 'Client', accessor: 'Client' },
                { header: 'Company', accessor: 'Company' },
                { header: 'Phone', accessor: 'Phone' },
                { header: 'Date', accessor: 'Date' },
            ];
            const title = "Daily Visits Report";
            const fileName = "DailyVisits";

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
                    <title>Daily Visits - Beyond Smart Tech ERP</title>
                    <meta name="description" content="Log and track potential clients and daily visits." />
                </Helmet>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Daily Visits</h1>
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
                                        {user?.role === 'Admin' && <TableHead>Added By</TableHead>}
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

    export default DailyVisits;