import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, html, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📧 Attempt ${i + 1}/${retries} to send email to ${to}`);
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Streamify" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent to ${to} (Attempt ${i + 1})`);
      return { success: true, attempt: i + 1 };
      
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      
      // Wait before retry (1s, 2s, 4s - exponential backoff)
      if (i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If all retries failed
  console.error(`❌ Failed to send email to ${to} after ${retries} attempts`);
  return { 
    success: false, 
    error: `Failed after ${retries} attempts` 
  };
};