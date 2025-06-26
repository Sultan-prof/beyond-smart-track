import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useLocation } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { useToast } from "@/components/ui/use-toast";
    import { PlusCircle, Edit, Trash2, Download } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialMaintenanceTickets } from '@/lib/data';
    import { MaintenanceDialog } from '@/components/MaintenanceDialog';
    import { useAuth } from '@/contexts/AuthContext';
    import { useNotifications } from '@/contexts/NotificationContext';
    import { exportToExcel } from '@/lib/export';

    const Maintenance = () => {
      const { toast } = useToast();
      const location = useLocation();
      const { user } = useAuth();
      const { addNotificationForRoles } = useNotifications();
      const [tickets, setTickets] = useLocalStorage('maintenance', initialMaintenanceTickets);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [editingTicket, setEditingTicket] = useState(null);
      
      const canCreateEdit = user.role === 'Admin' || user.role === 'Sales' || user.role === 'Installation Team';
      const canDelete = user.role === 'Admin';

      useEffect(() => {
        if (location.state?.openDialog) {
          setIsDialogOpen(true);
        }
      }, [location.state]);

      const handleSaveTicket = (ticketData) => {
        if (editingTicket) {
            const updatedTickets = tickets.map(t => {
                if (t.id === editingTicket.id) {
                    const statusChanged = t.status !== ticketData.status;
                    const newHistory = statusChanged 
                        ? [...t.history, { status: ticketData.status, date: new Date().toISOString() }] 
                        : t.history;
                    return { ...t, ...ticketData, history: newHistory };
                }
                return t;
            });
            setTickets(updatedTickets);
            toast({ title: 'Ticket Updated!' });
        } else {
            const newTicket = {
                ...ticketData,
                id: `MNT-${String(tickets.length + 1).padStart(3, '0')}`,
                history: [{ status: ticketData.status, date: new Date().toISOString() }],
                ownerId: user.id,
            };
            setTickets(prev => [newTicket, ...prev]);
            toast({ title: 'Maintenance Ticket Created!' });
            addNotificationForRoles({
                roles: ['Admin', 'Installation Team'],
                message: `New maintenance ticket ${newTicket.id} created for ${newTicket.clientName}.`,
                link: `/maintenance`
            });
        }
        setEditingTicket(null);
      };

      const handleDeleteTicket = (id) => {
        if (!canDelete) {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }
        setTickets(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Ticket Deleted', variant: 'destructive' });
      };

      const openDialog = (ticket = null) => {
        if(!canCreateEdit) return;
        setEditingTicket(ticket);
        setIsDialogOpen(true);
      };
      
      const getStatusBadge = (status) => {
         switch (status) {
          case 'Open': return <Badge variant="destructive">{status}</Badge>;
          case 'In Progress': return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>;
          case 'Scheduled': return <Badge variant="default" className="bg-blue-500">Scheduled</Badge>;
          case 'Completed': return <Badge variant="default" className="bg-green-500">Completed</Badge>;
          default: return <Badge>{status}</Badge>;
        }
      };

      const handleExport = () => {
        const columns = [
            { header: 'Ticket ID', accessor: (d) => d.id },
            { header: 'Project ID', accessor: (d) => d.projectId },
            { header: 'Client', accessor: (d) => d.clientName },
            { header: 'Issue', accessor: (d) => d.issue },
            { header: 'Warranty', accessor: (d) => d.warranty },
            { header: 'Date', accessor: (d) => new Date(d.date).toLocaleDateString() },
            { header: 'Status', accessor: (d) => d.status },
            { header: 'History', accessor: (d) => JSON.stringify(d.history) },
        ];
        exportToExcel({
            data: tickets,
            columns,
            fileName: 'Maintenance_Tickets'
        });
        toast({ title: "Exporting maintenance tickets to Excel." });
      };

      return (
        <>
          <Helmet>
            <title>Maintenance - Beyond Smart Tech ERP</title>
            <meta name="description" content="Track and manage client maintenance requests." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
                <p className="text-muted-foreground">Manage all warranty and maintenance tickets.</p>
              </div>
              <div className="flex items-center gap-2">
                {canCreateEdit && (
                  <Button onClick={() => openDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Ticket
                  </Button>
                )}
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Excel
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Tickets</CardTitle>
                <CardDescription>An overview of all submitted maintenance requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.clientName}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.issue}</TableCell>
                        <TableCell>
                            <Badge variant={ticket.warranty === 'Active' ? 'default' : 'outline'}>
                                {ticket.warranty}
                            </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-right">
                          {canCreateEdit && 
                            <Button variant="ghost" size="icon" onClick={() => openDialog(ticket)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                          }
                          {canDelete && 
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTicket(ticket.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <MaintenanceDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSaveTicket}
            ticket={editingTicket}
          />
        </>
      );
    };

    export default Maintenance;