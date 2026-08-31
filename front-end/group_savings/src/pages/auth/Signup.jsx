import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    hasError ? 'border-red-500' : 'border-gray-700'
  }`;

const Signup = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setFormError(null);
    setNetworkError(false);
    try {
      setIsLoading(true);
      const userData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phoneNumber: data.phoneNumber.trim(),
      };
      const userRole = await signup(userData);
      navigate(userRole === 'super_user' ? '/super-admin' : '/dashboard');
    } catch (error) {
      if (error.message && error.message.includes('Network Error')) {
        setNetworkError(true);
      } else {
        setFormError(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join our community and start saving today!</p>
        </div>

        {networkError && (
          <ErrorMessage
            message="Network Error: Unable to connect to the server. Please check your internet connection or try again later."
            onRetry={handleSubmit(onSubmit)}
          />
        )}
        {formError && !networkError && <ErrorMessage message={formError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
              <input
                placeholder="First Name"
                className={inputClass(errors.firstName)}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
              <input
                placeholder="Last Name"
                className={inputClass(errors.lastName)}
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={inputClass(errors.email)}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email is invalid' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className={inputClass(errors.phoneNumber)}
              {...register('phoneNumber', { required: 'Phone number is required' })}
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-400">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className={`${inputClass(errors.password)} pr-11`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
              >
                {showPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`${inputClass(errors.confirmPassword)} pr-11`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
              >
                {showConfirmPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
