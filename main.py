import os
import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Request, Body, Path
from sqlalchemy.orm import Session
from database import SessionLocalPayment, SessionLocalOliva, engine_payment, engine_oliva, Base
from models import PaymentLink, User, Center
from schemas import PaymentRequest, PaymentResponse
from razorpay_client import create_payment_link
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import hmac
import hashlib
import json
import requests
from datetime import datetime


# Base.metadata.create_all(bind=engine) 
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_payment():
    db = SessionLocalPayment()
    try:
        yield db
    finally:
        db.close()

def get_db_oliva():
    db = SessionLocalOliva()
    try:
        yield db
    finally:
        db.close()

# JWT and OAuth2 setup
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db_payment)):
    print("Login attempt:", form_data.username, form_data.password)
    user = db.query(User).filter(User.email == form_data.username).first()
    print("DB user:", user.email if user else None, user.password if user else None)
    if not user or form_data.password != user.password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
  
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

ZENOTI_API_URL = "https://api.zenoti.com/v1/guests"
ZENOTI_API_KEY = "apikey f5bd053c34de47c686d2a0f35e68c136e7539811437e4749915b48e725d40eca"

# Helper to call Zenoti API
def create_zenoti_guest(guest_data):
    headers = {
        "Authorization": ZENOTI_API_KEY,
        "accept": "application/json",
        "content-type": "application/json"
    }
    print(headers)
    print(guest_data)
    response = requests.post(ZENOTI_API_URL, headers=headers, json=guest_data)
    print(response)
    response.raise_for_status()
    return response.json()


@app.post("/payment", response_model=PaymentResponse)
def generate_payment_link(
    payload: PaymentRequest = Body(...),
    db: Session = Depends(get_db_payment),
    current_user: str = Depends(get_current_user)
):
    try:
        # Save all guest fields from payload
        payment = PaymentLink(
            customer_name=payload.customer_name,
            email=payload.email,
            phone_number=payload.phone_number,
            amount=payload.amount,
            guest_code="",
            payment_link="",
            payment_link_id="",
            razorpay_payment_id=None,
            status="created",
            center=payload.center,
            center_id=payload.center_id,

            # Personal Info
            personal_info_user_name=payload.personal_info_user_name,
            personal_info_first_name=payload.personal_info_first_name,
            personal_info_last_name=payload.personal_info_last_name,
            personal_info_middle_name=payload.personal_info_middle_name,
            personal_info_email=payload.personal_info_email,
            personal_info_mobile_country_code=payload.personal_info_mobile_country_code,
            personal_info_mobile_number=payload.personal_info_mobile_number,
            personal_info_work_country_code=payload.personal_info_work_country_code,
            personal_info_work_number=payload.personal_info_work_number,
            personal_info_home_country_code=payload.personal_info_home_country_code,
            personal_info_home_number=payload.personal_info_home_number,
            personal_info_gender=payload.personal_info_gender,

            personal_info_date_of_birth=datetime.combine(
                payload.personal_info_date_of_birth, datetime.min.time()
            ) if payload.personal_info_date_of_birth else None,

            personal_info_is_minor=payload.personal_info_is_minor,
            personal_info_nationality_id=payload.personal_info_nationality_id,

            personal_info_anniversary_date=datetime.combine(
                payload.personal_info_anniversary_date, datetime.min.time()
            ) if payload.personal_info_anniversary_date else None,

            personal_info_lock_guest_custom_data=payload.personal_info_lock_guest_custom_data,
            personal_info_pan=payload.personal_info_pan,

            # Address Info
            address_info_address_1=payload.address_info_address_1,
            address_info_address_2=payload.address_info_address_2,
            address_info_city=payload.address_info_city,
            address_info_country_id=payload.address_info_country_id,
            address_info_state_id=payload.address_info_state_id,
            address_info_state_other=payload.address_info_state_other,
            address_info_zip_code=payload.address_info_zip_code,

            # Preferences
            preferences_receive_transactional_email=payload.preferences_receive_transactional_email,
            preferences_receive_transactional_sms=payload.preferences_receive_transactional_sms,
            preferences_receive_marketing_email=payload.preferences_receive_marketing_email,
            preferences_receive_marketing_sms=payload.preferences_receive_marketing_sms,
            preferences_recieve_lp_stmt=payload.preferences_recieve_lp_stmt,
            preferences_preferred_therapist_id=payload.preferences_preferred_therapist_id,

            # Login Info
            login_info_password=payload.login_info_password,

            # Tags
            tags=','.join(payload.tags) if payload.tags else None,

            # Referrals
            referral_referral_source_id=payload.referral_referral_source_id,
            referral_referred_by_id=payload.referral_referred_by_id,
            primary_employee_id=payload.primary_employee_id
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Now create Razorpay payment link and update
        rp_response = create_payment_link(
            payload.customer_name,
            payload.email,
            payload.phone_number,
            payload.amount
        )
        payment.payment_link = rp_response["short_url"]
        payment.payment_link_id = rp_response.get("id")
        payment.status = rp_response["status"]

        db.commit()
        db.refresh(payment)
        
        return {
            "id": payment.id,
            "payment_link": payment.payment_link,
            "status": payment.status,
            "center": payment.center
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Failed to create payment: {str(e)}")

@app.get("/centers")
def get_centers(db: Session = Depends(get_db_oliva)):
    result = db.execute(text("SELECT id, center_id, name FROM dbo.center")).fetchall()
    centers = [{"id": row.id, "center_id": row.center_id, "name": row.name} for row in result]
    # print("Raw SQL result:", centers)
    return centers

@app.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db_payment)):
    print("Webhook received!")
    try:
        payload = await request.body()
        webhook_data = json.loads(payload)
        print("Webhook payload:", webhook_data)

        payment_link_entity = webhook_data.get("payload", {}).get("payment_link", {}).get("entity", {})
        payment_entity = webhook_data.get("payload", {}).get("payment", {}).get("entity", {})

        payment_link_id = payment_link_entity.get("id")
        rrn = payment_entity.get("acquirer_data", {}).get("rrn")
        status = payment_link_entity.get("status")  # Use payment link status ('paid')

        print("payment_link_id:", payment_link_id, "rrn:", rrn, "status:", status)

        if not payment_link_id:
            raise HTTPException(status_code=400, detail="Missing payment_link_id in webhook")

        payment = db.query(PaymentLink).filter(PaymentLink.payment_link_id == payment_link_id).first()
        print("Found payment:", payment)
        if payment:
            if rrn:
                payment.razorpay_payment_id = rrn
            if status:
                payment.status = status
            db.commit()
            db.refresh(payment)
            print(f"Updated payment {payment.id} with status {payment.status} and rrn {payment.razorpay_payment_id}")
            # If status is 'paid', call Zenoti API
            if status == 'paid':
                guest_data = {
                    "center_id": payment.center_id,
                    "personal_info": {
                        "first_name": payment.personal_info_first_name,
                        "last_name": payment.personal_info_last_name,
                        "middle_name": payment.personal_info_middle_name,
                        "email": payment.personal_info_email,
                        "mobile_phone": {
                            "country_code": "IN",
                            "number": payment.personal_info_mobile_number
                        },
                        "work_phone": {
                            "country_code": payment.personal_info_work_country_code,
                            "number": payment.personal_info_work_number
                        },
                        "home_phone": {
                            "country_code": payment.personal_info_home_country_code,
                            "number": payment.personal_info_home_number
                        },
                        "gender": payment.personal_info_gender,
                        "date_of_birth": payment.personal_info_date_of_birth.isoformat() if payment.personal_info_date_of_birth else "2000-05-31T00:00:00",
                        "is_minor": payment.personal_info_is_minor,
                        "nationality_id": payment.personal_info_nationality_id,
                        "anniversary_date": payment.personal_info_anniversary_date.isoformat() if payment.personal_info_anniversary_date else None,
                        "lock_guest_custom_data": payment.personal_info_lock_guest_custom_data,
                        "pan": payment.personal_info_pan
                    },
                    "address_info": {
                        "address_1": payment.address_info_address_1,
                        "address_2": payment.address_info_address_2,
                        "city": payment.address_info_city,
                        "country_id": payment.address_info_country_id,
                        "state_id": payment.address_info_state_id,
                        "state_other": payment.address_info_state_other,
                        "zip_code": payment.address_info_zip_code
                    },
                    "preferences": {
                        "receive_transactional_email": payment.preferences_receive_transactional_email,
                        "receive_transactional_sms": payment.preferences_receive_transactional_sms,
                        "receive_marketing_email": payment.preferences_receive_marketing_email,
                        "receive_marketing_sms": payment.preferences_receive_marketing_sms,
                        "recieve_lp_stmt": payment.preferences_recieve_lp_stmt
                    },
    
                    "tags": payment.tags.split(',') if payment.tags else [],
                    "referral": {
                        "referral_source": {
                            "id": payment.referral_referral_source_id,
                            "name": None
                        },
                        "referred_by": {
                            "id": payment.referral_referred_by_id,
                            "name": None
                        }
                    },
                    "primary_employee": {
                        "id": payment.primary_employee_id,
                        "name": None
                    }
                }
                try:
                    zenoti_response = create_zenoti_guest(guest_data)
                    print("Zenoti response:", zenoti_response)
                    guest_code = zenoti_response.get("code")
                    if guest_code:
                        payment.guest_code = guest_code
                        db.commit()
                        db.refresh(payment)
                        print(f"Zenoti guest created, code: {guest_code}")
                except Exception as ze:
                    print(f"Zenoti API error: {ze}")
        else:
            print("No matching payment found for webhook.")

        return {"status": "success"}
    except Exception as e:
        print(f"Webhook Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")
    
@app.get("/payments")
def get_payments(db: Session = Depends(get_db_payment)):
    payments = db.query(PaymentLink).order_by(PaymentLink.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "customer_name": p.customer_name,
            "phone_number": p.phone_number,
            "email": p.email,
            "amount": p.amount,
            "status": p.status,
            "created_at": p.created_at,
            "payment_link": p.payment_link,
            "center": p.center,
            "center_id": p.center_id,
            "personal_info_user_name": p.personal_info_user_name,
            "personal_info_first_name": p.personal_info_first_name,
            "personal_info_last_name": p.personal_info_last_name,
            "personal_info_middle_name": p.personal_info_middle_name,
            "personal_info_email": p.personal_info_email,
            "personal_info_mobile_country_code": p.personal_info_mobile_country_code,
            "personal_info_mobile_number": p.personal_info_mobile_number,
            "personal_info_work_country_code": p.personal_info_work_country_code,
            "personal_info_work_number": p.personal_info_work_number,
            "personal_info_home_country_code": p.personal_info_home_country_code,
            "personal_info_home_number": p.personal_info_home_number,
            "personal_info_gender": p.personal_info_gender,
            "personal_info_date_of_birth": p.personal_info_date_of_birth,
            "personal_info_is_minor": p.personal_info_is_minor,
            "personal_info_nationality_id": p.personal_info_nationality_id,
            "personal_info_anniversary_date": p.personal_info_anniversary_date,
            "personal_info_lock_guest_custom_data": p.personal_info_lock_guest_custom_data,
            "personal_info_pan": p.personal_info_pan,
            "address_info_address_1": p.address_info_address_1,
            "address_info_address_2": p.address_info_address_2,
            "address_info_city": p.address_info_city,
            "address_info_country_id": p.address_info_country_id,
            "address_info_state_id": p.address_info_state_id,
            "address_info_state_other": p.address_info_state_other,
            "address_info_zip_code": p.address_info_zip_code,
            "preferences_receive_transactional_email": p.preferences_receive_transactional_email,
            "preferences_receive_transactional_sms": p.preferences_receive_transactional_sms,
            "preferences_receive_marketing_email": p.preferences_receive_marketing_email,
            "preferences_receive_marketing_sms": p.preferences_receive_marketing_sms,
            "preferences_recieve_lp_stmt": p.preferences_recieve_lp_stmt,
            "preferences_preferred_therapist_id": p.preferences_preferred_therapist_id,
            "login_info_password": p.login_info_password,
            "tags": p.tags,
            "referral_referral_source_id": p.referral_referral_source_id,
            "referral_referred_by_id": p.referral_referred_by_id,
            "primary_employee_id": p.primary_employee_id,
            "guest_code": p.guest_code,
            "razorpay_payment_id": p.razorpay_payment_id,
        } for p in payments
    ]
    
@app.patch("/payments/{id}")
def update_payment(id: int = Path(...), data: dict = None, db: Session = Depends(get_db_payment)):
    payment = db.query(PaymentLink).filter(PaymentLink.id == id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if data is None:
        raise HTTPException(status_code=400, detail="No data provided")
    if 'amount' in data:
        payment.amount = data['amount']
    if 'status' in data:
        payment.status = data['status']
    db.commit()
    db.refresh(payment)
    return {"success": True, "id": payment.id, "amount": payment.amount, "status": payment.status}
    
