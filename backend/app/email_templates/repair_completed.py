def repair_completed(asset_name: str, fullname: str, remarks: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; font-size: 16px; color: #222; background-color: #f5faff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #198754;">Repair Completed</h2>
          <p>Dear {fullname},</p>
          <p>The repair request for asset <strong>{asset_name}</strong> has been completed and the asset is now assigned back to you.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Remarks</td>
              <td style="padding: 8px; border: 1px solid #ddd;">{remarks or "No specific remarks."}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">If you have further questions or issues with the asset, please reach out to the admin team.</p>
          <p>Best regards,<br/>Asset Management System</p>
        </div>
      </body>
    </html>
    """

