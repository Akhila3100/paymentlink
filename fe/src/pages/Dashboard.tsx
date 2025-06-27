import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Users, BarChart3, Settings, Plus, List, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';

const cardRadius = 'rounded-[20px]';
const cardShadow = 'shadow-xl';
const cardBg = 'bg-white';
const accentTeal = '#16b6bb';
const accentAqua = '#7ed6df';
const offWhite = '#F8FAFC';
const offWhite2 = '#F5F7FA';

const Dashboard = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8001/payments')
      .then(res => setPayments(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Calculate stats
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const customerCount = new Set(payments.map(p => p.email)).size;
  const successCount = payments.filter(p => ['paid', 'completed', 'captured'].includes((p.status || '').toLowerCase())).length;
  const successRate = payments.length ? ((successCount / payments.length) * 100).toFixed(1) + '%' : '0%';
  const thisMonthCount = payments.filter(p => {
    const d = new Date(p.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Generate payment trends for last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const trends = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const count = payments.filter(p => {
      const d = new Date(p.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    return { name: monthNames[month], payments: count };
  });

  const stats = [
    { title: 'Total Payments', value: `₹${totalPayments.toLocaleString()}`, icon: CreditCard, color: 'from-[#19a7ae] via-[#7ed6df] to-[#b2f1f7]' },
    { title: 'Customers', value: customerCount.toLocaleString(), icon: Users, color: 'from-[#7ed6df] via-[#19a7ae] to-[#b2f1f7]' },
    { title: 'Success Rate', value: successRate, icon: BarChart3, color: 'from-[#19a7ae] via-[#b2f1f7] to-[#7ed6df]' },
    { title: 'This Month', value: thisMonthCount.toLocaleString(), icon: Settings, color: 'from-[#b2f1f7] via-[#19a7ae] to-[#7ed6df]' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eaf7fa] via-[#f8fbfc] to-[#eaf7fa] font-['Inter','Poppins','Lato',Arial,sans-serif] overflow-hidden">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 w-full shadow-md border-b border-[#e0e7ef]">
        <div className="flex items-center px-4 py-0 h-[72px]">
          <img src="/oliva_logo.jpeg" alt="Oliva Clinic Logo" className="h-full w-auto object-contain" style={{maxHeight: '64px'}} />
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/payment')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#19a7ae] via-[#7ed6df] to-[#b2f1f7] hover:from-[#7ed6df] hover:to-[#19a7ae] text-white font-semibold rounded-xl px-6 py-2 text-base shadow-md transition-all"
            >
              <Plus className="w-5 h-5" /> Create Payment
            </Button>
            <Button
              onClick={() => navigate('/payment-status')}
              variant="outline"
              className="flex items-center gap-2 border-2 border-[#19a7ae] text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl px-6 py-2 text-base shadow transition-all"
            >
              <List className="w-5 h-5" /> Payment Status
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="flex items-center gap-2 text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl px-6 py-2 text-base transition-all"
            >
              <LogOut className="w-5 h-5" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: equally spaced cards, consistent padding, border-radius, and shadows */}
      <div className="w-full py-6 px-2 md:px-6 lg:px-12 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg flex flex-col p-6 relative overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01]">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${stat.color}`} />
                <div className="flex items-center gap-4 mt-2">
                  <div className="bg-gradient-to-br from-[#19a7ae] to-[#7ed6df] p-3 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-7 h-7 text-white drop-shadow" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-700 mb-1 tracking-tight" style={{fontFamily: 'Inter, Poppins, Lato, Arial, sans-serif', fontWeight: 600}}>{stat.title}</div>
                    <div className="text-2xl font-bold text-gray-900 tracking-tight drop-shadow" style={{fontFamily: 'Inter, Poppins, Lato, Arial, sans-serif', fontWeight: 700}}>{loading ? '...' : stat.value}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white rounded-2xl shadow-lg flex flex-col">
            <div className="px-6 pt-6 pb-3 border-b border-[#e0e7ef]">
              <div className="text-lg font-semibold text-[#19a7ae] tracking-tight" style={{fontFamily: 'Inter, Poppins, Lato, Arial, sans-serif', fontWeight: 600}}>Quick Actions</div>
            </div>
            <div className="p-6 space-y-4">
              <Button
                onClick={() => navigate('/payment')}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-[#19a7ae] via-[#7ed6df] to-[#b2f1f7] hover:from-[#7ed6df] hover:to-[#19a7ae] text-white font-semibold rounded-xl py-3 text-base shadow-md transition-all"
              >
                <Plus className="w-5 h-5" /> Generate Payment Link
              </Button>
              <Button
                onClick={() => navigate('/payment-status')}
                variant="outline"
                className="flex items-center gap-2 w-full border-2 border-[#19a7ae] text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl py-3 text-base shadow transition-all"
              >
                <List className="w-5 h-5" /> View All Payments
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg flex flex-col">
            <div className="px-6 pt-6 pb-3 border-b border-[#e0e7ef]">
              <div className="text-lg font-semibold text-[#19a7ae] tracking-tight" style={{fontFamily: 'Inter, Poppins, Lato, Arial, sans-serif', fontWeight: 600}}>Payment Trends</div>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e0e7ef" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#19a7ae" fontSize={14} />
                    <YAxis stroke="#19a7ae" fontSize={14} />
                    <Tooltip contentStyle={{ background: '#fff', borderColor: '#19a7ae', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef' }} labelStyle={{ color: '#19a7ae', fontWeight: 700 }} />
                    <Line type="monotone" dataKey="payments" stroke="#19a7ae" strokeWidth={3} dot={{ r: 6, fill: '#7ed6df' }} activeDot={{ r: 8, fill: '#19a7ae', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
