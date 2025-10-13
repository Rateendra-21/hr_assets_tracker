from fastapi_mail import ConnectionConfig

ADMIN_EMAIL = "test@gmail.com"

conf = ConnectionConfig(
    MAIL_USERNAME="test@gmail.com",
    MAIL_PASSWORD="",  # Your Google App Password (no spaces)
    MAIL_FROM="noreply@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,

)
