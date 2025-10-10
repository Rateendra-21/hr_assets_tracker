# email_templates/employee_creation.py

def employee_account_email_body(fullname: str, raw_password: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004aad;">Welcome to HR Asset Tracker</h2>
          <p>Dear {fullname},</p>
          <p>Your account has been successfully created on the HR Asset Tracker portal.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Temporary Password</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{raw_password}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">
            Please log in using the above temporary password and change it immediately for security purposes.
          </p>
          <p>Best regards,<br/>HR Asset Tracker Team</p>
        </div>
      </body>
    </html>
    """
