import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import { sendOtpViaSMS, sendOtpViaEmail } from './notificationService.js';

function generateOtp() {
  // 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Create OTP for user and send via SMS/Email
 */
export async function createOtpForUser(user, explicitMobile, otpType = 'LOGIN') {
  const otpCode = generateOtp();
  const ttl = Number(config.otp.ttlMinutes || 30);

  const timezone = config.timezone || 'Asia/Kolkata';
  const nowLocal = moment().tz(timezone);

  // EXPIRY in local timezone (+TTL minutes)
  const expiresLocal = nowLocal.clone().add(ttl, 'minutes');

  // Convert local timezone → UTC DATE OBJECT for Postgres
  const expiresUTC = expiresLocal.tz('UTC').toDate();

  const mobile = explicitMobile || user.phone;
  const email = user.email;

  // Insert OTP into database
  const sql = `
    INSERT INTO users_otps
      (user_id, phone, otp_code, otp_type,
       expires_at, is_used, attempts_count, email, ip_address)
    VALUES
      ($1, $2, $3, $4, $5,
       false, 0, $6, $7)
    RETURNING *;
  `;

  const { rows } = await query(sql, [
    user.user_id,
    mobile,
    otpCode,
    otpType,
    expiresUTC, // store UTC timestamp
    email,
    '127.0.0.1',
  ]);

  // Send OTP via SMS and/or Email
  const sendPromises = [];

  // Send SMS if mobile number is available
  if (mobile) {
    sendPromises.push(
      sendOtpViaSMS(mobile, otpCode, otpType).catch((error) => {
        console.error(`Failed to send OTP SMS to ${mobile}:`, error.message);
        // Don't throw - continue even if SMS fails
      })
    );
  }

  // Send Email if email is available
  if (email) {
    sendPromises.push(
      sendOtpViaEmail(email, otpCode, otpType).catch((error) => {
        console.error(`Failed to send OTP Email to ${email}:`, error.message);
        // Don't throw - continue even if Email fails
      })
    );
  }

  // Wait for all notifications to complete (but don't fail if they error)
  await Promise.allSettled(sendPromises);

  return {
    otpCode,
    expiresIST: expiresLocal.format('DD/MM/YYYY HH:mm:ss'), // Keep field name for backward compatibility
    expiresLocal: expiresLocal.format('DD/MM/YYYY HH:mm:ss'),
    expiresUTC,
    row: rows[0],
  };
}



// Verify OTP for user
export async function verifyUserOtp(userId, mobile, otp) {
  const sql = `
    select otp_id, otp_code, expires_at, is_used
    from users_otps
    where user_id=$1 and phone=$2 and otp_type='LOGIN'
    order by created_at desc limit 1;
  `;

  const { rows } = await query(sql, [userId, mobile]);
  if (!rows.length) return { valid: false, reason: "otp_not_found" };

  const row = rows[0];

  const timezone = config.timezone || 'Asia/Kolkata';
  const nowLocal = moment().tz(timezone);
  const expiresLocal = moment(row.expires_at).tz(timezone);

  // console.log("NOW IST       =", nowIST.format("DD/MM/YYYY HH:mm:ss"));
  // console.log("EXPIRES IST   =", expiresIST.format("DD/MM/YYYY HH:mm:ss"));
// console.log('otp_code',row.otp_code);
// console.log('otp',otp);

  if (row.is_used) return { valid: false, reason: "otp_used" };
  if (nowLocal.isAfter(expiresLocal)) return { valid: false, reason: "otp_expired" };
if (String(row.otp_code).trim() !== String(otp).trim()) {
  return { valid: false, reason: "otp_mismatch" };
}

  return { valid: true , otpRow: row };
}



