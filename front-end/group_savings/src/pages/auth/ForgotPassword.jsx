import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await requestPasswordReset(email);
      // We don't reveal whether the email exists, for security reasons.
      setSuccess(true);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-8">SaccoSave</h1>

        {success ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 text-center text-emerald-400">
            <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
            <p className="mb-3 text-sm">
              If an account exists with the email you provided, we've sent instructions to reset your password.
            </p>
            <Link to="/login" className="font-semibold hover:text-emerald-300">Return to login</Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-white text-center mb-2">Forgot Your Password?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm">
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Back to Login</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
