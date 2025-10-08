# def repair_rejected_template(employee_name, asset_name, rejection_remark):
#     return f"""
#     <html>
#       <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
#         <p>Dear {employee_name},</p>
#         <p>Your repair request for asset <strong>{asset_name}</strong> has been <span style="color: red;"><b>rejected</b></span>.</p>
#         <p><strong>Reason for Rejection:</strong> {rejection_remark}</p>
#         <br/>
#         <p>Please contact your administrator for further information.</p>
#         <p>Regards,<br/>Asset Management Team</p>
#       </body>
#     </html>
#     """



def repair_rejected_template(employee_name: str, asset_name: str, rejection_remark: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d32f2f;">Repair Request Rejected</h2>
          <p>Dear {employee_name},</p>
          <p>Your repair request for the following asset has been <strong style="color: red;">rejected</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Asset Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{asset_name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Reason for Rejection</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{rejection_remark or 'N/A'}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please contact your administrator for further clarification or next steps.</p>
          <p>Best regards,<br/>Asset Management Team</p>
        </div>
      </body>
    </html>
    """

