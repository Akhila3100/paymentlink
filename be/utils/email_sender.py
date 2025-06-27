import smtplib
from email.message import EmailMessage
import os

def send_email(to_email, payment_link):
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")
    msg = EmailMessage()
    msg["Subject"] = "Your Payment Link"
    msg["From"] = user
    msg["To"] = to_email
    msg.set_content(f"Hello,\n\nPlease complete your payment using this link:\n{payment_link}\n\nThanks!")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(user, password)
        smtp.send_message(msg)