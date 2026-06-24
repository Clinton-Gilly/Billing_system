'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', data);
      if (res.data.success || res.data.token) {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0A1628]">Create Account</h2>
            <p className="text-gray-500 mt-2">Join Xuremi Net to get online fast</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input 
                {...register('name')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                type="email"
                {...register('email')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input 
                {...register('phone')}
                placeholder="+254700000000"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input 
                type="password"
                {...register('password')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input 
                type="password"
                {...register('confirmPassword')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A56DB] hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-lg transition mt-4 shadow-md"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Already have an account? <Link href="/auth/login" className="text-[#06B6D4] hover:text-[#1A56DB] transition font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
