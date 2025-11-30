import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: "Streamify <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("Email sent using Resend 🚀");
    return true;
  } catch (error) {
    console.error("Resend email error:", error);
    return false;
  }
};
