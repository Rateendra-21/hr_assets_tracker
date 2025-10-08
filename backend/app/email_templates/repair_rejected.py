def repair_rejected_template(employee_name, asset_name, rejection_remark):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
        <p>Dear {employee_name},</p>
        <p>Your repair request for asset <strong>{asset_name}</strong> has been <span style="color: red;"><b>rejected</b></span>.</p>
        <p><strong>Reason for Rejection:</strong> {rejection_remark}</p>
        <br/>
        <p>Please contact your administrator for further information.</p>
        <p>Regards,<br/>Asset Management Team</p>
      </body>
    </html>
    """
