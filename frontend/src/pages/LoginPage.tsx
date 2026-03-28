import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Home, ArrowRight } from 'lucide-react';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, dismissToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      const data = await loginUser(form);
      login(data.token, data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      const destination = data.user.role === 'admin' ? '/admin' : from;
      setTimeout(() => navigate(destination, { replace: true }), 600);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || 'Login failed. Please try again.';
        addToast(msg, 'error');
        if (err.response?.data?.errors) {
          const mapped: Record<string, string> = {};
          err.response.data.errors.forEach((e: { path: string; msg: string }) => {
            mapped[e.path] = e.msg;
          });
          setErrors(mapped);
        }
      } else {
        addToast('Something went wrong.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200')" }}
        />
        <div className="absolute inset-0 bg-stone-950/60" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Home size={16} className="text-stone-950" />
            </div>
            <span className="font-display text-white text-xl font-semibold">
              Estate<span className="text-amber-400">Portal</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-white text-4xl leading-tight mb-4">
            Find the home<br /><em>you deserve.</em>
          </h2>
          <p className="font-body text-stone-300 text-sm leading-relaxed">
            Browse curated properties and save your favourites to your personal dashboard.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
              <Home size={14} className="text-stone-950" />
            </div>
            <span className="font-display text-white text-lg font-semibold">
              Estate<span className="text-amber-400">Portal</span>
            </span>
          </Link>

          <h1 className="font-display text-white text-3xl mb-1">Welcome back</h1>
          <p className="font-body text-stone-400 text-sm mb-8">Sign in to your buyer account.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block font-body text-stone-300 text-sm mb-2">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg font-body text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-stone-700'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-red-400 text-xs font-body">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-stone-300 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 bg-stone-800 border rounded-lg font-body text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    errors.password ? 'border-red-500' : 'border-stone-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-400 text-xs font-body">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-body font-semibold text-sm rounded-lg transition-colors mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-stone-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default LoginPage;
