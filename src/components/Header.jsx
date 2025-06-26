import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Bell, Search, User, LogOut, Moon, Sun, PlusCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';
    import { useToast } from "@/components/ui/use-toast";
    import { useAuth } from '@/contexts/AuthContext';
    import { useNotifications } from '@/contexts/NotificationContext';

    const Header = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { user, logout } = useAuth();
      const { notifications, markAsRead } = useNotifications();
      const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

      const unreadCount = notifications.filter(n => !n.read).length;

      const handleThemeToggle = () => {
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        document.documentElement.classList.toggle('dark', newIsDarkMode);
        toast({
            title: "Theme Changed!",
            description: `Switched to ${newIsDarkMode ? 'Dark' : 'Light'} Mode.`,
        });
      };
      
      const showToast = () => {
        toast({
            title: "🚧 Feature in progress!",
            description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        });
      };

      const handleLogout = () => {
        logout();
        navigate('/login');
      };

      return (
        <header className="flex items-center justify-between h-16 px-6 bg-card border-b shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-64 lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search projects, clients..." className="pl-12 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button asChild>
              <Link to="/quotations/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Quote
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />}
                <span className="sr-only">Notifications</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <img  alt="Admin User Avatar" src="https://images.unsplash.com/photo-1642888621621-ff7d83f3fdcf" />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={showToast}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      );
    };

    export default Header;