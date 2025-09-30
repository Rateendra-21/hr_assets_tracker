from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="ratindratalekar9@gmail.com",
    MAIL_PASSWORD="txtsjyomxjhwukmp",  # Your Google App Password (no spaces)
    MAIL_FROM="noreply@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)
