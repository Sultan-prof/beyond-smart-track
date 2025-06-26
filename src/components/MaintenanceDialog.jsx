import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Textarea } from '@/components/ui/textarea';
    import { DatePicker } from '@/components/DatePicker';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProjects } from '@/lib/data';
    import { Upload } from 'lucide-react';
    import { useToast } from './ui/use-toast';

    export const MaintenanceDialog = ({ open, onOpenChange, onSave, ticket }) => {
        const [projects] = useLocalStorage('projects', initialProjects);
        const [selectedProjectId, setSelectedProjectId] = useState('');
        const [clientName, setClientName] = useState('');
        const [issue, setIssue] = useState('');
        const [notes, setNotes] = useState('');
        const [maintenanceDate, setMaintenanceDate] = useState(null);
        const [status, setStatus] = useState('Open');
        const [isManualClient, setIsManualClient] = useState(false);
        const { toast } = useToast();

        useEffect(() => {
            if (ticket) {
                setSelectedProjectId(ticket.projectId || '');
                setClientName(ticket.clientName);
                setIssue(ticket.issue);
                setNotes(ticket.notes || '');
                setMaintenanceDate(ticket.maintenanceDate ? new Date(ticket.maintenanceDate) : null);
                setStatus(ticket.status);
                setIsManualClient(!ticket.projectId);
            } else {
                // Reset form
                setSelectedProjectId('');
                setClientName('');
                setIssue('');
                setNotes('');
                setMaintenanceDate(null);
                setStatus('Open');
                setIsManualClient(false);
            }
        }, [ticket, open]);

        useEffect(() => {
            if (selectedProjectId) {
                const project = projects.find(p => p.id === selectedProjectId);
                if (project) {
                    setClientName(project.clientName);
                }
            }
        }, [selectedProjectId, projects]);

        const handleSubmit = () => {
            if (!issue || (!selectedProjectId && !clientName)) {
                toast({ variant: 'destructive', title: 'Please fill out all required fields.' });
                return;
            }
            onSave({
                projectId: selectedProjectId,
                clientName,
                issue,
                notes,
                maintenanceDate: maintenanceDate?.toISOString(),
                status,
                date: ticket?.date || new Date().toISOString(),
                warranty: 'Active' // Mocked for now
            });
            onOpenChange(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{ticket ? 'Edit' : 'Create'} Maintenance Ticket</DialogTitle>
                        <DialogDescription>
                            {ticket ? 'Update the maintenance ticket details.' : 'Fill in the details to create a new maintenance ticket.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Client/Project</Label>
                            {isManualClient ? (
                                <Input placeholder="Enter Client Name" value={clientName} onChange={e => setClientName(e.target.value)} />
                            ) : (
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.clientName} - {p.id}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                             <Button variant="link" className="p-0 h-auto" onClick={() => setIsManualClient(!isManualClient)}>
                                {isManualClient ? 'Select from existing projects' : 'Or enter client manually'}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issue">Issue</Label>
                            <Input id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes/Description</Label>
                            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Expected Maintenance Date</Label>
                                <DatePicker date={maintenanceDate} setDate={setMaintenanceDate} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>File Upload</Label>
                            <Input type="file" />
                            <p className="text-xs text-muted-foreground">Upload photos or documents related to the issue.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>Save Ticket</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };