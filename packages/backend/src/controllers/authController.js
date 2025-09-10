import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../../lib/prisma.js';

class AuthController {
  static async login(req, res) {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          success: false,
          message: 'Login and password required',
          error: 'MISSING_CREDENTIALS'
        });
      }

      const db = getDatabase();

      // Find user by username or email
      const user = await db.user.findFirst({
        where: {
          OR: [
            { username: login },
            { email: login }
          ],
          status: 'ACTIVE'
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Check password (in demo, we'll accept any password)
      // In production, use: const isValid = await bcrypt.compare(password, user.passwordHash);
      const isValid = true; // Demo mode - remove in production

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'demo_secret_key',
        { expiresIn: '24h' }
      );

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const responseData = {
        token: token,
        api_key: user.apiKey,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          status: user.status
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: responseData
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  static async signup(req, res) {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const db = getDatabase();

      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          error: 'USER_EXISTS'
        });
      }

      // Hash password (in demo mode, we'll store plain text)
      // In production: const hashedPassword = await bcrypt.hash(password, 12);
      const hashedPassword = password; // Demo mode - remove in production

      // Generate API key
      const apiKey = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user
      const user = await db.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          firstName: first_name || '',
          lastName: last_name || '',
          apiKey,
          tier: 'BRONZE',
          status: 'ACTIVE'
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'demo_secret_key',
        { expiresIn: '24h' }
      );

      const responseData = {
        token: token,
        api_key: user.apiKey,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          status: user.status
        }
      };

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: responseData
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Signup failed',
        error: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'NO_USER_ID'
        });
      }

      const db = getDatabase();
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          tier: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user?.userId;
      const { current_password, new_password } = req.body;

      if (!userId || !current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'User ID, current password, and new password are required',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const db = getDatabase();

      // Get current user
      const user = await db.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Verify current password (in demo mode, skip verification)
      // In production: const isValid = await bcrypt.compare(current_password, user.passwordHash);
      const isValid = true; // Demo mode - remove in production

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          error: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password (in demo mode, store plain text)
      // In production: const hashedPassword = await bcrypt.hash(new_password, 12);
      const hashedPassword = new_password; // Demo mode - remove in production

      // Update password
      await db.user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }

  static async sendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
          error: 'MISSING_EMAIL'
        });
      }

      // Generate OTP (in demo mode, use fixed OTP)
      const otp = '123456'; // Demo mode - remove in production
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const db = getDatabase();

      // Store OTP (using upsert for insert or update)
      await db.otpCode.upsert({
        where: {
          email: email
        },
        update: {
          code: otp,
          expiresAt: expiresAt
        },
        create: {
          email: email,
          code: otp,
          expiresAt: expiresAt,
          purpose: 'verification'
        }
      });

      // In production, send email with OTP
      console.log(`OTP for ${email}: ${otp}`);

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      });
    }
  }

  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required',
          error: 'MISSING_FIELDS'
        });
      }

      const db = getDatabase();

      // Get OTP from database
      const otpRecord = await db.otpCode.findFirst({
        where: {
          email: email,
          code: otp,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP',
          error: 'INVALID_OTP'
        });
      }

      // Delete used OTP
      await db.otpCode.delete({
        where: { email: email }
      });

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      });
    }
  }
}

export { AuthController };
