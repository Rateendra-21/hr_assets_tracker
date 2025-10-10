def return_asset_declined(asset_name: str, fullname: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d32f2f;">Asset Return Declined</h2>
          <p>Dear {fullname},</p>
          <p>
            Your asset return request for <strong>{asset_name}</strong> has been 
            <strong style="color: red;">declined</strong>.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Asset Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{asset_name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Employee</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{fullname}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">
            Please contact the administrator for more details or further assistance regarding this decision.
          </p>
          <p>Best regards,<br/>Asset Management System</p>
        </div>
      </body>
    </html>
    """

