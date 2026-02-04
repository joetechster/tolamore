import { z } from 'zod';

const phoneRegex = /^[+]?([0-9\s\-()]){7,}$/;

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    email: z
      .string()
      .trim()
      .email('Invalid email')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Invalid phone')
      .optional()
      .or(z.literal('')),
    addressLine1: z.string().trim().min(3, 'Address is required'),
    city: z.string().trim().min(2, 'City is required'),
    postalCode: z.string().trim().min(3, 'Postal code is required'),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Provide an email or phone number',
    path: ['email'],
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
