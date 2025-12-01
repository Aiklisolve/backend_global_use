import axios from 'axios';
import validator from 'validator';
import { config } from '../config/env.js';

/**
 * Notification Service
 * Handles sending SMS and Email notifications
 */

/**
 * Send SMS using configured SMS provider
 */
export async function sendSMS(phone, message) {
  try {
    const smsProvider = config.notification?.sms?.provider || 'console';
    const phoneNumber = phone?.replace(/\D/g, ''); // Remove non-digits

    if (!phoneNumber) {
      throw new Error('Invalid phone number');
    }

    switch (smsProvider.toLowerCase()) {
      case 'twilio':
        return await sendViaTwilio(phoneNumber, message);
      
      case 'msg91':
        return await sendViaMsg91(phoneNumber, message);
      
      case 'textlocal':
        return await sendViaTextLocal(phoneNumber, message);
      
      case 'console':
      default:
        // Development mode: Just log to console
        console.log('📱 SMS (Console Mode):');
        console.log(`   To: ${phoneNumber}`);
        console.log(`   Message: ${message}`);
        return { success: true, provider: 'console', message: 'SMS logged to console' };
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}

/**
 * Send Email using configured email provider
 */
export async function sendEmail(email, subject, message) {
  try {
    const emailProvider = config.notification?.email?.provider || 'console';

    if (!email || !validator.isEmail(email)) {
      throw new Error('Invalid email address');
    }

    switch (emailProvider.toLowerCase()) {
      case 'smtp':
        return await sendViaSMTP(email, subject, message);
      
      case 'sendgrid':
        return await sendViaSendGrid(email, subject, message);
      
      case 'ses':
        return await sendViaSES(email, subject, message);
      
      case 'console':
      default:
        // Development mode: Just log to console
        console.log('📧 Email (Console Mode):');
        console.log(`   To: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Message: ${message}`);
        return { success: true, provider: 'console', message: 'Email logged to console' };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send OTP via SMS
 */
export async function sendOtpViaSMS(phone, otpCode, otpType = 'LOGIN') {
  const message = getOtpMessage(otpCode, otpType);
  return await sendSMS(phone, message);
}

/**
 * Send OTP via Email
 */
export async function sendOtpViaEmail(email, otpCode, otpType = 'LOGIN') {
  const subject = getOtpSubject(otpType);
  const message = getOtpEmailBody(otpCode, otpType);
  return await sendEmail(email, subject, message);
}

/**
 * Get OTP SMS message template
 */
function getOtpMessage(otpCode, otpType) {
  const messages = {
    LOGIN: `Your login OTP is ${otpCode}. Valid for ${config.otp.ttlMinutes} minutes. Do not share this OTP with anyone.`,
    PASSWORD_RESET: `Your password reset OTP is ${otpCode}. Valid for ${config.otp.ttlMinutes} minutes. Do not share this OTP with anyone.`,
    VERIFICATION: `Your verification OTP is ${otpCode}. Valid for ${config.otp.ttlMinutes} minutes. Do not share this OTP with anyone.`,
  };
  return messages[otpType] || `Your OTP is ${otpCode}. Valid for ${config.otp.ttlMinutes} minutes.`;
}

/**
 * Get OTP Email subject
 */
function getOtpSubject(otpType) {
  const subjects = {
    LOGIN: 'Your Login OTP',
    PASSWORD_RESET: 'Password Reset OTP',
    VERIFICATION: 'Verification OTP',
  };
  return subjects[otpType] || 'Your OTP';
}

/**
 * Get OTP Email body
 */
function getOtpEmailBody(otpCode, otpType) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Your OTP Code</h2>
      <p>Your OTP code is: <strong style="font-size: 24px; color: #007bff;">${otpCode}</strong></p>
      <p>This OTP is valid for ${config.otp.ttlMinutes} minutes.</p>
      <p style="color: #dc3545;"><strong>Important:</strong> Do not share this OTP with anyone.</p>
      <p>If you did not request this OTP, please ignore this message.</p>
    </div>
  `;
}

// ============================================
// SMS Provider Implementations
// ============================================

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio(phone, message) {
  const accountSid = config.notification?.sms?.twilio?.accountSid;
  const authToken = config.notification?.sms?.twilio?.authToken;
  const fromNumber = config.notification?.sms?.twilio?.fromNumber;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const response = await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    new URLSearchParams({
      From: fromNumber,
      To: phone,
      Body: message,
    }),
    {
      auth: {
        username: accountSid,
        password: authToken,
      },
    }
  );

  return { success: true, provider: 'twilio', sid: response.data.sid };
}

/**
 * Send SMS via MSG91
 */
async function sendViaMsg91(phone, message) {
  const authKey = config.notification?.sms?.msg91?.authKey;
  const senderId = config.notification?.sms?.msg91?.senderId;
  const route = config.notification?.sms?.msg91?.route || '4';

  if (!authKey || !senderId) {
    throw new Error('MSG91 credentials not configured');
  }

  const response = await axios.get('https://control.msg91.com/api/sendhttp.php', {
    params: {
      authkey: authKey,
      mobiles: phone,
      message: message,
      sender: senderId,
      route: route,
      country: '91', // India country code
    },
  });

  return { success: true, provider: 'msg91', response: response.data };
}

/**
 * Send SMS via TextLocal
 */
async function sendViaTextLocal(phone, message) {
  const apiKey = config.notification?.sms?.textlocal?.apiKey;
  const sender = config.notification?.sms?.textlocal?.sender;

  if (!apiKey || !sender) {
    throw new Error('TextLocal credentials not configured');
  }

  const response = await axios.post('https://api.textlocal.in/send/', null, {
    params: {
      apikey: apiKey,
      numbers: phone,
      message: message,
      sender: sender,
    },
  });

  return { success: true, provider: 'textlocal', response: response.data };
}

// ============================================
// Email Provider Implementations
// ============================================

/**
 * Send Email via SMTP
 */
async function sendViaSMTP(email, subject, message) {
  // This would typically use nodemailer
  // For now, we'll just log and suggest implementation
  console.log('📧 SMTP Email (Not Implemented):');
  console.log(`   To: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Message: ${message}`);
  console.log('   Note: Please configure nodemailer for SMTP support');
  return { success: true, provider: 'smtp', message: 'SMTP not fully implemented' };
}

/**
 * Send Email via SendGrid
 */
async function sendViaSendGrid(email, subject, message) {
  const apiKey = config.notification?.email?.sendgrid?.apiKey;
  const fromEmail = config.notification?.email?.sendgrid?.fromEmail;

  if (!apiKey || !fromEmail) {
    throw new Error('SendGrid credentials not configured');
  }

  const response = await axios.post(
    'https://api.sendgrid.com/v3/mail/send',
    {
      personalizations: [{ to: [{ email }] }],
      from: { email: fromEmail },
      subject,
      content: [{ type: 'text/html', value: message }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return { success: true, provider: 'sendgrid', response: response.data };
}

/**
 * Send Email via AWS SES
 */
async function sendViaSES(email, subject, message) {
  // AWS SES implementation would require AWS SDK
  console.log('📧 AWS SES Email (Not Implemented):');
  console.log(`   To: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log('   Note: Please configure AWS SDK for SES support');
  return { success: true, provider: 'ses', message: 'SES not fully implemented' };
}

