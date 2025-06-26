import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Layout from '@/components/Layout.jsx';
    import Dashboard from '@/pages/Dashboard.jsx';
    import Quotations from '@/pages/Quotations.jsx';
    import QuotationCreate from '@/pages/QuotationCreate.jsx';
    import QuotationDetail from '@/pages/QuotationDetail.jsx';
    import Reports from '@/pages/Reports.jsx';
    import Projects from '@/pages/Projects.jsx';
    import ProjectDetail from '@/pages/ProjectDetail.jsx';
    import Warehouse from '@/pages/Warehouse.jsx';
    import Maintenance from '@/pages/Maintenance.jsx';
    import DailyVisits from '@/pages/DailyVisits.jsx';
    import Admin from '@/pages/Admin.jsx';
    import HR from '@/pages/HR.jsx';
    import Finance from '@/pages/Finance.jsx';
    import Custody from '@/pages/Custody.jsx';
    import Notifications from '@/pages/Notifications.jsx';
    import Login from '@/pages/Login.jsx';
    import NotFound from '@/pages/NotFound.jsx';
    import { Toaster } from "@/components/ui/toaster";
    import { useAuth } from '@/contexts/AuthContext';
    import { NotificationsProvider } from '@/contexts/NotificationContext';

    const PrivateRoute = ({ children, roles }) => {
        const { isAuthenticated, user } = useAuth();
        
        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }
        
        if (roles && !roles.includes(user.role)) {
            return <Navigate to="/" />;
        }

        return children;
    };

    function App() {
        return (
            <>
              <NotificationsProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="quotations" element={<Quotations />} />
                            <Route path="quotations/new" element={<QuotationCreate />} />
                            <Route path="quotations/:id" element={<QuotationDetail />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="projects/:id" element={<ProjectDetail />} />
                            <Route path="warehouse" element={<Warehouse />} />
                            <Route path="daily-visits" element={<DailyVisits />} />
                            <Route path="maintenance" element={<Maintenance />} />
                            <Route path="hr" element={<HR />} />
                            <Route path="finance" element={<Finance />} />
                            <Route path="custody" element={<Custody />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="admin" element={<Admin />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
                <Toaster />
              </NotificationsProvider>
            </>
        );
    }

    export default App;