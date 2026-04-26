const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  // 1. Create a transporter using basic SMTP details
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // If there are attachments (like a PDF pass), add them
  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // 3. Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
