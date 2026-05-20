import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: 'First name is required',
    }).trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string({
      required_error: 'Last name is required',
    }).trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string({
      required_error: 'Email is required',
    }).trim().email('Invalid email address format'),
    phone: z.string({
      required_error: 'Phone number is required',
    }).trim().min(7, 'Phone number must be at least 7 characters'),
    password: z.string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string({
      required_error: 'Email or phone number is required',
    }).trim().min(1, 'Email or phone number cannot be empty'),
    password: z.string({
      required_error: 'Password is required',
    }).min(1, 'Password cannot be empty'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').optional(),
    phone: z.string().trim().min(7, 'Phone number must be at least 7 characters').optional(),
  }),
});

