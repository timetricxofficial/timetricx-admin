import nodemailer from "nodemailer";

export const sendLeaveStatusMail = async (
    userEmail: string,
    userName: string,
    action: 'approved' | 'rejected',
    fromDate: string,
    toDate: string,
    totalDays: number,
    reason: string,
    rejectReason: string = ''
) => {
    try {
        console.log(`📩 Sending leave ${action} status mail to:`, userEmail);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.verify();

        const actionText = action === 'approved' ? 'Approved ✅' : 'Rejected ❌';
        const bgColor = action === 'approved' ? '#22c55e' : '#ef4444';

        const rejectionBlock = action === 'rejected' && rejectReason
            ? `<div style="background:#450a0a; border-left: 4px solid #ef4444; padding:15px; margin-top:20px; border-radius:8px;">
                <p style="margin:0 0 5px; color:#fca5a5; font-weight:bold;">Reason for Rejection:</p>
                <p style="margin:0; color:white; font-size:14px;">${rejectReason}</p>
               </div>`
            : '';

        const info = await transporter.sendMail({
            from: `"Timetricx" <${process.env.SMTP_FROM}>`,
            to: userEmail,
            subject: `Leave Request ${actionText} | Timetricx`,
            html: `
      <div style="background:#0f172a; padding:40px; font-family:Arial, sans-serif;">
        <div style="max-width:520px; margin:auto; background:#020617; border-radius:16px; padding:30px; color:white; box-shadow:0 0 30px rgba(0,0,0,0.6);">
          <h2 style="margin:0 0 10px; color:${bgColor};">📅 Leave Request ${actionText}</h2>
          
          <p style="color:#cbd5f5; font-size:15px; margin-bottom:20px;">
            Hi <b>${userName}</b>,<br/><br/>
            Your leave request has been reviewed by the admin and has been <b>${action.toUpperCase()}</b>.
          </p>

          <div style="background:#1e293b; padding:20px; border-radius:12px; margin-bottom:10px; font-size:14px;">
            <p style="margin:0 0 10px;"><strong>Duration:</strong> ${totalDays} Day(s)</p>
            <p style="margin:0 0 10px;"><strong>From Date:</strong> ${new Date(fromDate).toDateString()}</p>
            <p style="margin:0 0 10px;"><strong>To Date:</strong> ${new Date(toDate).toDateString()}</p>
            <p style="margin:0;"><strong>Your Reason:</strong> ${reason}</p>
          </div>

          ${rejectionBlock}

          <hr style="border:none; border-top:1px solid #1e293b; margin:25px 0;">
          <div style="text-align:center;">
             <a href="https://timetricx.cybershoora.com/" style="color:#38bdf8; text-decoration:none; font-size:14px;">Go to Dashboard</a>
          </div>
          <p style="font-size:12px; color:#64748b; text-align:center; mt-5;">© ${new Date().getFullYear()} Timetricx Updates</p>
        </div>
      </div>
      `,
        });

        console.log(`📨 Leave Status (${action}) mail sent:`, info.messageId);

    } catch (error) {
        console.error("❌ LEAVE STATUS MAIL ERROR:", error);
    }
};
