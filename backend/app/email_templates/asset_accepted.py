def asset_accepted_template(asset_name: str, fullname: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2e7d32;">Asset Allocation Accepted</h2>
          <p>Dear Admin,</p>
          <p>
            The allocated asset <strong>{asset_name}</strong> has been 
            <strong style="color: green;">accepted</strong> by the employee <strong>{fullname}</strong>.
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
          <p style="margin-top: 20px;">The asset status has been successfully updated in the system.</p>
          <p>Best regards,<br/>Asset Management System</p>
        </div>
      </body>
    </html>
    """
