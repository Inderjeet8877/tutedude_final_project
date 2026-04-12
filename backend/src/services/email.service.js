const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  let transporter;

  // Check if standard SMTP configuration exists
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'dummy_user') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email if no valid config
    // Only needed internally for testing in dev environments
    console.log('No valid SMTP config found, using Ethereal test account...');
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const fromEmail = process.env.SMTP_USER && process.env.SMTP_USER !== 'dummy_user' 
    ? process.env.SMTP_USER 
    : (process.env.FROM_EMAIL || 'noreply@visitor-pass.vercel.app');

  const message = {
    from: `${process.env.FROM_NAME || 'Pass System'} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  if (options.attachments) {
    message.attachments = options.attachments;
  }

  const info = await transporter.sendMail(message);
  console.log(`Email sent format: %s`, info.messageId);
  
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'dummy_user') {
    // Log the Ethereal URL so the user can easily view the email
    console.log(`Preview Email URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};
