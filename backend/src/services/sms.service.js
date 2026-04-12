// backend/src/services/sms.service.js
const twilio = require('twilio');

const sendOTP = async (phone, otp) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.warn('Twilio credentials missing in .env. Skipping actual SMS sending.');
      return false;
    }

    const client = twilio(accountSid, authToken);

    // Format phone number to E.164 if it's missing the country code (assuming India +91 if missing)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
       // Only specifically apply +91 if length is 10, else just prepend +
       formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const message = await client.messages.create({
      body: `Your TuteDude Visitor OTP is ${otp}. Valid for 5 mins.`,
      from: twilioNumber,
      to: formattedPhone
    });

    console.log('Twilio Message Sent - SID:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    return false;
  }
};

module.exports = {
  sendOTP
};
