
import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Edit } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth } from '@/contexts/AuthContext';
    import { initialEmployees, initialEmployeeFinancials } from '@/lib/data';
    import { useNavigate } from 'react-router-dom';
    import { Badge } from '@/components/ui/badge';
    import { cn } from '@/lib/utils';

    const Finance = () => {
      const navigate = useNavigate();
      const [employees] = useLocalStorage('employees', initialEmployees);
      const [financials] = useLocalStorage('employeeFinancials', initialEmployeeFinancials);

      const getEmployeeFinancials = (employeeId) => {
        return financials.find(f => f.employeeId === employeeId) || { balance: 0, history: [] };
      };
      
      const openCustodyPage = (userId) => {
        navigate('/custody', { state: { selectedUserId: userId } });
      };

      return (
        <>
          <Helmet>
            <title>Finance - Beyond Smart Tech ERP</title>
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
                <p className="text-muted-foreground">Track employee advances, dues, and invoices.</p>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Employee Financials</CardTitle>
                <CardDescription>Overview of employee account balances.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Current Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const empFinancials = getEmployeeFinancials(emp.id);
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>{emp.fullName}</TableCell>
                          <TableCell>
                            <Badge variant={empFinancials.balance < 0 ? 'destructive' : 'default'} className={cn(empFinancials.balance >= 0 && "bg-green-600")}>
                                ${empFinancials.balance.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openCustodyPage(emp.userId)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      );
    };

    export default Finance;
