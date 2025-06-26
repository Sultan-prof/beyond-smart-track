import React, { useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Progress } from '@/components/ui/progress';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Download } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProjects } from '@/lib/data';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from "@/components/ui/use-toast";
    import { exportToExcel } from '@/lib/export';

    const Projects = () => {
      const { user } = useAuth();
      const [projects] = useLocalStorage('projects', initialProjects);
      const navigate = useNavigate();
      const { toast } = useToast();
      
      const userProjects = useMemo(() => {
        if (user?.role === 'Admin') {
            return projects;
        }
        if (user?.role === 'Sales') {
            return projects.filter(p => p.ownerId === user?.id);
        }
        return projects;
      }, [projects, user]);

      const handleExport = () => {
        const columns = [
            { header: 'Project ID', accessor: (d) => d.id },
            { header: 'Quotation ID', accessor: (d) => d.quotationId },
            { header: 'Client', accessor: (d) => d.clientName },
            { header: 'Status', accessor: (d) => d.status },
            { header: 'Progress', accessor: (d) => `${d.progress}%` },
            { header: 'Assigned Team', accessor: (d) => d.team || 'N/A' },
            { header: 'Date', accessor: (d) => new Date(d.date).toLocaleDateString() },
            { header: 'Delivery Date', accessor: (d) => d.deliveryDate || 'N/A' },
            { header: 'Comments', accessor: (d) => d.comment || '' },
        ];
        exportToExcel({
            data: userProjects,
            columns,
            fileName: 'Projects_Export'
        });
        toast({ title: "Exporting projects to Excel." });
      };

      const getStatusBadge = (status) => {
        const base = "capitalize";
        switch (status) {
          case 'Delivered': return <Badge variant="default" className={`${base} bg-green-500`}>{status}</Badge>;
          case 'Installation Start':
          case 'Final Installation':
           return <Badge variant="default" className={`${base} bg-blue-500`}>{status}</Badge>;
          case 'Manufacturing': return <Badge variant="default" className={`${base} bg-yellow-500`}>{status}</Badge>;
          case 'Measurements': return <Badge variant="default" className={`${base} bg-purple-500`}>{status}</Badge>;
          case 'Postponed': return <Badge variant="destructive" className={base}>{status}</Badge>;
          default: return <Badge variant="secondary" className={base}>{status}</Badge>;
        }
      };

      return (
        <>
          <Helmet>
            <title>Projects - Beyond Smart Tech ERP</title>
            <meta name="description" content="Track installation projects from start to delivery." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
                    <p className="text-muted-foreground">Manage and track the progress of all client projects.</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Excel
                </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Active Project Pipeline</CardTitle>
                <CardDescription>An overview of all ongoing and completed projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[200px]">Progress</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProjects.map((project) => (
                      <TableRow key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{project.id}</TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={project.progress} className="h-2" />
                                <span className="text-xs text-muted-foreground">{project.progress}%</span>
                            </div>
                        </TableCell>
                        <TableCell>{project.team}</TableCell>
                        <TableCell>{project.deliveryDate || 'N/A'}</TableCell>
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

    export default Projects;