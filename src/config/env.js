import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  db: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  otp: {
    ttlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
  },

  session: {
    ttlHours: Number(process.env.SESSION_TTL_HOURS || 8),
  },

  timezone: process.env.TIMEZONE || 'Asia/Kolkata', // Default timezone for date operations

  notification: {
    sms: {
      provider: process.env.SMS_PROVIDER || 'console', // console, twilio, msg91, textlocal
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      },
      msg91: {
        authKey: process.env.MSG91_AUTH_KEY,
        senderId: process.env.MSG91_SENDER_ID,
        route: process.env.MSG91_ROUTE || '4',
      },
      textlocal: {
        apiKey: process.env.TEXTLOCAL_API_KEY,
        sender: process.env.TEXTLOCAL_SENDER,
      },
    },
    email: {
      provider: process.env.EMAIL_PROVIDER || 'console', // console, smtp, sendgrid, ses
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL,
      },
    },
  },
};

if (!config.jwt.secret) {
  console.error('JWT_SECRET is required in .env');
  process.exit(1);
}
