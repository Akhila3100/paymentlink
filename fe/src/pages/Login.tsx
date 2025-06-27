import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8001/token', new URLSearchParams({
        username: formData.email,
        password: formData.password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', response.data.access_token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#e6fcfc] flex items-center justify-center p-4 font-[Montserrat,Arial,sans-serif]">
      <div className="w-full max-w-md space-y-8">
        {/* Logo image only, centered, with shadow */}
        <div className="flex justify-center mb-4">
          <img src="/oliva_logo.jpeg" alt="Oliva Clinic Logo" className="w-[320px] max-w-full h-auto object-contain rounded-xl shadow-lg bg-white/70 p-4" />
        </div>
        {/* Login Form */}
        <Card className="border-[#16b6bb] shadow-xl rounded-3xl bg-white/95 backdrop-blur-md transition-all duration-300">
          <CardContent className="p-10 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#16b6bb] font-semibold text-base">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="border-[#16b6bb] focus:border-[#16b6bb] focus:ring-2 focus:ring-[#16b6bb]/30 transition font-[Montserrat,Arial,sans-serif] rounded-xl px-4 py-3 text-base shadow-sm"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#16b6bb] font-semibold text-base">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="border-[#16b6bb] focus:border-[#16b6bb] focus:ring-2 focus:ring-[#16b6bb]/30 transition font-[Montserrat,Arial,sans-serif] rounded-xl px-4 py-3 text-base shadow-sm"
                  autoComplete="current-password"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <a href="#" className="text-sm text-[#16b6bb] hover:underline font-medium transition">Forgot password?</a>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#16b6bb] hover:bg-[#13a3a8] active:bg-[#119196] text-white font-semibold py-3 rounded-xl shadow-md transition text-lg tracking-wide mt-2"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center text-xs text-[#16b6bb] mt-8 select-none font-[Montserrat,Arial,sans-serif]">
          &copy; {new Date().getFullYear()} OLIVA. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
