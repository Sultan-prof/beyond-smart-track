import React from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Download } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { mockQuotations, mockProjects, mockInventory } from '@/lib/data';

    const Reports = () => {
      const { toast } = useToast();
      const showToast = () => {
        toast({
          title: "🚧 Export not ready!",
          description: "This feature is coming soon. Stay tuned! 🚀",
        });
      };

      return (
        <>
          <Helmet>
            <title>Reports - Beyond Smart Tech ERP</title>
            <meta name="description" content="Generate and export reports for your business." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Generate and export data for sales, projects, and inventory.</p>
              </div>
              <Button onClick={showToast}>
                <Download className="mr-2 h-4 w-4" /> Export All
              </Button>
            </div>
            
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="inventory">Inventory Usage</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Reports</CardTitle>
                    <CardDescription>Export sales data based on quotations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Client</TableHead><TableHead>City</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                      <TableBody>{mockQuotations.map(q => <TableRow key={q.id}><TableCell>{q.id}</TableCell><TableCell>{q.clientName}</TableCell><TableCell>{q.city}</TableCell><TableCell>{q.date}</TableCell><TableCell>{q.status}</TableCell><TableCell className="text-right">${q.total.toFixed(2)}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="projects">
                <Card>
                  <CardHeader><CardTitle>Project Reports</CardTitle><CardDescription>Export project progress and details.</CardDescription></CardHeader>
                  <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Team</TableHead></TableRow></TableHeader>
                        <TableBody>{mockProjects.map(p => <TableRow key={p.id}><TableCell>{p.id}</TableCell><TableCell>{p.clientName}</TableCell><TableCell>{p.status}</TableCell><TableCell>{p.progress}%</TableCell><TableCell>{p.team}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="inventory">
                <Card>
                  <CardHeader><CardTitle>Inventory Reports</CardTitle><CardDescription>Export inventory stock and usage data.</CardDescription></CardHeader>
                  <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Stock</TableHead></TableRow></TableHeader>
                        <TableBody>{mockInventory.map(i => <TableRow key={i.id}><TableCell>{i.id}</TableCell><TableCell>{i.name}</TableCell><TableCell>{i.type}</TableCell><TableCell>{i.stock} {i.unit}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="maintenance">
                <Card>
                  <CardHeader><CardTitle>Maintenance Reports</CardTitle><CardDescription>This report is not yet available.</CardDescription></CardHeader>
                  <CardContent><p className="text-muted-foreground text-center p-8">Maintenance reporting will be available in a future update.</p></CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      );
    };

    export default Reports;