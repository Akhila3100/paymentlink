import os
import requests
from twilio.rest import Client

def send_whatsapp(to_number, name, payment_link):
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    print("WHATSAPP_ACCESS_TOKEN:", (access_token[:8] + "...") if access_token else None)
    template_name = os.getenv("WHATSAPP_TEMPLATE_NAME", "stage1")
    language_code = os.getenv("WHATSAPP_LANGUAGE_CODE", "en")
    url = f"https://graph.facebook.com/v22.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": f"91{to_number}",
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language_code},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": name},
                        {"type": "text", "text": payment_link}
                    ]
                }
            ]
        }
    }
    response = requests.post(url, headers=headers, json=data)
    print("Meta WhatsApp API response:", response.status_code, response.text)
    response.raise_for_status()

def send_sms(to_number, payment_link):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    sms_from = os.getenv("TWILIO_SMS_FROM")
    client = Client(account_sid, auth_token)
    try:
        message = client.messages.create(
            body=f"Hi! Please complete your payment: {payment_link}",
            from_=sms_from,
            to=f"+91{to_number}"
        )
        print(f"SMS message SID: {message.sid}")
    except Exception as e:
        print(f"Failed to send SMS: {e}")