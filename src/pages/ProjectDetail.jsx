import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useParams, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from "@/components/ui/use-toast";
    import { ArrowLeft, Save, Upload, Barcode } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProjects, projectStageFlow, projectStageProgress, initialQuotations } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';
    import { Progress } from '@/components/ui/progress';
    import QRCodeDialog from '@/components/QRCodeDialog';
    import { useNotifications } from '@/contexts/NotificationContext';

    const ProjectDetail = () => {
        const { id } = useParams();
        const navigate = useNavigate();
        const { toast } = useToast();
        const { user, users } = useAuth();
        const { addNotificationForRoles } = useNotifications();

        const [projects, setProjects] = useLocalStorage('projects', initialProjects);
        const [quotations] = useLocalStorage('quotations', initialQuotations);
        const [project, setProject] = useState(null);
        const [quotation, setQuotation] = useState(null);

        const [status, setStatus] = useState('');
        const [comment, setComment] = useState('');
        const [attachment, setAttachment] = useState(null);
        const [assignedTeam, setAssignedTeam] = useState('');
        const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
        const [qrCodeValue, setQrCodeValue] = useState('');

        const canEditStatus = user.role === 'Admin' || user.role === 'Installation Team';
        const canEditTeam = user.role === 'Admin' || user.role === 'Installation Team';
        const canRevert = user.role === 'Admin';
        
        const installationTeams = users.filter(u => u.role === 'Installation Team');

        useEffect(() => {
            const foundProject = projects.find(p => p.id === id);
            if (foundProject) {
                setProject(foundProject);
                setStatus(foundProject.status);
                setAssignedTeam(foundProject.team || '');
                const foundQuotation = quotations.find(q => q.id === foundProject.quotationId);
                setQuotation(foundQuotation);
            } else {
                navigate('/projects');
            }
        }, [id, projects, quotations, navigate]);

        const handleSave = () => {
            const currentStageIndex = projectStageFlow.indexOf(project.status);
            const newStageIndex = projectStageFlow.indexOf(status);

            if (!canRevert && newStageIndex < currentStageIndex) {
                toast({ variant: 'destructive', title: 'Cannot revert status.' });
                setStatus(project.status);
                return;
            }

            if (status === 'Postponed' && !comment) {
                toast({ variant: 'destructive', title: 'Comment required for postponed projects.' });
                return;
            }
            if (status === 'Delivered' && !attachment) {
                toast({ variant: 'destructive', title: 'Attachment required for delivered projects.' });
                return;
            }

            const progress = projectStageProgress[status] || project.progress;
            const updatedProject = { ...project, status, comment: status === 'Postponed' ? comment : '', team: assignedTeam, progress };
            
            if(status === 'Delivered' && project.status !== 'Delivered') {
                addNotificationForRoles({
                    roles: ['Admin', 'Sales'],
                    message: `Project ${project.id} for ${project.clientName} has been delivered.`,
                    link: `/projects/${project.id}`
                });
                toast({title: "Email alert sent to Admin & Sales."})
            }

            setProjects(projects.map(p => p.id === id ? updatedProject : p));
            toast({ title: "Project updated successfully!" });
        };

        const showProjectBarcode = () => {
            setQrCodeValue(JSON.stringify({
                projectId: project.id,
                clientName: project.clientName,
                summary: `Status: ${project.status}`
            }));
            setIsQrDialogOpen(true);
        };

        if (!project || !quotation) {
            return <div>Loading...</div>;
        }

        return (
            <>
                <Helmet>
                    <title>Project {project.id} - Beyond Smart Tech ERP</title>
                </Helmet>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => navigate('/projects')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={showProjectBarcode}><Barcode className="mr-2 h-4 w-4" /> Show Barcode</Button>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                        </div>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details - {project.id}</CardTitle>
                            <CardDescription>Client: {project.clientName} | Quotation: {project.quotationId}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Project Info</h3>
                                    <div><Label>Project Date:</Label> <p className="text-muted-foreground">{new Date(project.date).toLocaleDateString()}</p></div>
                                    <div><Label>Project Progress:</Label> <Progress value={project.progress} className="mt-1" /></div>
                                    <div>
                                        <Label>Project Status</Label>
                                        {canEditStatus ? (
                                            <Select value={status} onValueChange={setStatus}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {projectStageFlow.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                                                    <SelectItem value="Postponed">Postponed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : <p className="text-muted-foreground">{status}</p>}
                                    </div>
                                    {status === 'Postponed' && (
                                        <div className="space-y-2"><Label htmlFor="comment">Reason for Postponement (Required)</Label><Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} /></div>
                                    )}
                                    {status === 'Delivered' && (
                                        <div className="space-y-2"><Label htmlFor="attachment">Proof of Delivery (Required)</Label><Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files[0])} /></div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Team Assignment</h3>
                                    {canEditTeam ? (
                                        <div className="space-y-2">
                                            <Label>Assigned Team</Label>
                                            <Select value={assignedTeam} onValueChange={setAssignedTeam}>
                                                <SelectTrigger><SelectValue placeholder="Assign a team" /></SelectTrigger>
                                                <SelectContent>
                                                    {installationTeams.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div><Label>Assigned Team:</Label> <p className="text-muted-foreground">{project.team || 'Not Assigned'}</p></div>
                                    )}
                                    <h3 className="font-semibold pt-4">Attachments</h3>
                                    <div className="text-muted-foreground p-4 border rounded-md">File uploads for stages will be listed here.</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <QRCodeDialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen} value={qrCodeValue} title="Project Barcode" />
            </>
        );
    };

    export default ProjectDetail;