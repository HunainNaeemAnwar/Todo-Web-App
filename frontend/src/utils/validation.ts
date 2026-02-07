// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationResults {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

// Password validation
export function validatePassword(password: string, requirements = PASSWORD_REQUIREMENTS): ValidationResult {
  if (!password || password === '') {
    return { isValid: false, error: 'Password is required' };
  }

  const errors: string[] = [];

  if (password.length < requirements.minLength) {
    errors.push(`at least ${requirements.minLength} characters`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }

  if (requirements.requireNumber && !/[0-9]/.test(password)) {
    errors.push('one number');
  }

  if (requirements.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('one special character');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Password must contain ${errors.join(', ')}`
    };
  }

  return { isValid: true };
}

// Name validation
export function validateName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return { isValid: true };
}

// Full signup validation
export function validateSignup(
  name: string,
  email: string,
  password: string
): ValidationResults {
  const errors: Record<string, string> = {};

  const nameResult = validateName(name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error || 'Invalid name';
  }

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error || 'Invalid email';
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error || 'Invalid password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Full signin validation
export function validateSignin(email: string, password: string): ValidationResults {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error || 'Invalid email';
  }

  if (!password || password === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Password strength indicator
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: '', color: '' };
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Cap score at 5
  score = Math.min(score, 5);

  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
