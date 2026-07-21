import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email address' })
    .or(z.string().length(0).transform(() => ''))
    .refine((val) => val.length > 0, { message: 'Email is required' }),
    
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),

  remember: z
    .boolean()
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Mirrors RegisterCommandValidator.cs on the backend so client-side
// validation rejects the same inputs the API would.
export const signupSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }).max(100),
    lastName: z.string().min(1, { message: 'Last name is required' }).max(100),
    email: z.email({ error: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain a lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain a number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
