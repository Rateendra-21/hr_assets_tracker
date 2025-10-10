from datetime import datetime

def build_asset_assignment_email(employee_name: str, table_rows: str) -> str:
    """
    Builds HTML email content for asset assignment.
    """
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 700px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004aad;">Asset Assignment Notification</h2>
          <p>Dear {employee_name},</p>
          <p>You have been assigned the following asset(s):</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background-color: #f2f2f2;">
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Asset Name</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Category</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Manufacturer</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Serial Number</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Model</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Assigned Time</th>
              </tr>
            </thead>
            <tbody>
              {table_rows}
            </tbody>
          </table>

          <p style="margin-top: 20px;">
            Please log in to your portal account to <strong>accept</strong> or <strong>decline</strong> the assigned asset(s).
          </p>

          <p>Best regards,<br/>Asset Management Team</p>
        </div>
      </body>
    </html>
    """