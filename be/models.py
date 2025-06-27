from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from database import Base
from datetime import datetime
from sqlalchemy.sql import func

class PaymentLink(Base):
    __tablename__ = "payment_links"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    guest_code = Column(String(50), nullable=True)
    payment_link = Column(String)
    payment_link_id = Column(String)
    razorpay_payment_id = Column(String)
    status = Column(String, default="created")
    center = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Zenoti guest fields (flattened)
    center_id = Column(String, nullable=True)
    personal_info_user_name = Column(String, nullable=True)
    personal_info_first_name = Column(String, nullable=True)
    personal_info_last_name = Column(String, nullable=True)
    personal_info_middle_name = Column(String, nullable=True)
    personal_info_email = Column(String, nullable=True)
    personal_info_mobile_country_code = Column(Integer, nullable=True)
    personal_info_mobile_number = Column(String, nullable=True)
    personal_info_work_country_code = Column(Integer, nullable=True)
    personal_info_work_number = Column(String, nullable=True)
    personal_info_home_country_code = Column(Integer, nullable=True)
    personal_info_home_number = Column(String, nullable=True)
    personal_info_gender = Column(Integer, nullable=True)
    personal_info_date_of_birth = Column(DateTime, nullable=True)
    personal_info_is_minor = Column(Boolean, nullable=True)
    personal_info_nationality_id = Column(Integer, nullable=True)
    personal_info_anniversary_date = Column(DateTime, nullable=True)
    personal_info_lock_guest_custom_data = Column(Boolean, nullable=True)
    personal_info_pan = Column(String, nullable=True)
    address_info_address_1 = Column(String, nullable=True)
    address_info_address_2 = Column(String, nullable=True)
    address_info_city = Column(String, nullable=True)
    address_info_country_id = Column(Integer, nullable=True)
    address_info_state_id = Column(Integer, nullable=True)
    address_info_state_other = Column(String, nullable=True)
    address_info_zip_code = Column(String, nullable=True)
    preferences_receive_transactional_email = Column(Boolean, nullable=True)
    preferences_receive_transactional_sms = Column(Boolean, nullable=True)
    preferences_receive_marketing_email = Column(Boolean, nullable=True)
    preferences_receive_marketing_sms = Column(Boolean, nullable=True)
    preferences_recieve_lp_stmt = Column(Boolean, nullable=True)
    preferences_preferred_therapist_id = Column(String, nullable=True)
    login_info_password = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # Store as comma-separated string
    referral_referral_source_id = Column(String, nullable=True)
    referral_referred_by_id = Column(String, nullable=True)
    primary_employee_id = Column(String, nullable=True)

from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Center(Base):
    __tablename__ = "center"
    __table_args__ = {'schema': 'Oliva'}
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer)
    name = Column(String)