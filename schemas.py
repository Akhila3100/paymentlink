from pydantic import BaseModel, EmailStr, Field

class PaymentRequest(BaseModel):
    customer_name: str = Field(..., min_length=1)
    email: EmailStr
    phone_number: str = Field(..., min_length=10)
    amount: float = Field(..., gt=0)
    
    center: str = Field(..., min_length=1)

class PaymentResponse(BaseModel):
    id: int
    payment_link: str
    status: str
    center: str
