/**
 * Validates that a password is:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 numeric character
 * - At least 1 special character
 */
export function validatePassword(password: string): boolean {
  if (!password) return false;
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumeric = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':",./<>?`~|]/.test(password);
  
  return hasMinLength && hasUppercase && hasNumeric && hasSpecial;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}