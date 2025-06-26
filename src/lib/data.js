import {
      FileText,
      BarChart3,
      HardHat,
      Warehouse,
      Settings,
      LayoutDashboard,
      Wrench,
      Users,
      Briefcase,
      Landmark,
      Wallet,
      Bell
    } from 'lucide-react';

    export const navLinks = [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ['Admin', 'Sales', 'Installation Team', 'HR', 'Finance', 'Warehouse'] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ['Admin', 'Sales', 'Installation Team', 'HR', 'Finance', 'Warehouse'] },
      { href: "/quotations", label: "Quotations", icon: FileText, roles: ['Admin', 'Sales'] },
      { href: "/projects", label: "Projects", icon: HardHat, roles: ['Admin', 'Sales', 'Installation Team', 'Warehouse'] },
      { href: "/warehouse", label: "Warehouse", icon: Warehouse, roles: ['Admin', 'Installation Team', 'Warehouse'] },
      { href: "/daily-visits", label: "Daily Visits", icon: Users, roles: ['Admin', 'Sales'] },
      { href: "/maintenance", label: "Maintenance", icon: Wrench, roles: ['Admin', 'Sales', 'Installation Team', 'Warehouse'] },
      { href: "/hr", label: "HR", icon: Briefcase, roles: ['Admin', 'HR', 'Finance'] },
      { href: "/finance", label: "Finance", icon: Landmark, roles: ['Admin', 'Finance', 'HR'] },
      { href: "/custody", label: "My Custody", icon: Wallet, roles: ['Admin', 'Sales', 'Installation Team', 'HR', 'Finance', 'Warehouse'] },
      { href: "/reports", label: "Reports", icon: BarChart3, roles: ['Admin'] },
      { href: "/admin", label: "Admin", icon: Settings, roles: ['Admin'] },
    ];
    
    export const initialUsers = [
        { id: 'user-1', name: 'Admin User', email: 'admin@bst.com', password: 'password', role: 'Admin' },
        { id: 'user-2', name: 'Visit Agent', email: 'sales@bst.com', password: 'password', role: 'Sales' },
        { id: 'user-3', name: 'Installation Team A', email: 'team.a@bst.com', password: 'password', role: 'Installation Team' },
        { id: 'user-4', name: 'HR Manager', email: 'hr@bst.com', password: 'password', role: 'HR' },
        { id: 'user-5', name: 'Finance Officer', email: 'finance@bst.com', password: 'password', role: 'Finance' },
        { id: 'user-6', name: 'Warehouse Manager', email: 'warehouse@bst.com', password: 'password', role: 'Warehouse' },
        { id: 'user-7', name: 'Installation Team B', email: 'team.b@bst.com', password: 'password', role: 'Installation Team' },
    ];

    export const initialEmployees = [
        { id: 'emp-1', userId: 'user-2', fullName: 'Visit Agent', dob: '1990-05-15', nationality: 'Saudi Arabian', salary: 12000, allowances: 1500, assets: 'Laptop, Mobile Phone' },
        { id: 'emp-2', userId: 'user-3', fullName: 'Installation Team A Lead', dob: '1988-11-20', nationality: 'Egyptian', salary: 8000, allowances: 500, assets: 'Toolbox' },
        { id: 'emp-3', userId: 'user-6', fullName: 'Warehouse Manager', dob: '1992-03-10', nationality: 'Saudi Arabian', salary: 9500, allowances: 700, assets: 'Desktop PC' },
        { id: 'emp-4', userId: 'user-7', fullName: 'Installation Team B Lead', dob: '1991-07-22', nationality: 'Pakistani', salary: 8200, allowances: 550, assets: 'Toolbox' },
    ];
    
    export const initialEmployeeFinancials = [
      { employeeId: 'emp-1', userId: 'user-2', balance: 500, history: [{ date: '2025-05-01', amount: 500, type: 'credit', notes: 'Sales commission' }] },
      { employeeId: 'emp-2', userId: 'user-3', balance: -250, history: [{ date: '2025-06-10', amount: -250, type: 'debit', notes: 'Advance salary' }] },
      { employeeId: 'emp-3', userId: 'user-6', balance: 0, history: [] },
      { employeeId: 'emp-4', userId: 'user-7', balance: 0, history: [] },
    ];

    export const userRoles = ['Admin', 'Sales', 'Installation Team', 'HR', 'Finance', 'Warehouse'];

    export const initialProductTypes = [
      { id: "pt-1", name: "PDLC Smart Glass", type: "Material", unit: "sqm", warranty: 5 },
      { id: "pt-2", name: "Smart Film (Self-Adhesive)", type: "Material", unit: "sqm", warranty: 3 },
      { id: "pt-3", name: "Transformer 100VA", type: "Accessory", unit: "pcs", warranty: 2 },
      { id: "pt-4", name: "Remote Control", type: "Accessory", unit: "pcs", warranty: 1 },
      { id: "pt-5", name: "Solar Control Film", type: "Material", unit: "sqm", warranty: 10 },
    ];

    export const initialInventory = [
      { id: 'inv-1', productId: 'pt-1', stock: 150 },
      { id: 'inv-2', productId: 'pt-2', stock: 300 },
      { id: 'inv-3', productId: 'pt-3', stock: 12 },
      { id: 'inv-4', productId: 'pt-4', stock: 45 },
      { id: 'inv-5', productId: 'pt-5', stock: 80 },
    ];
    
    export const initialQuotations = [
      { id: 'QT-001', projectName: 'Office Partition', ownerId: 'user-2', clientName: 'Global Corp', clientInfo: { name: 'Global Corp', phone: '011-1234567', email: 'contact@global.com', city: 'Riyadh' }, status: 'Sent', total: 5400.00, date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), items: [{ id: 1, productId: 'pt-1', quantity: 5, width: 2, height: 2.7, price: 540 }], discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed' },
      { id: 'QT-002', projectName: 'Villa Windows', ownerId: 'user-2', clientName: 'Innovate LLC', clientInfo: { name: 'Innovate LLC', phone: '012-7654321', email: 'projects@innovate.com', city: 'Jeddah' }, status: 'Open', total: 12500.00, date: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(), items: [{ id: 1, productId: 'pt-2', quantity: 25, width: 1, height: 1, price: 480 }, { id: 2, productId: 'pt-3', quantity: 2, width: '', height: '', price: 250 }], discount: 500, discountType: 'fixed', tax: 0, taxType: 'fixed' },
    ];

    export const initialProjects = [
    ];

    export const initialMaintenanceTickets = [
        { id: "MNT-001", projectId: "PROJ-001", clientName: "Innovate LLC", issue: "Smart film not responding", status: "Open", date: "2025-06-18", warranty: "Active", history: [{status: "Open", date: "2025-06-18"}], ownerId: 'user-2'},
    ];
    
    export const initialDailyVisits = [
        { id: 'visit-1', ownerId: 'user-2', clientName: 'Potential Client A', companyName: 'A Corp', phone: '123456789', visitDate: new Date().toISOString(), notes: 'Discussed smart film options for their new office.' },
    ];
    
    export const initialNotifications = [
      { id: 'notif-1', userId: 'user-1', message: 'Welcome to the new ERP System!', date: new Date().toISOString(), read: true, link: '/' },
    ];

    export const projectStageFlow = ["Measurements", "Manufacturing", "Installation Start", "Final Installation", "Delivered"];

    export const projectStageProgress = {
      "Measurements": 20,
      "Manufacturing": 45,
      "Installation Start": 65,
      "Final Installation": 85,
      "Delivered": 100
    };
