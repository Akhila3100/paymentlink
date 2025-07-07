from pydantic import BaseModel, EmailStr, Field
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from datetime import date
class PaymentRequest(BaseModel):
    customer_name: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=10)
    email: EmailStr
    amount: float = Field(..., gt=0)
    center: str
    center_id: Optional[str]

    # Personal Info
    personal_info_user_name: Optional[str]
    personal_info_first_name: Optional[str]
    personal_info_last_name: Optional[str]
    personal_info_middle_name: Optional[str]
    personal_info_email: Optional[EmailStr]
    personal_info_mobile_country_code: Optional[int]
    personal_info_mobile_number: Optional[str]
    personal_info_work_country_code: Optional[int]
    personal_info_work_number: Optional[str]
    personal_info_home_country_code: Optional[int]
    personal_info_home_number: Optional[str]
    personal_info_gender: Optional[str]
    personal_info_date_of_birth: Optional[date]
    personal_info_is_minor: Optional[bool]
    personal_info_nationality_id: Optional[int]
    personal_info_anniversary_date: Optional[date]
    personal_info_lock_guest_custom_data: Optional[bool]
    personal_info_pan: Optional[str]

    # Address Info
    address_info_address_1: Optional[str]
    address_info_address_2: Optional[str]
    address_info_city: Optional[str]
    address_info_country_id: Optional[int]
    address_info_state_id: Optional[int]
    address_info_state_other: Optional[str]
    address_info_zip_code: Optional[str]

    # Preferences
    preferences_receive_transactional_email: Optional[bool]
    preferences_receive_transactional_sms: Optional[bool]
    preferences_receive_marketing_email: Optional[bool]
    preferences_receive_marketing_sms: Optional[bool]
    preferences_recieve_lp_stmt: Optional[bool]
    preferences_preferred_therapist_id: Optional[str]

    # Login Info
    login_info_password: Optional[str]

    # Tags and Referrals
    tags: Optional[List[str]]
    referral_referral_source_id: Optional[str]
    referral_referred_by_id: Optional[str]
    primary_employee_id: Optional[str]


class PaymentResponse(BaseModel):
    id: int
    payment_link: str
    status: str
    center: str
