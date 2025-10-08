# def return_asset_accepted(asset_name: str, fullname: str) -> str:
#     return f"""
#     <html>
#       <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
#         <p>Dear {fullname},</p>
#         <p>Your asset <strong>{asset_name}</strong> return request has been <span style="color: green; font-weight: bold;">accepted</span>.</p>
#         <p>Thank you for your cooperation.</p>
#         <br/>
#         <p>Best regards,</p>
#         <p>Asset Management Team</p>
#       </body>
#     </html>
#     """


def return_asset_accepted(asset_name: str, fullname: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2e7d32;">Asset Return Accepted</h2>
          <p>Dear {fullname},</p>
          <p>
            Your asset return request for <strong>{asset_name}</strong> has been 
            <strong style="color: green;">accepted</strong>.
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
            Thank you for your cooperation. The asset team will handle the returned item accordingly.
          </p>
          <p>Best regards,<br/>Asset Management System</p>
        </div>
      </body>
    </html>
    """

