import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Search, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface PaymentData {
  id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  amount: number;
  status: string;
  created_at: string;
  payment_link?: string;
  center?: string;
  center_id?: string;
  guest_code?: string;
  razorpay_payment_id?: string;
  personal_info_user_name?: string;
  personal_info_first_name?: string;
  personal_info_last_name?: string;
  personal_info_middle_name?: string;
  personal_info_email?: string;
  personal_info_mobile_country_code?: string;
  personal_info_mobile_number?: string;
  personal_info_work_country_code?: string;
  personal_info_work_number?: string;
  personal_info_home_country_code?: string;
  personal_info_home_number?: string;
  personal_info_gender?: string;
  personal_info_date_of_birth?: string;
  personal_info_is_minor?: boolean;
  personal_info_nationality_id?: string;
  personal_info_anniversary_date?: string;
  personal_info_lock_guest_custom_data?: boolean;
  personal_info_pan?: string;
  address_info_address_1?: string;
  address_info_address_2?: string;
  address_info_city?: string;
  address_info_country_id?: string;
  address_info_state_id?: string;
  address_info_state_other?: string;
  address_info_zip_code?: string;
  preferences_receive_transactional_email?: boolean;
  preferences_receive_transactional_sms?: boolean;
  preferences_receive_marketing_email?: boolean;
  preferences_receive_marketing_sms?: boolean;
  preferences_recieve_lp_stmt?: boolean;
  preferences_preferred_therapist_id?: string;
  login_info_password?: string;
  tags?: string;
  referral_referral_source_id?: string;
  referral_referred_by_id?: string;
  primary_employee_id?: string;
}

const PaymentStatus = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<{amount?: number; status?: string}>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: '', to: ''});
  const [amountRange, setAmountRange] = useState<{min: string, max: string}>({min: '', max: ''});

  useEffect(() => {
    axios.get('http://localhost:8001/payments')
      .then(res => setPayments(res.data))
      .catch(() => setPayments([]));
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phone_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesAmount = amountFilter === 'all' || 
                         (amountFilter === 'low' && payment.amount < 200) ||
                         (amountFilter === 'medium' && payment.amount >= 200 && payment.amount < 500) ||
                         (amountFilter === 'high' && payment.amount >= 500);
    return matchesSearch && matchesStatus && matchesAmount;
  });

  const handleSendEmail = (payment: PaymentData) => {
    toast.success(`Payment link sent to ${payment.email}`);
  };

  const handleSendSMS = (payment: PaymentData) => {
    toast.success(`Payment link sent to ${payment.phone_number}`);
  };

  const handleSendWhatsApp = (payment: PaymentData) => {
    const message = `Hi ${payment.customer_name}, here's your payment link: ${payment.payment_link}`;
    const whatsappUrl = `https://wa.me/${payment.phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
      completed: { variant: 'default' as const, text: 'Completed', class: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, text: 'Failed', class: 'bg-red-100 text-red-800' },
      created: { variant: 'secondary' as const, text: 'Created', class: 'bg-blue-100 text-blue-800' },
      paid: { variant: 'default' as const, text: 'Paid', class: 'bg-green-100 text-green-800' },
      captured: { variant: 'default' as const, text: 'Captured', class: 'bg-green-100 text-green-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
    return <Badge className={config.class}>{config.text}</Badge>;
  };

  const handleExport = () => {
    setExporting(true);
    const headers = [
      'Customer Name', 'Phone', 'Email', 'Amount', 'Status', 'Date', 'Center', 'Payment Link', 'Guest Code', 'Razorpay Payment ID'
    ];
    const rows = filteredPayments.map(p => [
      p.customer_name, p.phone_number, p.email, p.amount, p.status, new Date(p.created_at).toLocaleDateString(), p.center, p.payment_link, p.guest_code, p.razorpay_payment_id
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(x => '"' + (x ?? '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      if (tableRef.current) {
        const printContents = tableRef.current.innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        win!.document.write('<html><head><title>Print Payments</title></head><body>' + printContents + '</body></html>');
        win!.document.close();
        win!.print();
      }
      setPrinting(false);
    }, 100);
  };

  const handleEdit = (id: string, payment: PaymentData) => {
    setEditRow(id);
    setEditData({ amount: payment.amount, status: payment.status });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleEditSave = (id: string) => {
    // TODO: Call backend to update payment (implement PATCH /payments/{id})
    setPayments(payments => payments.map(p => p.id === id ? { ...p, ...editData } : p));
    setEditRow(null);
  };

  const handleEditCancel = () => {
    setEditRow(null);
  };

  const advancedFilteredPayments = filteredPayments.filter(payment => {
    let dateOk = true, amountOk = true;
    if (dateRange.from) dateOk = new Date(payment.created_at) >= new Date(dateRange.from);
    if (dateRange.to) dateOk = dateOk && new Date(payment.created_at) <= new Date(dateRange.to);
    if (amountRange.min) amountOk = payment.amount >= Number(amountRange.min);
    if (amountRange.max) amountOk = amountOk && payment.amount <= Number(amountRange.max);
    return dateOk && amountOk;
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eaf7fa] via-[#f8fbfc] to-[#eaf7fa] font-['Inter','Poppins','Lato',Arial,sans-serif] overflow-hidden">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 w-full shadow-md border-b border-[#e0e7ef]">
        <div className="flex items-center px-4 py-0 h-[72px]">
          <img src="/oliva_logo.jpeg" alt="Oliva Clinic Logo" className="h-full w-auto object-contain" style={{maxHeight: '64px'}} />
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex items-center gap-2 border-2 border-[#19a7ae] text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl px-6 py-2 text-base shadow transition-all"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate('/payment')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#19a7ae] via-[#7ed6df] to-[#b2f1f7] hover:from-[#7ed6df] hover:to-[#19a7ae] text-white font-semibold rounded-xl px-6 py-2 text-base shadow-md transition-all"
            >
              Create Payment
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-start py-10 px-2 md:px-6 lg:px-12">
        {/* Payment Status Table with Integrated Filters */}
        <div className="w-full max-w-7xl">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-[#19a7ae] to-[#7ed6df] text-white pb-4 rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <RefreshCw className="w-4 h-4" /> Reload
                  </Button>
                  <Button
                    onClick={handleExport}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    disabled={exporting}
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    disabled={printing}
                  >
                    <span className="w-4 h-4">🖨️</span> Print
                  </Button>
                </div>
              </div>
              
              {/* Compact Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                  <Input
                    placeholder="Search name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                    <SelectValue placeholder="All Amounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="low">Below ₹200</SelectItem>
                    <SelectItem value="medium">₹200 - ₹500</SelectItem>
                    <SelectItem value="high">Above ₹500</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 mt-2">
                <Input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({...r, from: e.target.value}))} placeholder="From date" />
                <Input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({...r, to: e.target.value}))} placeholder="To date" />
                <Input type="number" value={amountRange.min} onChange={e => setAmountRange(r => ({...r, min: e.target.value}))} placeholder="Min Amount" />
                <Input type="number" value={amountRange.max} onChange={e => setAmountRange(r => ({...r, max: e.target.value}))} placeholder="Max Amount" />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-teal-100 bg-teal-50">
                      <TableHead className="text-teal-700 font-semibold">Customer</TableHead>
                      <TableHead className="text-teal-700 font-semibold">Contact</TableHead>
                      <TableHead className="text-teal-700 font-semibold">Amount</TableHead>
                      <TableHead className="text-teal-700 font-semibold">Status</TableHead>
                      <TableHead className="text-teal-700 font-semibold">Date</TableHead>
                      <TableHead className="text-teal-700 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advancedFilteredPayments.map(payment => (
                      <>
                        <TableRow key={payment.id} className="border-teal-50 hover:bg-teal-25 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium text-teal-900">{payment.customer_name}</p>
                              <p className="text-sm text-teal-600">{payment.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-teal-700">{payment.phone_number}</TableCell>
                          <TableCell className="font-semibold text-teal-900">
                            {editRow === payment.id ? (
                              <input name="amount" type="number" value={editData.amount} onChange={handleEditChange} className="border rounded px-2 py-1 w-20" />
                            ) : (
                              <>₹{payment.amount}</>
                            )}
                          </TableCell>
                          <TableCell>
                            {editRow === payment.id ? (
                              <select name="status" value={editData.status} onChange={handleEditChange} className="border rounded px-2 py-1">
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="paid">Paid</option>
                                <option value="captured">Captured</option>
                              </select>
                            ) : (
                              getStatusBadge(payment.status)
                            )}
                          </TableCell>
                          <TableCell className="text-teal-700">{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSendEmail(payment)}
                                className="text-teal-600 hover:text-teal-800 hover:bg-teal-100"
                                title="Send Email"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSendWhatsApp(payment)}
                                className="text-teal-600 hover:text-teal-800 hover:bg-teal-100"
                                title="Send WhatsApp"
                              >
                                <span className="text-xs font-semibold">WA</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-2 text-xs"
                                onClick={() => setExpandedRow(expandedRow === payment.id ? null : payment.id)}
                              >
                                {expandedRow === payment.id ? 'Hide Details' : 'Details'}
                              </Button>
                              {editRow === payment.id ? (
                                <>
                                  <Button size="sm" onClick={() => handleEditSave(payment.id)} className="mr-2">Save</Button>
                                  <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEdit(payment.id, payment)}>Edit</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRow === payment.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-teal-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><b>Center:</b> {payment.center}</div>
                                <div><b>Center ID:</b> {payment.center_id}</div>
                                <div><b>Payment Link:</b> <a href={payment.payment_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{payment.payment_link}</a></div>
                                <div><b>Guest Code:</b> {payment.guest_code}</div>
                                <div><b>Razorpay Payment ID:</b> {payment.razorpay_payment_id}</div>
                                <div><b>User Name:</b> {payment.personal_info_user_name}</div>
                                <div><b>First Name:</b> {payment.personal_info_first_name}</div>
                                <div><b>Last Name:</b> {payment.personal_info_last_name}</div>
                                <div><b>Middle Name:</b> {payment.personal_info_middle_name}</div>
                                <div><b>Personal Email:</b> {payment.personal_info_email}</div>
                                <div><b>Mobile Country Code:</b> {payment.personal_info_mobile_country_code}</div>
                                <div><b>Mobile Number:</b> {payment.personal_info_mobile_number}</div>
                                <div><b>Work Country Code:</b> {payment.personal_info_work_country_code}</div>
                                <div><b>Work Number:</b> {payment.personal_info_work_number}</div>
                                <div><b>Home Country Code:</b> {payment.personal_info_home_country_code}</div>
                                <div><b>Home Number:</b> {payment.personal_info_home_number}</div>
                                <div><b>Gender:</b> {payment.personal_info_gender}</div>
                                <div><b>Date of Birth:</b> {payment.personal_info_date_of_birth ? new Date(payment.personal_info_date_of_birth).toLocaleDateString() : ''}</div>
                                <div><b>Is Minor:</b> {payment.personal_info_is_minor ? 'Yes' : 'No'}</div>
                                <div><b>Nationality ID:</b> {payment.personal_info_nationality_id}</div>
                                <div><b>Anniversary Date:</b> {payment.personal_info_anniversary_date ? new Date(payment.personal_info_anniversary_date).toLocaleDateString() : ''}</div>
                                <div><b>Lock Guest Custom Data:</b> {payment.personal_info_lock_guest_custom_data ? 'Yes' : 'No'}</div>
                                <div><b>PAN:</b> {payment.personal_info_pan}</div>
                                <div><b>Address 1:</b> {payment.address_info_address_1}</div>
                                <div><b>Address 2:</b> {payment.address_info_address_2}</div>
                                <div><b>City:</b> {payment.address_info_city}</div>
                                <div><b>Country ID:</b> {payment.address_info_country_id}</div>
                                <div><b>State ID:</b> {payment.address_info_state_id}</div>
                                <div><b>State Other:</b> {payment.address_info_state_other}</div>
                                <div><b>Zip Code:</b> {payment.address_info_zip_code}</div>
                                <div><b>Preferences - Transactional Email:</b> {payment.preferences_receive_transactional_email ? 'Yes' : 'No'}</div>
                                <div><b>Preferences - Transactional SMS:</b> {payment.preferences_receive_transactional_sms ? 'Yes' : 'No'}</div>
                                <div><b>Preferences - Marketing Email:</b> {payment.preferences_receive_marketing_email ? 'Yes' : 'No'}</div>
                                <div><b>Preferences - Marketing SMS:</b> {payment.preferences_receive_marketing_sms ? 'Yes' : 'No'}</div>
                                <div><b>Preferences - LP Statement:</b> {payment.preferences_recieve_lp_stmt ? 'Yes' : 'No'}</div>
                                <div><b>Preferred Therapist ID:</b> {payment.preferences_preferred_therapist_id}</div>
                                <div><b>Login Password:</b> {payment.login_info_password}</div>
                                <div><b>Tags:</b> {payment.tags}</div>
                                <div><b>Referral Source ID:</b> {payment.referral_referral_source_id}</div>
                                <div><b>Referred By ID:</b> {payment.referral_referred_by_id}</div>
                                <div><b>Primary Employee ID:</b> {payment.primary_employee_id}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
