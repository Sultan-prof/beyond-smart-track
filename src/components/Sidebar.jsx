
import React from 'react';
    import { NavLink } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';
    import { navLinks } from '@/lib/data';
    import { Building2 } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';

    const Sidebar = () => {
      const { user } = useAuth();

      const filteredNavLinks = navLinks.filter(link => {
        if (!link.roles || user.role === 'Admin') {
          return true;
        }
        return link.roles.includes(user.role);
      });

      return (
        <aside className="hidden md:flex flex-col w-64 bg-card h-full border-r">
          <div className="p-6 flex items-center justify-center space-x-3">
            <Building2 className="h-9 w-9 text-primary" />
            <span className="font-bold text-xl tracking-tight">Beyond Smart Glass</span>
          </div>
          <nav className="flex-1 px-4 py-2">
            <ul className="space-y-1">
              {filteredNavLinks.map(link => (
                <li key={link.label}>
                  <NavLink to={link.href}>
                    {({ isActive }) => (
                      <motion.div
                        className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:text-primary font-medium', isActive && 'text-primary')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                        {isActive && <motion.div className="ml-auto h-2 w-2 rounded-full bg-primary" layoutId="active-indicator" />}
                      </motion.div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      );
    };

    export default Sidebar;
