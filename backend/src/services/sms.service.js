const twilio = require('twilio');

// Normalize phone to E.164 format required by Twilio
const normalizePhone = (phone) => {
  let normalized = phone.replace(/[\s\-().]/g, '');
  if (!normalized.startsWith('+')) {
    // Default to India (+91) if no country code
    normalized = '+91' + normalized;
  }
  return normalized;
};

exports.sendOTP = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn("⚠️  Missing Twilio credentials — SMS not sent. OTP:", otp);
    return { sent: false, reason: 'missing_credentials' };
  }

  const normalizedPhone = normalizePhone(phone);
  console.log(`Sending OTP to ${normalizedPhone}`);

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: `Your visitor check-in OTP is: ${otp}. Valid for 5 minutes.`,
      from: twilioNumber,
      to: normalizedPhone
    });
    console.log("SMS sent successfully! SID:", message.sid);
    return { sent: true };
  } catch (error) {
    console.error("❌ SMS send failed:", error.message);
    return { sent: false, reason: error.message };
  }
};
