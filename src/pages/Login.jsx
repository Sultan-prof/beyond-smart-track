import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
const Login = () => {
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState('admin@bst.com');
  const [password, setPassword] = useState('password');
  const handleLogin = e => {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      navigate('/');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password."
      });
    }
  };
  return <>
          <Helmet>
            <title>Login - Beyond Smart Tech ERP</title>
          </Helmet>
          <div className="flex items-center justify-center min-h-screen bg-background p-4">
             <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5,
        ease: "easeInOut"
      }}>
                <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
                  <CardHeader className="text-center p-8">
                     <motion.div className="flex items-center justify-center space-x-3 mb-6" initial={{
              y: -20,
              opacity: 0
            }} animate={{
              y: 0,
              opacity: 1
            }} transition={{
              delay: 0.2,
              type: "spring"
            }}>
                        <Building2 className="h-12 w-12 text-primary" />
                        <span className="font-bold text-3xl tracking-tight">Beyond Smart Glass</span>
                     </motion.div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="admin@bst.com" value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full !mt-8" size="lg">
                        Log In
                      </Button>
                    </form>
                  </CardContent>
                </Card>
             </motion.div>
          </div>
        </>;
};
export default Login;