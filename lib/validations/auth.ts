import { z } from 'zod'
import { UserRole } from '@prisma/client'

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Registration schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().max(2000).optional().nullable(),
  education: z.string().max(2000).optional().nullable(),
  linkedIn: z.string().url('Please enter a valid LinkedIn URL').optional().nullable(),
  github: z.string().url('Please enter a valid GitHub URL').optional().nullable(),
  website: z.string().url('Please enter a valid website URL').optional().nullable(),
  avatar: z.string().url('Please enter a valid image URL').optional().nullable(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>

// Avatar upload validation
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
})

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>

// Company profile schema (for company users)
export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must not exceed 255 characters'),
  industry: z.string().optional().nullable(),
  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .optional()
    .nullable(),
  website: z.string().url('Please enter a valid website URL').optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>

// Instructor profile schema (for instructor users)
export const instructorProfileSchema = z.object({
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
  certifications: z.array(z.string()).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional().nullable(),
})

export type InstructorProfileInput = z.infer<typeof instructorProfileSchema>
