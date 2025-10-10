def repair_approved_template(employee_name: str, asset_name: str, vendor_name: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2e7d32;">Repair Request Approved</h2>
          <p>Dear {employee_name},</p>
          <p>Your repair request for the following asset has been <strong style="color: green;">approved</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Asset Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{asset_name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Assigned Vendor</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{vendor_name or 'N/A'}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Our team will coordinate with the vendor and keep you updated on the progress.</p>
          <p>Best regards,<br/>Asset Management Team</p>
        </div>
      </body>
    </html>
    """
