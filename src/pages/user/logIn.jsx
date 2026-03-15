import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import toast from "react-hot-toast";

export default function LogInPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Make sure this defaults effectively or env is loaded
      const API = `${BASE_URL}/user/logIn`; // Match the routes configuration
      
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.success("Logged in successfully!");
        // Store the token (e.g., in localStorage or cookies)
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        toast.error(`Error: ${data.error || data.message || "Incorrect email or password."}`);
      }
    } catch (err) {
      console.error("Log in error:", err);
      toast.error("An error occurred during log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
            <div className="text-sm text-center text-muted-foreground w-full">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/')}>
                Sign up
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
