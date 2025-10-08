def asset_declined_template(asset_name, fullname, remarks):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>
          The allocated asset <strong>{asset_name}</strong> for the employee <strong>{fullname}</strong> 
          has been <span style="color: red; font-weight: bold;">declined</span> by the employee {fullname}
        </p>
        <p><strong>Remarks:</strong> {remarks or 'No additional remarks provided.'}</p>
      </body>
    </html>
    """
