'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { ThemeToggleButton } from './common/ThemeToggleButton';
import {
  getPasswordStrength,
  validateSignup,
  validateSignin,
} from '../utils/validation';



interface LandingPageProps {
  initialShowLogin?: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

export function LandingPage({ initialShowLogin = false }: LandingPageProps) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialShowLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FieldError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (initialShowLogin) {
      setIsSignUp(false);
    }
  }, [initialShowLogin]);

  useEffect(() => {
    if (isSignUp) {
      setPasswordStrength(getPasswordStrength(password));
    }
  }, [password, isSignUp]);

  useEffect(() => {
    setError(null);
    setFieldErrors({});
  }, [isSignUp]);

  useEffect(() => {
    if (isSignUp && email && password) {
      const signupValidation = validateSignup(name, email, password);
      setFieldErrors(signupValidation.errors);
    } else if (!isSignUp && email && password) {
      const signinValidation = validateSignin(email, password);
      setFieldErrors(signinValidation.errors);
    }
  }, [email, password, name, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      let result;
      if (isSignUp) {
        const validation = validateSignup(name, email, password);
        if (!validation.isValid) {
          setFieldErrors(validation.errors);
          setLoading(false);
          return;
        }
        result = await signUp(email, password, name);
      } else {
        const validation = validateSignin(email, password);
        if (!validation.isValid) {
          setFieldErrors(validation.errors);
          setLoading(false);
          return;
        }
        result = await signIn(email, password);
      }

      if (result.error) {
        setError({ field: 'general', message: result.error });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError({
        field: 'general',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = 'w-full glass-input';
    if (fieldErrors[fieldName]) {
      return `${baseClass} border-status-error/50`;
    }
    return `${baseClass}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background selection:bg-accent-primary/30 font-body">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-accent-primary/5 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-accent-secondary/5 rounded-full blur-[160px]" />
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="p-2.5 glass-panel group-hover:border-accent-primary/40 transition-colors">
              <Sparkles className="h-5 w-5 text-accent-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              TaskFlow<span className="text-accent-primary">.</span>
            </h1>
          </div>
            <div className="flex items-center gap-4">
              <ThemeToggleButton />
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold uppercase tracking-widest text-secondary hover:text-accent-primary transition-colors font-accent"
              >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
            </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full glass-panel mb-6 border-accent-primary/20">
              <span className="w-2 h-2 rounded-full bg-accent-primary mr-2 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary font-accent">Version 3.0 Ultra-Luxury</span>
            </div>
            <h1 className="text-6xl font-display font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
              <span className="text-luxury-gradient">AI-Powered</span>
              <br />
              Task Management
            </h1>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-lg">
              Manage tasks naturally through conversation with your AI assistant. Experience the next generation of productivity.
            </p>
            <button
              onClick={() => setIsSignUp(true)}
              className="glass-btn glass-btn-primary px-10 py-4 text-base font-accent"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <div className="glass-panel p-10 md:p-12 border-white/5 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm text-secondary">Enter your credentials to continue</p>
                </div>

                {isSignUp && (
                  <div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`${getInputClassName('name')} font-accent text-sm`}
                      placeholder="Full Name"
                    />
                  </div>
                )}

                <div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`${getInputClassName('email')} font-accent text-sm`}
                    placeholder="Email Address"
                  />
                </div>

                <div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${getInputClassName('password')} font-accent text-sm`}
                    placeholder="Password"
                  />
                  {isSignUp && password && (
                    <div className="mt-3">
                      <div className="h-1 glass bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            passwordStrength.score <= 2 ? 'bg-status-error' :
                            passwordStrength.score <= 3 ? 'bg-status-warning' : 'bg-status-success'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-secondary font-accent">Strength: {passwordStrength.label}</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="glass-panel border-status-error/20 bg-status-error/5 p-4 rounded-xl">
                    <p className="text-xs font-bold text-status-error uppercase tracking-widest font-accent">{error.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full glass-btn glass-btn-primary py-4 font-accent text-sm uppercase tracking-widest mt-4"
                >
                  {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-secondary hover:text-accent-primary transition-colors font-accent py-2"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Premium Features
            </h2>
            <div className="h-1 w-12 bg-accent-primary rounded-full blur-[1px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 group hover:border-accent-primary/30 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                AI Assistant
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                Create and manage tasks through natural conversation. Our AI understands context and priority.
              </p>
            </div>
            <div className="glass-panel p-8 group hover:border-accent-primary/30 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Analytics
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                Track productivity with detailed charts and reports. Gain insights into your daily workflow.
              </p>
            </div>
            <div className="glass-panel p-8 group hover:border-accent-primary/30 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                Calendar
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                Visualise your schedule with ease. Seamlessly transition between day, week, and month views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
