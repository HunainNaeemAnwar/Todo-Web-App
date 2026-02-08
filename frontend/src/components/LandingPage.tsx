'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
} from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden bg-[oklch(0.10_0.01_260)] selection:bg-accent-primary/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent-secondary/5 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="p-2 glass">
              <Sparkles className="h-5 w-5 text-accent-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-[oklch(0.92_0.01_260)]">
              TaskFlow
            </h1>
          </div>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left p-4 md:p-8">
            <h1 className="text-5xl font-display font-bold text-[oklch(0.92_0.01_260)] mb-6">
              <span className="text-gradient">AI-Powered</span>
              <br />
              Task Management
            </h1>
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Manage tasks naturally through conversation with your AI assistant.
            </p>
            <button
              onClick={() => setIsSignUp(true)}
              className="px-8 py-3 glass glass-interactive border-accent-primary/30 text-[oklch(0.92_0.01_260)] font-medium inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <div className="glass-elevated p-10 md:p-8 border-accent-primary/10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-display font-bold text-[oklch(0.92_0.01_260)] mb-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>

                {isSignUp && (
                  <div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`${getInputClassName('name')} py-3 px-4 text-neutral-500`}
                      placeholder="Name"
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
                    className={`${getInputClassName('email')} py-3 px-4 text-neutral-500`}
                    placeholder="Email"
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
                    className={`${getInputClassName('password')} py-3 px-4 text-neutral-500`}
                    placeholder="Password"
                  />
                  {isSignUp && password && (
                    <div className="mt-2">
                      <div className="h-1 glass rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-status-error' :
                            passwordStrength.score <= 3 ? 'bg-status-warning' : 'bg-status-success'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="glass border-status-error/30 p-3">
                    <p className="text-sm text-status-error">{error.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 glass glass-interactive border-accent-primary/30 hover:border-accent-primary/60 disabled:opacity-50 font-medium text-[oklch(0.92_0.01_260)]"
                >
                  {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-center text-sm text-text-secondary hover:text-accent-primary transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-display font-bold text-[oklch(0.92_0.01_260)] mb-8 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-display font-bold text-[oklch(0.92_0.01_260)] mb-2">
                AI Assistant
              </h3>
              <p className="text-text-secondary text-sm">
                Create and manage tasks through natural conversation.
              </p>
            </div>
            <div className="glass-panel p-6">
              <h3 className="text-lg font-display font-bold text-[oklch(0.92_0.01_260)] mb-2">
                Analytics
              </h3>
              <p className="text-text-secondary text-sm">
                Track productivity with detailed charts and reports.
              </p>
            </div>
            <div className="glass-panel p-6">
              <h3 className="text-lg font-display font-bold text-[oklch(0.92_0.01_260)] mb-2">
                Calendar
              </h3>
              <p className="text-text-secondary text-sm">
                View tasks by day, week, or month with ease.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
