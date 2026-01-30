/**
 * Registration form component with password validation.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';

interface PasswordValidation {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasSpecialChar: boolean;
  };
  message: string;
}

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChar: false,
    },
    message: ''
  });

  const router = useRouter();

  const validatePassword = (password: string): PasswordValidation => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };

    const isValid = minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;

    let message = '';
    if (!isValid) {
      const failedRequirements = [];
      if (!minLength) failedRequirements.push('at least 8 characters');
      if (!hasUpperCase) failedRequirements.push('uppercase letter');
      if (!hasLowerCase) failedRequirements.push('lowercase letter');
      if (!hasNumbers) failedRequirements.push('number');
      if (!hasSpecialChar) failedRequirements.push('special character');

      message = `Password must contain ${failedRequirements.join(', ')}`;
    } else {
      message = 'Password is valid';
    }

    return {
      isValid,
      requirements,
      message
    };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setValidation(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setLoading(true);

    const { user, error: signUpError } = await signUp(email, password, name);

    if (signUpError) {
      const err = signUpError as { detail?: string; message?: string };
      setError(err.detail || err.message || 'Registration failed');
    } else if (user) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Registration successful! Redirecting to dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a strong password"
          />

          {password && (
            <div className="mt-2 text-xs">
              <div className={`flex items-center ${validation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{validation.requirements.minLength ? '✓' : '○'}</span>
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center ${validation.requirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{validation.requirements.hasUpperCase ? '✓' : '○'}</span>
                <span>Contains uppercase letter</span>
              </div>
              <div className={`flex items-center ${validation.requirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{validation.requirements.hasLowerCase ? '✓' : '○'}</span>
                <span>Contains lowercase letter</span>
              </div>
              <div className={`flex items-center ${validation.requirements.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{validation.requirements.hasNumbers ? '✓' : '○'}</span>
                <span>Contains number</span>
              </div>
              <div className={`flex items-center ${validation.requirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{validation.requirements.hasSpecialChar ? '✓' : '○'}</span>
                <span>Contains special character</span>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={!name || !email || !password || !confirmPassword || loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            name && email && password && confirmPassword && !loading
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </a>
      </div>
    </div>
  );
};

export default RegisterForm;
