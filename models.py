from sqlalchemy import Column, Integer, String, Float, DateTime
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
    payment_link = Column(String)
    payment_link_id = Column(String)
    razorpay_payment_id = Column(String)
    status = Column(String, default="created")
    created_at = Column(DateTime(timezone=True), server_default=func.now())