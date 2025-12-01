# Backend Global Use - Universal Authentication & Session Management

A generic, production-ready Node.js backend authentication system that can be integrated into any project. Features include multi-step login with OTP, session management, JWT authentication, and role-based access control.

## 🌟 Features

### Core Authentication System
- ✅ **Multi-step Login Flow**: Email/Password + OTP verification
- ✅ **Mobile OTP Login**: Direct OTP-based mobile authentication
- ✅ **Session Management**: Secure session tracking with expiration
- ✅ **JWT Token Authentication**: Stateless token-based auth
- ✅ **Password Security**: Bcrypt password hashing support
- ✅ **OTP System**: SMS/Email OTP delivery with expiration

### Notification System
- ✅ **SMS Integration**: Support for Twilio, MSG91, TextLocal
- ✅ **Email Integration**: Support for SendGrid, SMTP, AWS SES
- ✅ **Console Mode**: Development mode that logs notifications

### Project Structure
- ✅ **Clean Architecture**: Separation of concerns (controllers, services, routes, middleware)
- ✅ **Validation Middleware**: Request validation helpers
- ✅ **Response Utilities**: Standardized API response format
- ✅ **Error Handling**: Comprehensive error handling
- ✅ **Logging**: Request/response logging with Morgan

## 📋 Prerequisites

- Node.js 18+ (or Node.js 16+ with UUID library)
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Database
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_user
PGPASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=8h

# OTP Configuration
OTP_TTL_MINUTES=10

# Session Configuration
SESSION_TTL_HOURS=8

# Timezone (optional, default: Asia/Kolkata)
TIMEZONE=Asia/Kolkata

# SMS Provider (choose one)
SMS_PROVIDER=console  # console, twilio, msg91, textlocal

# Twilio (if using)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=your_twilio_number

# MSG91 (if using)
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_ROUTE=4

# TextLocal (if using)
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER=your_sender_name

# Email Provider (choose one)
EMAIL_PROVIDER=console  # console, sendgrid, smtp, ses

# SendGrid (if using)
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Database Setup

Create the following tables in your PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP table
CREATE TABLE users_otps (
  otp_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  phone VARCHAR(20),
  email VARCHAR(255),
  otp_code VARCHAR(10) NOT NULL,
  otp_type VARCHAR(50) DEFAULT 'LOGIN',
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  attempts_count INTEGER DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE user_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  jwt_token TEXT NOT NULL,
  device_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### 1. Legacy Login (Step-based)
**POST** `/api/auth/login`

Request body with `step` parameter:
- `credential_validation` - Step 1: Email/Password validation
- `send_otp` - Step 2: Send OTP to mobile
- `final_login` - Step 3: Verify OTP and create session

#### 2. New Structured Routes

**POST** `/api/auth/validate-credentials`
- Validates email/password credentials
- Sends OTP automatically

**POST** `/api/auth/send-otp`
- Sends OTP to mobile number

**POST** `/api/auth/final-login`
- Verifies OTP and creates session
- Returns JWT token

### Session Endpoints

**POST** `/api/sessions/validate`
- Validates an existing session

**POST** `/api/sessions/logout`
- Logs out and destroys session

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.js # Authentication logic
│   └── sessionController.js
├── services/            # Business logic
│   ├── otpService.js    # OTP generation & verification
│   ├── sessionService.js # Session management
│   ├── userService.js   # User operations
│   └── notificationService.js # SMS/Email sending
├── routes/              # API routes
│   ├── authRoutes.js
│   └── sessionRoutes.js
├── middleware/          # Express middleware
│   ├── authMiddleware.js # JWT authentication
│   ├── roleMiddleware.js # Role-based authorization
│   ├── validation.js    # Request validation
│   └── logger.js        # Request logging
├── utils/               # Utility functions
│   ├── jwt.js          # JWT operations
│   ├── request.js      # Request helpers
│   └── response.js     # Response helpers
└── config/              # Configuration
    ├── env.js          # Environment config
    └── db.js           # Database connection
```

## 🎯 What Makes This Generic?

### ✅ Generic Components (Works with Any Project)

1. **Authentication Flow**: Role-agnostic, works with any user roles
2. **Session Management**: Generic session tracking
3. **OTP System**: Universal OTP generation and verification
4. **Notification Service**: Multi-provider SMS/Email support
5. **JWT Authentication**: Standard JWT implementation
6. **Validation Middleware**: Reusable request validation
7. **Response Utilities**: Standardized API responses

### ⚙️ Project-Specific Customization

The following can be customized per project:

1. **User Table Schema**: Add project-specific fields (e.g., `school_id`, `organization_id`)
2. **Role Management**: Define your own roles in your user controller
3. **Database Tables**: Add project-specific tables as needed
4. **Additional Routes**: Add your project-specific routes
5. **Business Logic**: Implement your domain-specific logic

## 🔧 Customization Guide

### Adding Custom Roles

Edit your user controller or create a roles configuration:

```javascript
// src/config/roles.js
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
  // Add your custom roles
};
```

### Adding Project-Specific Fields

Extend the user schema in your database and update queries in `userService.js`.

### Customizing Response Format

Modify `src/utils/response.js` to match your project's API response format.

## 📝 Example Usage

### Login Flow

```javascript
// Step 1: Validate credentials
POST /api/auth/login
{
  "step": "credential_validation",
  "login_type": "email_password",
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"
}

// Response
{
  "status": 200,
  "message": "Valid details. OTP sent",
  "otp": "1234",  // Remove in production
  "expires_at": "01/12/2024 15:30:00",
  "user_id": "uuid",
  "login_type": "email_password"
}

// Step 2: Final login with OTP
POST /api/auth/login
{
  "step": "final_login",
  "email": "user@example.com",
  "role": "USER",
  "otp": "1234"
}

// Response
{
  "status": 200,
  "message": "Login successful",
  "session_id": "uuid",
  "user_id": "uuid",
  "token": "jwt_token_here",
  "expiry": "2024-12-01 23:30:00",
  "role": "USER",
  "email": "user@example.com",
  "session_status": true
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Session expiration management
- OTP expiration and one-time use
- IP address and user agent tracking
- Role-based access control (RBAC)

## 🌍 Timezone Support

The system uses configurable timezones. Set `TIMEZONE` in your `.env` file:

```env
TIMEZONE=America/New_York
TIMEZONE=Europe/London
TIMEZONE=Asia/Tokyo
```

Default: `Asia/Kolkata`

## 📦 Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **jsonwebtoken**: JWT handling
- **bcrypt**: Password hashing
- **axios**: HTTP client for notifications
- **moment-timezone**: Date/time handling
- **validator**: Input validation
- **morgan**: HTTP request logger

## 🤝 Contributing

This is a generic authentication system designed to be adapted for any project. Feel free to:

1. Customize for your specific needs
2. Add additional authentication methods
3. Integrate with your preferred services
4. Extend with project-specific features

## 📄 License

ISC

## 🙏 Credits

Designed as a reusable authentication backend that works with any project structure.
