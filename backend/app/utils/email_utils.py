# from fastapi_mail import FastMail, MessageSchema, MessageType
# from app.email_config import ADMIN_EMAIL, conf

# async def send_admin_email(subject: str, html_content: str):
#     message = MessageSchema(
#         subject=subject,
#         recipients=[ADMIN_EMAIL],
#         body=html_content,
#         subtype=MessageType.html
#     )
#     fm = FastMail(conf)
#     await fm.send_message(message)



# from fastapi_mail import FastMail, MessageSchema, MessageType
# from app.email_config import ADMIN_EMAIL, conf

# async def send_admin_email(subject: str, html_content: str, attachments: list = None):
#     message = MessageSchema(
#         subject=subject,
#         recipients=[ADMIN_EMAIL],
#         body=html_content,
#         subtype=MessageType.html,
#         attachments=attachments or []
#     )
#     fm = FastMail(conf)
#     await fm.send_message(message)


from fastapi_mail import FastMail, MessageSchema, MessageType
from app.email_config import ADMIN_EMAIL, conf

async def send_admin_email(subject: str, html_content: str, attachments: list = None, recipients: list = None):
    message = MessageSchema(
        subject=subject,
        recipients=recipients or [ADMIN_EMAIL],
        body=html_content,
        subtype=MessageType.html,
        attachments=attachments or []
    )
    fm = FastMail(conf)
    await fm.send_message(message)

