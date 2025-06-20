from fastapi import HTTPException

def raise_invalid_phone():
    raise HTTPException(status_code=400, detail="Invalid phone number")

def raise_invalid_amount():
    raise HTTPException(status_code=400, detail="Amount must be greater than zero")

def raise_payment_failed():
    raise HTTPException(status_code=500, detail="Failed to create Razorpay payment link")