const twilio = require('twilio');

exports.sendOTP = async (phone, otp) => {
  try {
    // 1. Get twilio settings
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.log("Missing Twilio credentials, unable to send SMS");
      return;
    }

    // 2. Initialize twilio client
    const client = twilio(accountSid, authToken);

    // 3. Send message
    console.log(`Sending OTP to ${phone}`);
    const message = await client.messages.create({
      body: `Your OTP for check-in is: ${otp}`,
      from: twilioNumber,
      to: phone
    });

    console.log("SMS sent successfully! Message SID:", message.sid);
  } catch (error) {
    console.log("Error sending SMS:", error);
  }
};
