'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Step 1: Sign Up
        const signUpResult = await signUp(email, password, { email });
        
        if (signUpResult.error) {
          // Handle specific password validation errors
          const errorMessage = signUpResult.error.message.toLowerCase();
          if (errorMessage.includes('password')) {
            toast({
              title: 'Invalid password',
              description: 'Password must be at least 6 characters long.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error creating account',
              description: signUpResult.error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        // Step 2: Automatic Sign In after successful Sign Up
        try {
          await signIn(email, password);
          toast({
            title: 'Success',
            description: 'Account created and signed in successfully.',
          });
          // Step 3: Redirect to admin
          router.push('/admin');
        } catch (signInError) {
          // If automatic sign in fails, show error and reset form
          toast({
            title: 'Error signing in',
            description: 'Account created but automatic sign in failed. Please try signing in manually.',
            variant: 'destructive',
          });
          setIsSignUp(false);
          setPassword(''); // Clear password for manual sign in
        }
      } else {
        // Handle regular Sign In
        await signIn(email, password);
        toast({
          title: 'Success',
          description: 'Signed in successfully.',
        });
        router.push('/admin/gestion-personas');
      }
    } catch (error) {
      // Handle any unexpected errors
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create a new account to access the admin area'
              : 'Enter your credentials to access the admin area'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create account' : 'Sign in')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 