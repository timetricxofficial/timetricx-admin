import nodemailer from "nodemailer";

export const sendHolidayNotificationMail = async (
    emails: string[],
    holidayTitle: string,
    holidayDate: string
) => {
    try {
        console.log("📩 Sending holiday notification mail to:", emails.length, "users");

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

        const info = await transporter.sendMail({
            from: `"Timetricx Holiday Alert" <${process.env.SMTP_FROM}>`,
            bcc: emails, // Use BCC to avoid users seeing each others emails
            subject: `Company Holiday: ${holidayTitle} on ${new Date(holidayDate).toDateString()} | Timetricx`,
            html: `
            <div style="background:#0f172a; padding:40px; font-family:Arial, sans-serif;">
                <div style="max-width:520px; margin:auto; background:#020617; border-radius:32px; padding:40px; color:white; box-shadow:0 0 50px rgba(0,0,0,0.8); border: 1px solid #1e293b;">
                    <div style="text-align:center; margin-bottom:30px;">
                        <span style="background:rgba(244, 63, 94, 0.1); color:#f43f5e; padding:10px 20px; border-radius:100px; font-weight:bold; font-size:12px; border:1px solid rgba(244, 63, 94, 0.2); text-transform:uppercase; letter-spacing:2px;">
                            Official Announcement
                        </span>
                    </div>
                    
                    <h1 style="margin:0 0 15px; color:white; font-size:28px; text-align:center; font-weight:900;">🎉 Company Holiday</h1>
                    <p style="color:#94a3b8; font-size:16px; margin-bottom:35px; text-align:center; line-height:1.6;">
                        We are pleased to announce an official company holiday for <b>${holidayTitle}</b>.
                    </p>

                    <div style="background:linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(59, 130, 246, 0.1)); padding:30px; border-radius:24px; margin-bottom:35px; border: 1px solid rgba(255,255,255,0.05); text-align:center;">
                        <p style="margin:0 0 5px; color:#cbd5e1; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Date of Holiday</p>
                        <h2 style="margin:0; color:#f43f5e; font-size:24px; font-weight:bold;">${new Date(holidayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    </div>

                    <p style="color:#64748b; font-size:14px; text-align:center; line-height:1.6; margin-bottom:30px;">
                        The office will remain closed on this day. Please plan your work accordingly. Enjoy your well-deserved break!
                    </p>

                    <div style="text-align:center; margin-top:40px; padding-top:30px; border-top:1px solid #1e293b;">
                        <p style="font-size:12px; color:#475569; margin:0;">© ${new Date().getFullYear()} Timetricx Team</p>
                    </div>
                </div>
            </div>
            `,
        });

        console.log("📨 Holiday notification mail sent:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ HOLIDAY MAIL ERROR:", error);
        return { success: false, error };
    }
};
