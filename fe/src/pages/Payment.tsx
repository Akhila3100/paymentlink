import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PaymentData {
  id: string;
  name: string;
  phone: string;
  email: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  paymentLink?: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '',
    center: '',
    center_id: '',
    personal_info_user_name: '',
    personal_info_first_name: '',
    personal_info_last_name: '',
    personal_info_middle_name: '',
    personal_info_email: '',
    personal_info_mobile_country_code: 91,
    personal_info_mobile_number: '',
    personal_info_work_country_code: 91,
    personal_info_work_number: '',
    personal_info_home_country_code: 91,
    personal_info_home_number: '',
    personal_info_gender: '',
    personal_info_date_of_birth: '',
    personal_info_is_minor: false,
    personal_info_nationality_id: 91,
    personal_info_anniversary_date: '',
    personal_info_lock_guest_custom_data: false,
    personal_info_pan: '',
    address_info_address_1: '',
    address_info_address_2: '',
    address_info_city: '',
    address_info_country_id: 95,
    address_info_state_id: -2,
    address_info_state_other: '',
    address_info_zip_code: '',
    preferences_receive_transactional_email: true,
    preferences_receive_transactional_sms: true,
    preferences_receive_marketing_email: true,
    preferences_receive_marketing_sms: true,
    preferences_recieve_lp_stmt: true,
    preferences_preferred_therapist_id: '',
    login_info_password: '',
    tags: '',
    referral_referral_source_id: '',
    referral_referred_by_id: '',
    primary_employee_id: ''
  });
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [centers, setCenters] = useState<{id: number, name: string, center_id?: string}[]>([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    axios.get('http://localhost:8001/centers')
      .then(res => setCenters(res.data))
      .catch(() => setCenters([]));
  }, []);

  const handleCenterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const centerId = e.target.value;
    const centerObj = centers.find(c => (c.center_id || c.id) == centerId);
    setFormData(prev => ({
      ...prev,
      center_id: centerId,
      center: centerObj ? centerObj.name : ''
    }));
    setSelectedCenter(centerId);
  };

  useEffect(() => {
    const amountValid = formData.amount && !isNaN(Number(formData.amount)) && Number(formData.amount) > 0;
    const requiredFieldsFilled =
      formData.personal_info_first_name &&
      formData.personal_info_last_name &&
      formData.personal_info_email &&
      formData.personal_info_mobile_country_code &&
      formData.personal_info_mobile_number &&
      selectedCenter &&
      amountValid;
    if (requiredFieldsFilled && !paymentResult && !isSubmitting) {
      handleSubmitAuto();
    }
    // eslint-disable-next-line
  }, [formData.personal_info_first_name, formData.personal_info_last_name, formData.personal_info_email, formData.personal_info_mobile_country_code, formData.personal_info_mobile_number, selectedCenter, formData.amount]);

  const handleSubmitAuto = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8001/payment', {
        customer_name: formData.personal_info_first_name + ' ' + formData.personal_info_last_name,
        phone_number: formData.personal_info_mobile_number,
        email: formData.personal_info_email,
        amount: parseFloat(formData.amount),
        center: formData.center,
        center_id: formData.center_id || selectedCenter,
        personal_info_first_name: formData.personal_info_first_name,
        personal_info_last_name: formData.personal_info_last_name,
        personal_info_mobile_country_code: formData.personal_info_mobile_country_code,
        personal_info_mobile_number: formData.personal_info_mobile_number,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPaymentResult(response.data);
      toast.success('Payment link generated!');
    } catch (err: any) {
      let errorMsg = 'Failed to generate payment link';
      const detail = err?.response?.data?.detail;
      if (detail) {
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors: array of {loc, msg, type, input}
          errorMsg = detail.map((d: any) => d.msg).join(', ');
        } else if (typeof detail === 'object') {
          errorMsg = JSON.stringify(detail);
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCenter ||
      !formData.personal_info_first_name ||
      !formData.personal_info_last_name ||
      !formData.personal_info_email ||
      !formData.personal_info_mobile_country_code ||
      !formData.personal_info_mobile_number ||
      !formData.amount
    ) {
      toast.error('Please fill all mandatory fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8001/payment', {
        customer_name: formData.personal_info_first_name + ' ' + formData.personal_info_last_name,
        phone_number: formData.personal_info_mobile_number,
        email: formData.personal_info_email || null,
        amount: parseFloat(formData.amount),
        center: formData.center,
        center_id: formData.center_id || selectedCenter,
        personal_info_user_name: formData.personal_info_user_name || null,
        personal_info_first_name: formData.personal_info_first_name,
        personal_info_last_name: formData.personal_info_last_name,
        personal_info_middle_name: formData.personal_info_middle_name || null,
        personal_info_email: formData.personal_info_email || null,
        personal_info_mobile_country_code: formData.personal_info_mobile_country_code,
        personal_info_mobile_number: formData.personal_info_mobile_number,
        personal_info_work_country_code: formData.personal_info_work_country_code || null,
        personal_info_work_number: formData.personal_info_work_number || null,
        personal_info_home_country_code: formData.personal_info_home_country_code || null,
        personal_info_home_number: formData.personal_info_home_number || null,
        personal_info_gender: formData.personal_info_gender || null,
        personal_info_date_of_birth: formData.personal_info_date_of_birth || null,
        personal_info_is_minor: formData.personal_info_is_minor ?? null,
        personal_info_nationality_id: formData.personal_info_nationality_id || null,
        personal_info_anniversary_date: formData.personal_info_anniversary_date || null,
        personal_info_lock_guest_custom_data: formData.personal_info_lock_guest_custom_data ?? null,
        personal_info_pan: formData.personal_info_pan || null,
        address_info_address_1: formData.address_info_address_1 || null,
        address_info_address_2: formData.address_info_address_2 || null,
        address_info_city: formData.address_info_city || null,
        address_info_country_id: formData.address_info_country_id || null,
        address_info_state_id: formData.address_info_state_id || null,
        address_info_state_other: formData.address_info_state_other || null,
        address_info_zip_code: formData.address_info_zip_code || null,
        preferences_receive_transactional_email: formData.preferences_receive_transactional_email ?? null,
        preferences_receive_transactional_sms: formData.preferences_receive_transactional_sms ?? null,
        preferences_receive_marketing_email: formData.preferences_receive_marketing_email ?? null,
        preferences_receive_marketing_sms: formData.preferences_receive_marketing_sms ?? null,
        preferences_recieve_lp_stmt: formData.preferences_recieve_lp_stmt ?? null,
        preferences_preferred_therapist_id: formData.preferences_preferred_therapist_id || null,
        login_info_password: formData.login_info_password || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        referral_referral_source_id: formData.referral_referral_source_id || null,
        referral_referred_by_id: formData.referral_referred_by_id || null,
        primary_employee_id: formData.primary_employee_id || null
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPaymentResult(response.data);
      toast.success('Payment link generated successfully!');
    } catch (err: any) {
      let errorMsg = 'Failed to generate payment link';
      const detail = err?.response?.data?.detail;
      if (detail) {
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors: array of {loc, msg, type, input}
          errorMsg = detail.map((d: any) => d.msg).join(', ');
        } else if (typeof detail === 'object') {
          errorMsg = JSON.stringify(detail);
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async (method: string) => {
    if (!paymentResult) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/payment/${paymentResult.id}/notify`,
        { notify_by: method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Payment link sent via ${method}`);
    } catch (err) {
      toast.error(`Failed to send via ${method}`);
    }
  };

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
              onClick={() => navigate('/payment-status')}
              variant="outline"
              className="flex items-center gap-2 border-2 border-[#19a7ae] text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl px-6 py-2 text-base shadow transition-all"
            >
              Payment Status
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-start py-10 px-2 md:px-6 lg:px-12">
        {/* Payment Form */}
        <div className="w-full max-w-3xl">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-[#19a7ae] to-[#7ed6df] text-white rounded-t-2xl p-6">
              <CardTitle className="text-center text-2xl font-bold tracking-tight font-['Inter','Poppins','Lato',Arial,sans-serif]">Create Payment Link</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#19a7ae] mb-2">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="center" className="text-[#19a7ae] font-semibold">Center</Label>
                      <select
                        id="center"
                        name="center"
                        value={selectedCenter}
                        onChange={handleCenterChange}
                        className="border-[#b2f1f7] focus:border-[#19a7ae] focus:ring-2 focus:ring-[#7ed6df]/30 rounded-xl px-4 py-3 text-base shadow-sm w-full"
                        required
                      >
                        <option value="">Select a center</option>
                        {centers.map(center => (
                          <option key={center.id} value={center.center_id || center.id}>{center.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info_first_name">First Name</Label>
                      <Input id="personal_info_first_name" name="personal_info_first_name" value={formData.personal_info_first_name} onChange={handleInputChange} placeholder="First Name (required)" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info_last_name">Last Name</Label>
                      <Input id="personal_info_last_name" name="personal_info_last_name" value={formData.personal_info_last_name} onChange={handleInputChange} placeholder="Last Name (required)" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info_email">Email</Label>
                      <Input id="personal_info_email" name="personal_info_email" type="email" value={formData.personal_info_email} onChange={handleInputChange} placeholder="Email (required)" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info_mobile_country_code">Mobile Country Code</Label>
                      <Input id="personal_info_mobile_country_code" name="personal_info_mobile_country_code" value={formData.personal_info_mobile_country_code} onChange={handleInputChange} placeholder="Country Code (required)" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personal_info_mobile_number">Mobile Number</Label>
                      <Input id="personal_info_mobile_number" name="personal_info_mobile_number" value={formData.personal_info_mobile_number} onChange={handleInputChange} placeholder="Mobile Number (required)" required />
                      <span className="text-xs text-gray-400">Required. 10-digit mobile number.</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" min="1" value={formData.amount} onChange={handleInputChange} placeholder="Amount (required)" required />
                    </div>
                  </div>
                </div>
                {/* Show more options toggle */}
                <div>
                  <button type="button" className="text-[#19a7ae] underline text-sm mt-2" onClick={() => setShowMore(v => !v)}>
                    {showMore ? 'Hide optional fields' : 'Show more options'}
                  </button>
                </div>
                {showMore && (
                  <>
                    {/* Contact Info */}
                    <div>
                      <h2 className="text-lg font-semibold text-[#19a7ae] mb-2 mt-4">Contact Details <span className="text-gray-400 text-sm">(Optional)</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_user_name">User Name <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_user_name" name="personal_info_user_name" value={formData.personal_info_user_name} onChange={handleInputChange} placeholder="User Name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_middle_name">Middle Name <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_middle_name" name="personal_info_middle_name" value={formData.personal_info_middle_name} onChange={handleInputChange} placeholder="Middle Name" />
                        </div>
                      </div>
                    </div>
                    {/* Address */}
                    <div>
                      <h2 className="text-lg font-semibold text-[#19a7ae] mb-2 mt-4">Address <span className="text-gray-400 text-sm">(Optional)</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="address_info_address_1">Address 1 <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_address_1" name="address_info_address_1" value={formData.address_info_address_1} onChange={handleInputChange} placeholder="Address 1" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_address_2">Address 2 <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_address_2" name="address_info_address_2" value={formData.address_info_address_2} onChange={handleInputChange} placeholder="Address 2" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_city">City <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_city" name="address_info_city" value={formData.address_info_city} onChange={handleInputChange} placeholder="City" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_country_id">Country ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_country_id" name="address_info_country_id" value={formData.address_info_country_id} onChange={handleInputChange} placeholder="Country ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_state_id">State ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_state_id" name="address_info_state_id" value={formData.address_info_state_id} onChange={handleInputChange} placeholder="State ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_state_other">State Other <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_state_other" name="address_info_state_other" value={formData.address_info_state_other} onChange={handleInputChange} placeholder="State Other" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_info_zip_code">Zip Code <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="address_info_zip_code" name="address_info_zip_code" value={formData.address_info_zip_code} onChange={handleInputChange} placeholder="Zip Code" />
                        </div>
                      </div>
                    </div>
                    {/* Other Details */}
                    <div>
                      <h2 className="text-lg font-semibold text-[#19a7ae] mb-2 mt-4">Other Details <span className="text-gray-400 text-sm">(Optional)</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_work_country_code">Work Country Code <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_work_country_code" name="personal_info_work_country_code" value={formData.personal_info_work_country_code} onChange={handleInputChange} placeholder="Work Country Code" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_work_number">Work Number <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_work_number" name="personal_info_work_number" value={formData.personal_info_work_number} onChange={handleInputChange} placeholder="Work Number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_home_country_code">Home Country Code <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_home_country_code" name="personal_info_home_country_code" value={formData.personal_info_home_country_code} onChange={handleInputChange} placeholder="Home Country Code" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_home_number">Home Number <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_home_number" name="personal_info_home_number" value={formData.personal_info_home_number} onChange={handleInputChange} placeholder="Home Number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_gender">Gender <span className="text-gray-400">(Optional)</span></Label>
                          <select id="personal_info_gender" name="personal_info_gender" value={formData.personal_info_gender} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3">
                            <option value="">Select Gender</option>
                            <option value="1">Male</option>
                            <option value="2">Female</option>
                            <option value="3">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_date_of_birth">Date of Birth <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_date_of_birth" name="personal_info_date_of_birth" type="date" value={formData.personal_info_date_of_birth} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_is_minor">Is Minor <span className="text-gray-400">(Optional)</span></Label>
                          <input id="personal_info_is_minor" name="personal_info_is_minor" type="checkbox" checked={formData.personal_info_is_minor} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_nationality_id">Nationality ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_nationality_id" name="personal_info_nationality_id" value={formData.personal_info_nationality_id} onChange={handleInputChange} placeholder="Nationality ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_anniversary_date">Anniversary Date <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_anniversary_date" name="personal_info_anniversary_date" type="date" value={formData.personal_info_anniversary_date} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_lock_guest_custom_data">Lock Guest Custom Data <span className="text-gray-400">(Optional)</span></Label>
                          <input id="personal_info_lock_guest_custom_data" name="personal_info_lock_guest_custom_data" type="checkbox" checked={formData.personal_info_lock_guest_custom_data} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal_info_pan">PAN <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="personal_info_pan" name="personal_info_pan" value={formData.personal_info_pan} onChange={handleInputChange} placeholder="PAN" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_receive_transactional_email">Receive Transactional Email <span className="text-gray-400">(Optional)</span></Label>
                          <input id="preferences_receive_transactional_email" name="preferences_receive_transactional_email" type="checkbox" checked={formData.preferences_receive_transactional_email} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_receive_transactional_sms">Receive Transactional SMS <span className="text-gray-400">(Optional)</span></Label>
                          <input id="preferences_receive_transactional_sms" name="preferences_receive_transactional_sms" type="checkbox" checked={formData.preferences_receive_transactional_sms} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_receive_marketing_email">Receive Marketing Email <span className="text-gray-400">(Optional)</span></Label>
                          <input id="preferences_receive_marketing_email" name="preferences_receive_marketing_email" type="checkbox" checked={formData.preferences_receive_marketing_email} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_receive_marketing_sms">Receive Marketing SMS <span className="text-gray-400">(Optional)</span></Label>
                          <input id="preferences_receive_marketing_sms" name="preferences_receive_marketing_sms" type="checkbox" checked={formData.preferences_receive_marketing_sms} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_recieve_lp_stmt">Receive LP Statement <span className="text-gray-400">(Optional)</span></Label>
                          <input id="preferences_recieve_lp_stmt" name="preferences_recieve_lp_stmt" type="checkbox" checked={formData.preferences_recieve_lp_stmt} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferences_preferred_therapist_id">Preferred Therapist ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="preferences_preferred_therapist_id" name="preferences_preferred_therapist_id" value={formData.preferences_preferred_therapist_id} onChange={handleInputChange} placeholder="Preferred Therapist ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login_info_password">Login Password <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="login_info_password" name="login_info_password" value={formData.login_info_password} onChange={handleInputChange} placeholder="Password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags (comma separated) <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. CHECKED_IN, MH Test" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referral_referral_source_id">Referral Source ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="referral_referral_source_id" name="referral_referral_source_id" value={formData.referral_referral_source_id} onChange={handleInputChange} placeholder="Referral Source ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referral_referred_by_id">Referred By ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="referral_referred_by_id" name="referral_referred_by_id" value={formData.referral_referred_by_id} onChange={handleInputChange} placeholder="Referred By ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary_employee_id">Primary Employee ID <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="primary_employee_id" name="primary_employee_id" value={formData.primary_employee_id} onChange={handleInputChange} placeholder="Primary Employee ID" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#19a7ae] to-[#7ed6df] hover:from-[#7ed6df] hover:to-[#19a7ae] text-white font-semibold py-3 rounded-xl shadow-md transition text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className="animate-spin mr-2">⏳</span> : null}
                  {isSubmitting ? 'Generating...' : 'Generate Payment Link'}
                </Button>

                {paymentResult && (
                  <>
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                      <div><b>Payment Link:</b> <a href={paymentResult.payment_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{paymentResult.payment_link}</a></div>
                      <div><b>Status:</b> {paymentResult.status}</div>
                      <div><b>Center:</b> {paymentResult.center}</div>
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button type="button" variant="outline" onClick={() => handleSend('whatsapp')} className="border-2 border-[#19a7ae] text-[#19a7ae] hover:bg-[#eaf7fa] font-semibold rounded-xl py-2 px-8 text-base shadow transition-all">Send via WhatsApp</Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
