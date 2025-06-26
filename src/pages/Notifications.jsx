import React from 'react';
    import { Helmet } from 'react-helmet';
    import { Link } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { useNotifications } from '@/contexts/NotificationContext';
    import { formatDistanceToNow } from 'date-fns';
    import { cn } from '@/lib/utils';
    import { CheckCheck } from 'lucide-react';

    const Notifications = () => {
        const { notifications, markAsRead, markAllAsRead } = useNotifications();

        return (
            <>
                <Helmet>
                    <title>Notifications - Beyond Smart Tech ERP</title>
                </Helmet>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground">Recent updates and alerts from the system.</p>
                        </div>
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4"/> Mark all as read
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Notifications</CardTitle>
                            <CardDescription>Click a notification to mark it as read and navigate to the relevant page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <Link to={n.link} key={n.id} onClick={() => markAsRead(n.id)}>
                                        <div className={cn(
                                            "block p-4 rounded-lg border transition-colors",
                                            n.read ? "bg-card text-muted-foreground" : "bg-primary/10 border-primary/40 hover:bg-primary/20"
                                        )}>
                                            <p className="font-semibold">{n.message}</p>
                                            <p className="text-xs mt-1">{formatDistanceToNow(new Date(n.date), { addSuffix: true })}</p>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">You have no new notifications.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    };

    export default Notifications;