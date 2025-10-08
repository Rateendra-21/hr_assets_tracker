def repair_request_template(asset_name, fullname, issue_description):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>New repair request for Asset <strong>{asset_name}</strong> has been submitted by <strong>{fullname}</strong>.</p>
        <p>Kindly Approve or Reject the repair request.</p>
        <p><strong>Issue Description:</strong> {issue_description}</p>
      </body>
    </html>
    """
