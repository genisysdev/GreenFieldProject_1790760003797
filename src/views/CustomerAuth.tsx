import React, { useState } from 'react';
import { Shield, Key, Mail, Phone, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validatePassword, validateEmail, validatePhone } from '../utils/validation';

interface CustomerAuthProps {
  onAuthSuccess: () => void;
}

export const CustomerAuth: React.FC<CustomerAuthProps> = ({ onAuthSuccess }) => {
  const { user, setUser } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [password, setPassword] = useState('Password123!');
  
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setValidationError('Please specify a valid email address.');
      return;
    }
    if (!validatePhone(phone)) {
      setValidationError('Please input a valid phone number (International standard e.g. +15550199).');
      return;
    }
    if (!validatePassword(password)) {
      setValidationError(
        'Password is too weak. Minimum 8 characters, with at least 1 uppercase, 1 numeric, and 1 special symbol.'
      );
      return;
    }

    if (isRegistering && !otpSent) {
      // Trigger the 6-digit Onboarding verification SMS workflow
      setOtpSent(true);
      setSuccessMsg('Simulated SMS OTP sent successfully to your phone number!');
      return;
    }

    // Complete Login flow
    setUser({ name, email, phone, isAuthenticated: true });
    onAuthSuccess();
  };

  const verifyOTP = () => {
    if (otpCode === '123456') {
      setUser({ name, email, phone, isAuthenticated: true });
      onAuthSuccess();
    } else {
      setValidationError('Incorrect 6-digit SMS OTP code. Use default bypass bypass code: 123456');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 text-center text-white">
        <Shield className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold">Secure Onboarding</h2>
        <p className="text-orange-100 text-sm mt-1">
          Access the premium features, save precise coordinates, and track delivery SLA.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {validationError && (
          <div className="mb-5 p-3.5 bg-red-50 rounded-xl flex items-start text-red-700 text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 rounded-xl flex items-start text-emerald-800 text-sm border border-emerald-100">
            <CheckCircle className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  placeholder="+15551234567"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {isRegistering && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Must contain min 8 characters, 1 uppercase, 1 numeric, and 1 special symbol.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-sm"
            >
              {isRegistering ? 'Register and Send Verification code' : 'Sign In Now'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Enter 6-Digit SMS Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-center text-lg tracking-widest font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <p className="text-xs text-orange-600 mt-2 text-center font-medium">
                Simulation Code sent via Twilio Gateway is: <strong className="underline">123456</strong>
              </p>
            </div>

            <button
              onClick={verifyOTP}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm"
            >
              Confirm Code & Activate Profile
            </button>

            <button
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-sm text-gray-600 hover:underline mt-2"
            >
              Back to Edit Coordinates / Phone
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setOtpSent(false);
              setValidationError('');
              setSuccessMsg('');
            }}
            className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
          >
            {isRegistering ? 'Already have an account? Sign In' : "New to FoodDash? Register Here"}
          </button>
        </div>
      </div>
    </div>
  );
};