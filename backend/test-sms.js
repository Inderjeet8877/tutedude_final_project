require('dotenv').config();
const twilio = require('twilio');

const testSMS = async () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.log('Twilio keys missing in .env');
      return;
    }

    const phone = '+917654398184';
    const otp = '123456';

    console.log('Sending Twilio payload...');
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your Visitor OTP is ${otp}. Valid for 5 mins.`,
      from: twilioNumber,
      to: phone
    });

    console.log('Success! Twilio Message SID:', message.sid);

  } catch (error) {
    console.error('Error firing Twilio:', error.message);
  }
};

testSMS();
