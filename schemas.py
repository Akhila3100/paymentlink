from pydantic import BaseModel, EmailStr, Field

class PaymentRequest(BaseModel):
    customer_name: str = Field(..., min_length=3)
    phone_number: str = Field(..., pattern="^[0-9]{10}$")
    email: EmailStr
    amount: float = Field(..., gt=0)
    notify_by: str = Field(..., pattern="^(email|whatsapp|sms|wts)$")  # 'email', 'whatsapp', 'sms', or 'wts'

class PaymentResponse(BaseModel):
    id: int
    payment_link: str
    status: str
