# Generic Usage Guide

## ✅ What's Generic (Works Out of the Box)

### 1. **Authentication System** (`src/controllers/authController.js`)
- ✅ Multi-step login flow (email/password + OTP)
- ✅ Mobile OTP login
- ✅ Role-agnostic (accepts any role parameter)
- ✅ No hardcoded project-specific logic
- ✅ Can be used in ANY project

### 2. **Session Management** (`src/services/sessionService.js`)
- ✅ Generic session creation/validation/destruction
- ✅ Works with any user table
- ✅ Configurable timezone
- ✅ No project-specific dependencies

### 3. **OTP Service** (`src/services/otpService.js`)
- ✅ Universal OTP generation
- ✅ Works with any OTP type (LOGIN, PASSWORD_RESET, etc.)
- ✅ Automatic SMS/Email sending
- ✅ Configurable timezone

### 4. **Notification Service** (`src/services/notificationService.js`)
- ✅ Multi-provider SMS support (Twilio, MSG91, TextLocal)
- ✅ Multi-provider Email support (SendGrid, SMTP, SES)
- ✅ Development console mode
- ✅ Fully generic and reusable

### 5. **Middleware**
- ✅ `authMiddleware.js` - Generic JWT authentication
- ✅ `roleMiddleware.js` - Generic role-based authorization
- ✅ `validation.js` - Generic request validation
- ✅ `logger.js` - Generic request logging

### 6. **Utilities**
- ✅ `jwt.js` - Generic JWT operations
- ✅ `request.js` - Generic request helpers (IP, user-agent)
- ✅ `response.js` - Generic response helpers

### 7. **Configuration** (`src/config/env.js`)
- ✅ Environment-based configuration
- ✅ No hardcoded values
- ✅ Configurable timezone
- ✅ All settings via environment variables

## ⚙️ What Needs Project-Specific Customization

### 1. **Database Schema**

The core tables are generic, but you may need to add project-specific fields:

```sql
-- Generic users table (works as-is)
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(50),
  is_active BOOLEAN,
  -- Add your project-specific fields here:
  -- organization_id UUID,
  -- department_id UUID,
  -- etc.
);
```

### 2. **User Service** (`src/services/userService.js`)

Currently queries are generic, but you may need to add:
- Project-specific fields in SELECT queries
- Custom filtering logic
- Additional user lookup methods

### 3. **User Controller** (`src/controllers/userController.js`)

This is where project-specific logic goes:
- Custom registration flow
- Project-specific user operations
- Role definitions (if hardcoded)

**Recommendation**: Keep this separate or create a project-specific version.

### 4. **Role Definitions**

The system is role-agnostic, but if you need to validate roles:

```javascript
// Create your own roles config
// src/config/roles.js
export const ALLOWED_ROLES = ['ADMIN', 'USER', 'MANAGER'];
```

### 5. **Additional Routes**

Add your project-specific routes in `src/routes/` and register in `src/app.js`.

## 🔄 Migration Checklist

To use this in a new project:

### Step 1: Basic Setup
- [ ] Copy authentication files (controllers, services, middleware, utils)
- [ ] Update `package.json` name and dependencies
- [ ] Configure `.env` file with your settings
- [ ] Set up database tables

### Step 2: Database Customization
- [ ] Add project-specific fields to `users` table
- [ ] Create project-specific tables
- [ ] Update user service queries if needed

### Step 3: Configuration
- [ ] Set `TIMEZONE` in `.env` to your timezone
- [ ] Configure SMS provider (or use console mode)
- [ ] Configure Email provider (or use console mode)
- [ ] Set JWT secret

### Step 4: Project-Specific Features
- [ ] Add your role definitions
- [ ] Create your user controller (if different)
- [ ] Add project-specific routes
- [ ] Implement your business logic

### Step 5: Testing
- [ ] Test login flow
- [ ] Test OTP sending (check console logs)
- [ ] Test session management
- [ ] Test JWT authentication

## 📊 Generic vs Project-Specific

| Component | Generic | Needs Customization |
|-----------|---------|---------------------|
| Authentication Controller | ✅ | ❌ |
| Session Service | ✅ | ❌ |
| OTP Service | ✅ | ❌ |
| Notification Service | ✅ | ❌ |
| Auth Middleware | ✅ | ❌ |
| JWT Utils | ✅ | ❌ |
| Request/Response Utils | ✅ | ❌ |
| User Service | ✅ | ⚠️ (may need field additions) |
| User Controller | ❌ | ✅ (project-specific logic) |
| Database Schema | ⚠️ | ✅ (add custom fields) |
| Routes | ⚠️ | ✅ (add project routes) |

**Legend:**
- ✅ Fully generic, ready to use
- ⚠️ Mostly generic, minor customization
- ❌ Project-specific, needs customization

## 🎯 Best Practices

1. **Keep Generic Code Separate**: Don't modify generic files unless necessary
2. **Extend, Don't Modify**: Create new files for project-specific features
3. **Environment-Based Config**: Use `.env` for all configuration
4. **Role Flexibility**: Keep roles dynamic, not hardcoded
5. **Database Independence**: Core tables should remain generic

## 📝 Example: Using in a New Project

```javascript
// 1. Copy generic files (already done)
// 2. Create your project-specific user controller

// src/controllers/myProjectUserController.js
import { findUserByEmailAndRole } from '../services/userService.js';

export async function myProjectSpecificFunction(req, res) {
  // Your project-specific logic here
  // Uses generic services
}

// 3. Add your routes

// src/routes/myProjectRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { myProjectSpecificFunction } from '../controllers/myProjectUserController.js';

const router = express.Router();
router.get('/my-endpoint', authenticate, myProjectSpecificFunction);
export default router;

// 4. Register in app.js
app.use('/api/myproject', myProjectRoutes);
```

## ✨ Summary

**This codebase is designed to be generic and reusable!**

- **Core authentication** = 100% generic ✅
- **Session management** = 100% generic ✅
- **OTP system** = 100% generic ✅
- **Notifications** = 100% generic ✅
- **Middleware** = 100% generic ✅

**What you need to customize:**
- Database schema (add your fields)
- User controller (your business logic)
- Additional routes (your endpoints)

The authentication system works with **any project** and **any role structure** out of the box!

