import React, { useState, useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Download } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { DatePicker } from '@/components/DatePicker';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProjects, initialInventory, initialProductTypes, initialDailyVisits, initialUsers, initialMaintenanceTickets } from '@/lib/data';
    import { exportToPDF, exportToExcel } from '@/lib/export';
    import { subDays, startOfMonth, endOfMonth } from 'date-fns';

    const Reports = () => {
      const { toast } = useToast();
      const [projects] = useLocalStorage('projects', initialProjects);
      const [inventory] = useLocalStorage('inventory', initialInventory);
      const [productTypes] = useLocalStorage('productTypes', initialProductTypes);
      const [dailyVisits] = useLocalStorage('dailyVisits', initialDailyVisits);
      const [maintenanceTickets] = useLocalStorage('maintenance', initialMaintenanceTickets);
      const [users] = useLocalStorage('users', initialUsers);
      
      const [activeTab, setActiveTab] = useState('projects');
      const [dateRange, setDateRange] = useState({ from: startOfMonth(new Date()), to: new Date() });
      const [timePeriod, setTimePeriod] = useState('this_month');

      const handleTimePeriodChange = (value) => {
        setTimePeriod(value);
        const now = new Date();
        if (value === 'last_7_days') {
            setDateRange({ from: subDays(now, 7), to: now });
        } else if (value === 'last_30_days') {
            setDateRange({ from: subDays(now, 30), to: now });
        } else if (value === 'this_month') {
            setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        }
      };
      
      const dailyVisitsWithRepNames = useMemo(() => {
        return dailyVisits.map(visit => {
            const rep = users.find(u => u.id === visit.ownerId);
            return { ...visit, repName: rep ? rep.name : 'Unknown' };
        });
      }, [dailyVisits, users]);
      
      const inDateRange = (date) => {
          const itemDate = new Date(date);
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
      }
      
      const reportDataConfig = useMemo(() => ({
        projects: {
            data: projects.filter(p => inDateRange(p.date)),
            columns: [
                { header: 'ID', accessor: d => d.id }, { header: 'Client', accessor: d => d.clientName },
                { header: 'Status', accessor: d => d.status }, { header: 'Progress', accessor: d => `${d.progress}%` },
                { header: 'Team', accessor: d => d.team || 'N/A' }, { header: 'Date', accessor: d => new Date(d.date).toLocaleDateString() }
            ],
            title: 'Projects Report'
        },
        warehouse: {
            data: inventory.map(i => ({...i, ...productTypes.find(p => p.id === i.productId)})),
            columns: [
                { header: 'Name', accessor: d => d.name }, { header: 'Type', accessor: d => d.type },
                { header: 'Unit', accessor: d => d.unit }, { header: 'Stock', accessor: d => d.stock }
            ],
            title: 'Warehouse Report'
        },
        daily_visits: {
            data: dailyVisitsWithRepNames.filter(v => inDateRange(v.visitDate)),
            columns: [
                { header: 'Added By', accessor: d => d.repName }, { header: 'Client', accessor: d => d.clientName },
                { header: 'Company', accessor: d => d.companyName }, { header: 'Date', accessor: d => new Date(d.visitDate).toLocaleDateString() }, { header: 'Notes', accessor: d => d.notes }
            ],
            title: 'Daily Visits Report'
        },
        maintenance: {
            data: maintenanceTickets.filter(t => inDateRange(t.date)),
            columns: [
                { header: 'Ticket ID', accessor: d => d.id }, { header: 'Client', accessor: d => d.clientName },
                { header: 'Issue', accessor: d => d.issue }, { header: 'Status', accessor: d => d.status },
                { header: 'Date', accessor: d => new Date(d.date).toLocaleDateString() }
            ],
            title: 'Maintenance Report'
        }
      }), [projects, inventory, productTypes, dailyVisitsWithRepNames, maintenanceTickets, dateRange]);

      const handleExport = (format) => {
        const { data, columns, title } = reportDataConfig[activeTab];
        const fileName = `${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}`;
        if (format === 'pdf') {
            exportToPDF(columns, data, title, fileName);
        } else {
            exportToExcel({ data, columns, fileName });
        }
        toast({ title: `Exporting ${title} to ${format.toUpperCase()}` });
      };
      
      const { data: currentData, columns: currentColumns } = reportDataConfig[activeTab] || { data: [], columns: [] };

      return (
        <>
          <Helmet>
            <title>Reports - Beyond Smart Tech ERP</title>
            <meta name="description" content="Generate and export reports for your business." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Generate and export data for your business operations.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                    <Download className="mr-2 h-4 w-4" /> Export Excel
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="projects" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
                <TabsTrigger value="daily_visits">Daily Visits</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              <Card className="mt-4">
                  <CardHeader>
                      <CardTitle>Filters</CardTitle>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                              <SelectTrigger><SelectValue placeholder="Select time period" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                  <SelectItem value="this_month">This Month</SelectItem>
                                  <SelectItem value="custom">Custom Range</SelectItem>
                              </SelectContent>
                          </Select>
                          {timePeriod === 'custom' && (
                              <>
                                  <DatePicker date={dateRange.from} setDate={(date) => setDateRange(prev => ({...prev, from: date}))} />
                                  <DatePicker date={dateRange.to} setDate={(date) => setDateRange(prev => ({...prev, to: date}))} />
                              </>
                          )}
                      </div>
                  </CardHeader>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{reportDataConfig[activeTab]?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>{currentColumns.map(c => <TableHead key={c.header}>{c.header}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                            {currentData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {currentColumns.map(col => <TableCell key={col.header}>{col.accessor(row)}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </>
      );
    };

    export default Reports;