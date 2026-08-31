import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setFormError(null);
    setNetworkError(false);
    try {
      setIsLoading(true);
      const email = data.email.trim().toLowerCase();
      const userRole = await login(email, data.password);
      navigate(userRole === 'super_user' ? '/super-admin' : '/dashboard');
    } catch (error) {
      if (error.message && error.message.includes('Network Error')) {
        setNetworkError(true);
      } else {
        setFormError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl font-bold mb-4">S</span>
          <h1 className="text-2xl font-bold text-white">SaccoSave</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back</p>
        </div>

        {networkError && (
          <ErrorMessage
            message="Network Error: Unable to connect to the server. Please check your internet connection or try again later."
            onRetry={handleSubmit(onSubmit)}
          />
        )}
        {formError && !networkError && <ErrorMessage message={formError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email is invalid' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full rounded-lg border bg-gray-900 px-4 py-2.5 pr-11 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-700'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
