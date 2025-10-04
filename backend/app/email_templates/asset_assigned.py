from datetime import datetime

def build_asset_assignment_email(employee_name: str, table_rows: str) -> str:
    """
    Builds HTML email content for asset assignment.
    """
    return f"""
    <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear {employee_name},</p>
        <p>You have been assigned the following assets:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
            <thead style="background-color: #f2f2f2;">
                <tr>
                    <th style="padding: 10px; border: 1px solid #ddd;">Asset Name</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Manufacturer</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Serial Number</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Model</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Assigned Time</th>
                </tr>
            </thead>
            <tbody>
                {table_rows}
            </tbody>
        </table>
        <p>Please kindly collect the assigned asset(s) and mark them as accepted/rejected by logging into your portal account.</p>
        <p>Regards,<br>Asset Management Team</p>
    </div>
    """
