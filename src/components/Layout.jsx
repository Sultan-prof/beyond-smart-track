import React from 'react';
    import { Outlet, useNavigate, useLocation } from 'react-router-dom';
    import { AnimatePresence, motion } from 'framer-motion';
    import Sidebar from '@/components/Sidebar';
    import Header from '@/components/Header';

    const Layout = () => {
      const navigate = useNavigate();
      const location = useLocation();

      const handleLogout = () => {
        localStorage.removeItem('erp-auth');
        navigate('/login');
      };

      return (
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onLogout={handleLogout} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
               <AnimatePresence mode="wait">
                 <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                 >
                    <Outlet />
                 </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      );
    };

    export default Layout;