def repair_request_template(asset_name: str, fullname: str, issue_description: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #004aad;">Asset Repair Request</h2>
          <p>Hi,</p>
          <p>A new asset repair request has been submitted and requires your attention.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Asset Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{asset_name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Requested By</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{fullname}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Issue Description</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{issue_description or 'N/A'}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please review and take appropriate action (Approve or Reject) for this repair request.</p>
          <p>Best regards,<br/>Asset Management System</p>
        </div>
      </body>
    </html>
    """
