import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { PlusCircle, Edit, Trash2 } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth } from '@/contexts/AuthContext';
    import { initialEmployees } from '@/lib/data';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';

    const EmployeeDialog = ({ open, onOpenChange, onSave, employeeToEdit, users }) => {
      const [userId, setUserId] = useState('');
      const [dob, setDob] = useState('');
      const [nationality, setNationality] = useState('');
      const [salary, setSalary] = useState('');
      const [allowances, setAllowances] = useState('');
      const [assets, setAssets] = useState('');

      const isEditing = !!employeeToEdit;

      React.useEffect(() => {
        if (employeeToEdit) {
          setUserId(employeeToEdit.userId);
          setDob(employeeToEdit.dob);
          setNationality(employeeToEdit.nationality);
          setSalary(employeeToEdit.salary);
          setAllowances(employeeToEdit.allowances);
          setAssets(employeeToEdit.assets);
        } else {
          setUserId(''); setDob(''); setNationality(''); setSalary(''); setAllowances(''); setAssets('');
        }
      }, [employeeToEdit, open]);

      const handleSubmit = () => {
        const selectedUser = users.find(u => u.id === userId);
        const employeeData = {
          id: employeeToEdit?.id,
          userId,
          fullName: selectedUser?.name,
          dob, nationality, salary, allowances, assets
        };
        onSave(employeeData);
        onOpenChange(false);
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Employee Record' : 'Add Employee Record'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>User</Label>
                <p>{users.find(u => u.id === userId)?.name || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" value={nationality} onChange={e => setNationality(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input id="salary" type="number" value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances</Label>
                <Input id="allowances" type="number" value={allowances} onChange={e => setAllowances(e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="assets">Assets/Tools Received</Label>
                <Textarea id="assets" value={assets} onChange={e => setAssets(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Save Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const HR = () => {
      const { toast } = useToast();
      const { users, user } = useAuth();
      const [employees, setEmployees] = useLocalStorage('employees', initialEmployees);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [editingEmployee, setEditingEmployee] = useState(null);

      const canEdit = user.role === 'Admin' || user.role === 'HR';

      const handleSave = (employeeData) => {
        if (employeeData.id) {
          setEmployees(prev => prev.map(e => e.id === employeeData.id ? { ...e, ...employeeData } : e));
          toast({ title: "Employee record updated." });
        } else {
          // This should be handled differently, maybe by creating user first
          // For now, let's assume this dialog is for editing existing users' employee data
          toast({ title: "Adding new employee records not implemented." });
        }
        setEditingEmployee(null);
      };

      const openDialog = (employee) => {
        setEditingEmployee(employee);
        setIsDialogOpen(true);
      };

      return (
        <>
          <Helmet>
            <title>HR Management - Beyond Smart Tech ERP</title>
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
                <p className="text-muted-foreground">Manage employee records and information.</p>
              </div>
              {canEdit && (
                <Button onClick={() => toast({ title: "Please create a user in Admin first."})}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Employee Records</CardTitle>
                <CardDescription>All employee data. Access is restricted.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>D.O.B</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Assets</TableHead>
                      {canEdit && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.fullName}</TableCell>
                        <TableCell>{emp.dob}</TableCell>
                        <TableCell>{emp.nationality}</TableCell>
                        <TableCell>{emp.salary}</TableCell>
                        <TableCell className="max-w-xs truncate">{emp.assets}</TableCell>
                        {canEdit && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(emp)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <EmployeeDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleSave}
            employeeToEdit={editingEmployee}
            users={users}
          />
        </>
      );
    };

    export default HR;