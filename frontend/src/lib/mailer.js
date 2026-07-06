import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  const mailOptions = {
    from: `"Shiven Group" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
