import nodemailer from "nodemailer";

interface AnnouncementEmailOptions {
  bccList: string[]; // Saare target users ke emails ka array
  subject: string;
  text: string;
  html: string;
}

export const sendAnnouncementEmail = async ({
  bccList,
  subject,
  text,
  html,
}: AnnouncementEmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Modemailer sendMail block ko isse replace karein:
    const info = await transporter.sendMail({
      from: `"Timetricx Team" <${process.env.SMTP_USER}>`,
      
      // FIX: 'to' me stringified array bhej rahe hain taaki har user ka server ise valid incoming mail maane
      to: bccList.join(", "), 
      
      // Agat aap strictly chahte hain ki users ek dusre ki email na dekhein, toh 'to' me SMTP_USER hi rehne dein, 
      // lekin sath me 'cc' ya direct header bypass use karein. 
      // Try 1: Pehle is 'to' setup ke sath check karein, agar mail chali jati hai toh custom domain security issue confirm ho jayega.
      subject,
      text,
      html,
    });

    console.log(
      "✅ Announcement Broadcast Email Sent:",
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "❌ Announcement Broadcast Email Error:",
      error
    );

    return {
      success: false,
      error,
    };
  }
};