import React, { useState } from 'react';
import { Code, CheckCircle, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { validatePassword, validateEmail, validatePhone } from '../utils/validation';
import { calculateDistance } from '../utils/haversine';
import { TestResult } from '../types';

export const TestSuiteUI: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runSuite = () => {
    setRunning(true);
    const suite: TestResult[] = [];

    // Test 1: Weak Password Validator Failure
    try {
      const isWeakValid = validatePassword('123456');
      if (!isWeakValid) {
        suite.push({ name: 'validatePassword() - Correctly flags weak password without symbol/uppercase', passed: true });
      } else {
        suite.push({ name: 'validatePassword() - Correctly flags weak password without symbol/uppercase', passed: false, error: 'Expected false but received true' });
      }
    } catch (e: any) {
      suite.push({ name: 'validatePassword() - Correctly flags weak password without symbol/uppercase', passed: false, error: e.message });
    }

    // Test 2: Strong Password Validator Success
    try {
      const isStrongValid = validatePassword('Pass123!_Valid');
      if (isStrongValid) {
        suite.push({ name: 'validatePassword() - Passes strict validation on uppercase + symbol + numbers', passed: true });
      } else {
        suite.push({ name: 'validatePassword() - Passes strict validation on uppercase + symbol + numbers', passed: false, error: 'Expected true but received false' });
      }
    } catch (e: any) {
      suite.push({ name: 'validatePassword() - Passes strict validation on uppercase + symbol + numbers', passed: false, error: e.message });
    }

    // Test 3: Haversine distance formula coordinates validation
    try {
      const sfCoords = { latitude: 37.7749, longitude: -122.4194 };
      const nearCoords = { latitude: 37.7950, longitude: -122.4080 }; // Pad Thai (expected ~2.4km)
      const dist = calculateDistance(sfCoords, nearCoords);
      if (dist > 2.0 && dist < 3.0) {
        suite.push({ name: 'calculateDistance() - Correctly returns exact distance using Haversine algorithm', passed: true });
      } else {
        suite.push({ name: 'calculateDistance() - Correctly returns exact distance using Haversine algorithm', passed: false, error: `Expected distance ~2.4km, got ${dist.toFixed(2)}` });
      }
    } catch (e: any) {
      suite.push({ name: 'calculateDistance() - Correctly returns exact distance using Haversine algorithm', passed: false, error: e.message });
    }

    // Test 4: Dynamic coordinates outside the 8-kilometer radius constraint
    try {
      const sfCoords = { latitude: 37.7749, longitude: -122.4194 };
      const farCoords = { latitude: 37.8500, longitude: -122.4900 }; // Marin County (expected ~10.4km)
      const dist = calculateDistance(sfCoords, farCoords);
      if (dist > 8.0) {
        suite.push({ name: 'calculateDistance() - Correctly flags coordinates exceeding maximum delivery SLA boundary', passed: true });
      } else {
        suite.push({ name: 'calculateDistance() - Correctly flags coordinates exceeding maximum delivery SLA boundary', passed: false, error: `Expected distance >8.0km, got ${dist.toFixed(2)}` });
      }
    } catch (e: any) {
      suite.push({ name: 'calculateDistance() - Correctly flags coordinates exceeding maximum delivery SLA boundary', passed: false, error: e.message });
    }

    setTimeout(() => {
      setResults(suite);
      setRunning(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Code className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-black text-gray-800">Unit Test Execution Panel</h1>
        </div>
        <button
          onClick={runSuite}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          disabled={running}
        >
          {running ? 'Executing Tests...' : 'Run Automated QA Tests'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Test Suite Pipeline Results ({results.length})</span>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="font-medium text-sm">No tests executed yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Run Automated QA Tests" to execute calculations on validators and coordinates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {results.map((res, i) => (
              <div key={i} className="py-4 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  {res.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${res.passed ? 'text-gray-800' : 'text-red-700'}`}>
                      {res.name}
                    </p>
                    {res.error && <p className="text-xs text-red-500 mt-1 font-mono">Error: {res.error}</p>}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                    res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {res.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};