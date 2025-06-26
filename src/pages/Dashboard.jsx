import React, { useMemo } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { DollarSign, FileText, CheckCircle, Package, PlusCircle, Wrench } from 'lucide-react';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
    import { useAuth } from '@/contexts/AuthContext';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialProjects, initialQuotations } from '@/lib/data';

    const Dashboard = () => {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [projects] = useLocalStorage('projects', initialProjects);
      const [quotations] = useLocalStorage('quotations', initialQuotations);

      const dashboardStats = useMemo(() => {
        const confirmedProjects = projects;
        const projectQuotations = quotations.filter(q => confirmedProjects.some(p => p.quotationId === q.id));

        const totalRevenue = projectQuotations.reduce((acc, q) => {
            const subtotal = q.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.price), 0);
            const discountAmount = q.discountType === 'percentage' ? subtotal * (q.discount / 100) : q.discount;
            return acc + (subtotal - discountAmount);
        }, 0);
        
        const activeProjects = confirmedProjects.filter(p => p.status !== 'Delivered' && p.status !== 'Postponed').length;
        
        const sentQuotationsCount = quotations.length;
        const conversionRate = sentQuotationsCount > 0 ? (confirmedProjects.length / sentQuotationsCount) * 100 : 0;

        return {
            totalRevenue,
            activeProjects,
            sentQuotationsCount,
            conversionRate,
            confirmedProjectsCount: confirmedProjects.length,
        };
      }, [projects, quotations]);
      
      const chartData = useMemo(() => {
        const monthlyData = {};
        quotations.forEach(q => {
            const month = new Date(q.date).toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { name: month, Sales: 0, Projects: 0 };
            }
            if(projects.some(p => p.quotationId === q.id)){
                const subtotal = q.items.reduce((itemAcc, item) => itemAcc + (item.quantity * item.price), 0);
                const discountAmount = q.discountType === 'percentage' ? subtotal * (q.discount / 100) : q.discount;
                monthlyData[month].Sales += subtotal - discountAmount;
            }
        });
        projects.forEach(p => {
             const month = new Date(p.date).toLocaleString('default', { month: 'short' });
             if(monthlyData[month]){
                 monthlyData[month].Projects += 1;
             }
        });
        return Object.values(monthlyData);
      }, [projects, quotations]);


      return (
        <>
          <Helmet>
            <title>Dashboard - Beyond Smart Tech ERP</title>
            <meta name="description" content="ERP System Dashboard for Beyond Smart Tech" />
          </Helmet>
          <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Good Morning, {user?.name}!</h1>
                <p className="text-muted-foreground">Here's a summary of your business activities.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Button asChild size="lg" className="w-full justify-start p-6">
                        <Link to="/quotations/new">
                            <PlusCircle className="mr-4 h-6 w-6" />
                            <div className="text-left">
                                <p className="font-semibold">New Quotation</p>
                                <p className="font-normal text-sm text-primary-foreground/80">Create a new quote for a client</p>
                            </div>
                        </Link>
                    </Button>
                    <Button size="lg" className="w-full justify-start p-6" variant="secondary" onClick={() => navigate('/maintenance', { state: { openDialog: true } })}>
                        <Wrench className="mr-4 h-6 w-6" />
                         <div className="text-left">
                            <p className="font-semibold">New Maintenance</p>
                            <p className="font-normal text-sm text-secondary-foreground/80">Log a new service request</p>
                        </div>
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardStats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {dashboardStats.confirmedProjectsCount} confirmed projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quotations Sent</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{dashboardStats.sentQuotationsCount}</div>
                  <p className="text-xs text-muted-foreground">Total quotations created</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{dashboardStats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">From all sent quotations</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}/>
                        <Bar dataKey="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>New Projects Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}/>
                        <Line type="monotone" dataKey="Projects" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
            </div>
          </div>
        </>
      );
    };

    export default Dashboard;