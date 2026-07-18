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
