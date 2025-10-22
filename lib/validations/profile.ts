import { z } from 'zod'

// Profile update schema
export const profileSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .optional()
    .or(z.literal('')),

  bio: z
    .string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (!val || val === '') return null
      return new Date(val)
    }),

  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .optional(),

  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .optional()
    .or(z.literal('')),

  timezone: z
    .string()
    .optional()
    .or(z.literal('')),

  // Professional Information
  skills: z
    .array(z.string())
    .max(20, 'Maximum 20 skills allowed')
    .optional()
    .default([]),

  languages: z
    .array(z.string())
    .max(10, 'Maximum 10 languages allowed')
    .optional()
    .default([]),

  experience: z
    .string()
    .max(5000, 'Experience must be less than 5000 characters')
    .optional()
    .or(z.literal('')),

  education: z
    .string()
    .max(5000, 'Education must be less than 5000 characters')
    .optional()
    .or(z.literal('')),

  // Social Links
  linkedIn: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),

  // Avatar
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Profile response type (what we get from the API)
export type ProfileData = {
  id: string
  userId: string
  name: string | null
  avatar: string | null
  bio: string | null
  phone: string | null
  dateOfBirth: Date | null
  gender: string | null
  location: string | null
  timezone: string | null
  languages: string[]
  skills: string[]
  experience: string | null
  education: string | null
  linkedIn: string | null
  website: string | null
  createdAt: Date
  updatedAt: Date
}
