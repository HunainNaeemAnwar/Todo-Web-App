'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Bot,
  Shield,
  Zap,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { ThemeToggle } from './theme/ThemeProvider';
import {
  validateEmail,
  validatePassword,
  validateName,
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

  // Real-time password strength
  useEffect(() => {
    if (isSignUp) {
      setPasswordStrength(getPasswordStrength(password));
    }
  }, [password, isSignUp]);

  // Clear errors when switching modes
  useEffect(() => {
    setError(null);
    setFieldErrors({});
  }, [isSignUp]);

  // Real-time validation for signup
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
        // Final validation before submit
        const validation = validateSignup(name, email, password);
        if (!validation.isValid) {
          setFieldErrors(validation.errors);
          setLoading(false);
          return;
        }
        result = await signUp(email, password, name);
      } else {
        // Final validation before submit
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
    const baseClass =
      'w-full px-4 py-3 glass-effect focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200';
    if (fieldErrors[fieldName]) {
      return `${baseClass} border border-error/50 focus:ring-error`;
    }
    return baseClass;
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Playful background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              AI Todo
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-text-secondary hover:text-accent-primary font-medium transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-text-secondary hover:text-accent-primary font-medium transition-colors duration-200"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-text-secondary hover:text-accent-primary font-medium transition-colors duration-200"
            >
              Testimonials
            </a>
            <ThemeToggle />
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isSignUp ? 'Sign In' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 glass-effect text-accent-primary font-medium text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Productivity
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Conversational
            </span>
            <br />
            <span className="text-text-primary">Task Management</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform how you manage tasks with AI-powered conversations. Simply
            talk to your AI assistant and watch your productivity soar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button className="inline-flex items-center px-8 py-4 glass-effect text-text-primary font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Bot className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="glass-effect border border-border rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-text-secondary mt-2">
                Join thousands of productive users today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={getInputClassName('name')}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-error">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={getInputClassName('email')}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-error">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Password
                  {isSignUp && (
                    <span className="text-xs text-text-secondary ml-1">
                      (min 8 characters)
                    </span>
                  )}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={getInputClassName('password')}
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                {isSignUp && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score <= 2
                              ? 'bg-red-500'
                              : passwordStrength.score <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${passwordStrength.color || 'text-text-secondary'}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-sm text-error">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-error/20 border border-error/30 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center mt-0.5">
                      <span className="text-error text-xs">!</span>
                    </div>
                    <div>
                      <p className="text-sm text-error">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Let's Go ${isSignUp ? '→' : ''}`
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-accent-primary hover:text-accent-secondary font-medium transition-colors duration-200"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Sign up'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Everything you need to boost your productivity with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-effect border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl text-white inline-block mb-6">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                AI-Powered Assistant
              </h3>
              <p className="text-text-secondary">
                Natural language processing that understands your requests and
                manages tasks accordingly.
              </p>
            </div>

            <div className="glass-effect border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-gradient-to-r from-error to-error/80 rounded-2xl text-white inline-block mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                Smart Automation
              </h3>
              <p className="text-text-secondary">
                Automatically categorizes, prioritizes, and schedules tasks
                based on context and urgency.
              </p>
            </div>

            <div className="glass-effect border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-gradient-to-r from-success to-success/80 rounded-2xl text-white inline-block mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                Secure & Private
              </h3>
              <p className="text-text-secondary">
                End-to-end encryption with user isolation and secure
                authentication protocols.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Three simple steps to transform your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                Connect
              </h3>
              <p className="text-text-secondary">
                Sign up and connect your AI assistant to start managing tasks
                through conversation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-error to-error/80 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                Converse
              </h3>
              <p className="text-text-secondary">
                Talk naturally to your AI assistant about tasks, deadlines, and
                priorities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-3">
                Achieve
              </h3>
              <p className="text-text-secondary">
                Watch your productivity soar as AI manages and optimizes your
                tasks.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-center">
          <div className="glass-effect border border-border rounded-3xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-text-primary mb-4">
              Trusted by thousands of users worldwide
            </h3>
            <p className="text-text-secondary mb-6">
              Join our community of productive individuals transforming their
              workflow
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-primary">
                  50K+
                </div>
                <div className="text-text-secondary">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-error">98%</div>
                <div className="text-text-secondary">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">10M+</div>
                <div className="text-text-secondary">Tasks Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="border-t border-border pt-8">
            <div className="flex justify-center space-x-6 mb-6">
              <a
                href="#"
                className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
            <p className="text-text-secondary">
              © 2026 AI Todo. All rights reserved. Built with ❤️ for
              productivity.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
