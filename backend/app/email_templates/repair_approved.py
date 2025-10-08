def repair_approved_template(employee_name, asset_name, vendor_name):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
        <p>Dear {employee_name},</p>
        <p>Your repair request for asset <strong>{asset_name}</strong> has been <span style="color:green;">approved</span>.</p>
        <p>
          <strong>Assigned Vendor:</strong> {vendor_name}
        </p>
        <p>Our team will coordinate with the vendor and update you on the progress.</p>
        <br/>
        <p>Thank you,</p>
        <p>Asset Management Team</p>
      </body>
    </html>
    """
