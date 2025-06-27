import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

print("RAZORPAY_KEY_ID:", os.getenv("RAZORPAY_KEY_ID"))
print("RAZORPAY_KEY_SECRET:", os.getenv("RAZORPAY_KEY_SECRET")[:4] + "****")

client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

def create_payment_link(name, email, contact, amount):
    try:
        response = client.payment_link.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "description": f"Payment for {name}",
            "customer": {
                "name": name,
                "email": email,
                "contact": f"+91{contact}"
            },
            "notify": {
                "email": True,
                "sms": True
            },
            "reminder_enable": True,
            "callback_url": os.getenv("RAZORPAY_CALLBACK_URL", "https://yourdomain.com/payment/callback"),
            "callback_method": "get"
        })
        return response
    except Exception as e:
        print("Razorpay error:", str(e))
        raise Exception("Razorpay Error: " + str(e))