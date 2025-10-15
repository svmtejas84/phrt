import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Backend login API
const loginApi = async (email: string, password: string) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }
  return await res.json();
};

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: { [k: string]: string } = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setPending(true);
    try {
      const data = await loginApi(formData.email, formData.password);
      // Store JWT and role in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('email', formData.email);
      // Redirect by role
      const isOnecare = formData.email.toLowerCase().endsWith('@onecare.email');
      if (data.role === 'institution' || isOnecare) {
        navigate('/institution');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Login failed' });
    } finally { setPending(false); }
  };

  return (
    <main className="min-h-dvh">
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="w-full max-w-md">
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-balance bg-gradient-to-r from-[#5170ff] to-[#ff66c4] bg-clip-text text-transparent">Welcome back!</h1>
                <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {errors.general && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{errors.general}</div>}
                <div className="space-y-2">
                  <Label htmlFor="email" className="bg-gradient-to-r from-[#5170ff] to-[#ff66c4] bg-clip-text text-transparent">Email address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} className={errors.email ? 'border-red-500' : ''} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="#" className="text-xs font-medium text-primary hover:underline">forgot password</Link>
                  </div>
                  <Input id="password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))} className={errors.password ? 'border-red-500' : ''} />
                  {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={formData.remember} onCheckedChange={(c) => setFormData(f => ({ ...f, remember: !!c }))} />
                  <Label htmlFor="remember" className="text-xs bg-gradient-to-r from-[#5170ff] to-[#ff66c4] bg-clip-text text-transparent">Remember for 30 days</Label>
                </div>
                <Button type="submit" size="lg" disabled={pending} className={cn('w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#5170ff] to-[#ff66c4] hover:opacity-95', pending && 'opacity-50 cursor-not-allowed')}>
                  {pending ? 'Signing in...' : 'Sign In'}
                </Button>
                {/* Social sign-in removed as requested */}
                <p className="text-center text-sm text-muted-foreground">{"Don't have an account? "}<Link to="/signup" className="font-medium text-primary hover:underline">Sign Up</Link></p>
              </form>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative h-[440px] lg:h-[560px] w-full rounded-xl overflow-hidden border border-border">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={`${import.meta.env.BASE_URL}signin.mp4`}
                autoPlay
                loop
                muted
                playsInline
                aria-label="Sign in animation"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
