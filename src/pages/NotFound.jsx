
    import React from 'react';
    import { Helmet } from 'react-helmet';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';

    const NotFound = () => {
      return (
        <>
          <Helmet>
            <title>404 Not Found - Beyond Smart Tech ERP</title>
          </Helmet>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-9xl font-extrabold text-primary tracking-wider">404</h1>
            <p className="text-2xl md:text-3xl font-light text-muted-foreground mt-4">Page Not Found</p>
            <p className="mt-2 mb-8 text-muted-foreground">Sorry, the page you are looking for does not exist.</p>
            <Button asChild>
              <Link to="/">Go back to Dashboard</Link>
            </Button>
          </div>
        </>
      );
    };

    export default NotFound;
  