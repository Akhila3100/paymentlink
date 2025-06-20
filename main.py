import os
print("ALL ENV:", dict(os.environ))
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Body, Request
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import PaymentLink
from schemas import PaymentRequest, PaymentResponse
from razorpay_client import create_payment_link
from exceptions import raise_payment_failed
from utils.email_sender import send_email
from utils.whatsapp_sender import send_whatsapp, send_sms
from fastapi.middleware.cors import CORSMiddleware
import hmac
import hashlib
import json

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/payment", response_model=PaymentResponse)
def generate_payment_link(payload: PaymentRequest, db: Session = Depends(get_db)):
    try:
        rp_response = create_payment_link(
            payload.customer_name,
            payload.email,
            payload.phone_number,
            payload.amount
        )
    except Exception as e:
        print("Razorpay Error:", str(e))
        raise HTTPException(status_code=502, detail="Failed to create Razorpay payment link: " + str(e))

    try:
        payment = PaymentLink(
            customer_name=payload.customer_name,
            email=payload.email,
            phone_number=payload.phone_number,
            amount=payload.amount,
            payment_link=rp_response["short_url"],
            payment_link_id=rp_response.get("id"),
            razorpay_payment_id=rp_response.get("payment_id"),
            status=rp_response["status"]
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
    except Exception as e:
        print("Database Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to save payment record")

    try:
        print("notify_by value:", payload.notify_by)
        # if payload.notify_by.lower() == "email":
        #     print("Sending EMAIL")
        #     send_email(payload.email, payment.payment_link)
        # elif payload.notify_by.lower() in ["whatsapp", "wts"]:
        #     print("Sending WHATSAPP")
        #     send_whatsapp(payload.phone_number, payload.customer_name, payment.payment_link)
        # elif payload.notify_by.lower() == "sms":
        #     print("Sending SMS")
        #     send_sms(payload.phone_number, payment.payment_link)
        pass
    except Exception as e:
        print("Notification Error:", str(e))
        raise HTTPException(status_code=500, detail="Failed to send notification: " + str(e))

    return {
        "id": payment.id,
        "payment_link": payment.payment_link,
        "status": payment.status
    }

@app.put("/payment/{payment_id}/status")
def update_payment_status(payment_id: int, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    payment = db.query(PaymentLink).filter(PaymentLink.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = status
    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "status": payment.status}

@app.get("/payment/{payment_id}/status")
def get_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PaymentLink).filter(PaymentLink.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"id": payment.id, "status": payment.status}

@app.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    print("Webhook received!")
    try:
        # Get the webhook payload
        payload = await request.body()
        print("Raw payload:", payload)
        signature = request.headers.get("x-razorpay-signature")
        
        # Verify webhook signature (optional but recommended)
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        expected_signature = hmac.new(
            webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            print("Invalid signature!")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse the webhook payload
        webhook_data = json.loads(payload)
        print("Webhook payload:", webhook_data)
        
        # Extract payment details
        payment_id = webhook_data.get("payload", {}).get("payment", {}).get("entity", {}).get("id")
        payment_status = webhook_data.get("payload", {}).get("payment", {}).get("entity", {}).get("status")
        print("payment_id:", payment_id, "payment_status:", payment_status)
        
        if payment_id and payment_status:
            payment = db.query(PaymentLink).filter(
                PaymentLink.razorpay_payment_id == payment_id
            ).first()
            if payment:
                payment.status = payment_status
                db.commit()
                db.refresh(payment)
                print(f"Payment {payment_id} status updated to: {payment_status}")
                if payment_status == "captured":
                    print(f"Payment successful for customer: {payment.customer_name}")
                elif payment_status == "failed":
                    print(f"Payment failed for customer: {payment.customer_name}")
        
        # In webhook: also handle payment_link entity
        payment_link_id = webhook_data.get("payload", {}).get("payment_link", {}).get("entity", {}).get("id")
        payment_link_status = webhook_data.get("payload", {}).get("payment_link", {}).get("entity", {}).get("status")
        print("payment_link_id:", payment_link_id, "payment_link_status:", payment_link_status)
        if payment_link_id and payment_link_status:
            payment = db.query(PaymentLink).filter(
                PaymentLink.payment_link_id == payment_link_id
            ).first()
            if payment:
                payment.status = payment_link_status
                db.commit()
                db.refresh(payment)
                print(f"Payment link {payment_link_id} status updated to: {payment_link_status}")
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"Webhook Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")
