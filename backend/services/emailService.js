import nodemailer from "nodemailer";

// Create transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send notification email
export const sendNotificationEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Clearance System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send clearance certificate email
export const sendClearanceCertificate = async (
  to,
  studentName,
  certificateContent
) => {
  try {
    const transporter = createTransporter();

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 20px auto; padding: 0; border: 1px solid #E0E0E0; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); background-color: #FFFFFF;">
        
        <div style="padding: 20px 30px; border-bottom: 3px solid #312E81; background-color: #F8FAFC;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="color: #312E81; font-size: 24px; font-weight: 600;">
                 
                </div>
                <div style="width: 50px; height: 50px; background-color: #3B82F6; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                    LOGO
                </div>
            </div>
            <h1 style="color: #1E3A8A; font-size: 28px; margin-top: 15px; margin-bottom: 0;">Clearance Approval Notification</h1>
        </div>

        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${studentName}</strong>,</p>
            <p style="font-size: 16px; color: #333;">We are pleased to inform you that your <b>final clearance request</b> has been thoroughly reviewed and fully <b>approved</b> by all necessary departments. This signifies you have met all administrative and academic obligations.</p>

            <div style="border: 2px solid #3B82F6; padding: 25px; margin: 30px 0; border-radius: 6px; background-color: #EFF6FF;">
                <h3 style="text-align: center; color: #1E40AF; font-size: 20px; margin-top: 0; border-bottom: 1px dashed #A5B4FC; padding-bottom: 10px;">OFFICIAL STUDENT CLEARANCE CERTIFICATE</h3>
                
                <p style="font-size: 16px; text-align: center;">
                    This confirms that the student named below has successfully completed and cleared requirements with all stipulated departments.
                </p>

                <div style="text-align: center; margin-top: 15px; margin-bottom: 25px;">
                    <strong style="font-size: 18px; color: #1E3A8A; padding: 5px 15px; border-bottom: 2px solid #3B82F6;">
                        Student Name: ${studentName}
                    </strong>
                </div>

      

            </div>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-start; border-top: 1px solid #E0E0E0; padding-top: 20px;">
                
                <div style="line-height: 1.6;">
                    <strong style="color: #444;">Date of Official Completion:</strong><br>
                    <span style="font-size: 16px; color: #1E3A8A; font-weight: bold;">${completionDate}</span>
                </div>

                <div style="text-align: center;">
                    <div style="height: 40px; border-bottom: 1px solid #6B7280; width: 150px; margin-bottom: 5px;">
                        </div>
                    <strong style="color: #333; font-size: 14px;">Academic Registrar Signature/Seal</strong>
                </div>
            </div>

            <p style="margin-top: 30px; font-size: 16px; color: #333;">You are now formally cleared. Please proceed with all subsequent requirements, including final graduation procedures.</p>
            <p style="font-size: 16px; color: #333;">Best regards,<br><strong>The Registrar's Office</strong></p>
        </div>
        
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #6B7280; border-top: 1px solid #E0E0E0; background-color: #F9FAFB;">
            This is an automated and official clearance document.
        </div>
    </div>
`;
    const mailOptions = {
      from: `"Clearance System" <${process.env.SMTP_USER}>`,
      to,
      subject: "Student Clearance Certificate - Approved",
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Clearance certificate sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending clearance certificate:", error);
    throw error;
  }
};

// Send bulk notification emails
export const sendBulkNotificationEmails = async (recipients, subject, text) => {
  try {
    const promises = recipients.map((email) =>
      sendNotificationEmail(email, subject, text)
    );

    await Promise.all(promises);
    console.log("Bulk emails sent successfully");
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    throw error;
  }
};
