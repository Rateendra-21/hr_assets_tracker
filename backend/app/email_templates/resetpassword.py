# email_templates/resetpassword.py

# def reset_password_email_body(fullname: str, temp_password: str) -> str:
#     return (
#         f"Hello {fullname},\n\n"
#         f"Your password reset request was successful.\n"
#         f"Your temporary password is: {temp_password}\n\n"
#         f"Please log in and change your password immediately.\n\n"
#         f"Thank you."
#     )




def reset_password_email_body(fullname: str, temp_password: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004aad;">Password Reset Successful</h2>
          <p>Dear {fullname},</p>
          <p>Your password reset request has been successfully processed.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Temporary Password</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{temp_password}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">
            Please log in using the above temporary password and make sure to change it immediately for security reasons.
          </p>
          <p>Best regards,<br/>Support Team</p>
        </div>
      </body>
    </html>
    """


