def asset_accepted_template(asset_name, fullname):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>
          Allocated Asset <strong>{asset_name}</strong> to the Employee <strong>{fullname}</strong> is 
          <span style="color: green; font-weight: bold;">Accepted</span> by the employee <strong>{fullname}</strong>.
        </p>
      </body>
    </html>
    """

