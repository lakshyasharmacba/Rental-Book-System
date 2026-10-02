import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
    description: z.string().min(20, { message: 'Description must be at least 20 characters long' }),
    category: z.string().min(2, { message: 'Category is required' }),
    dailyRate: z.number().positive({ message: 'Daily rate must be a positive number' }),
    weeklyRate: z.number().positive().optional(),
    monthlyRate: z.number().positive().optional(),
    depositAmount: z.number().nonnegative().optional(),
    images: z.array(z.string().url()).min(1, { message: 'At least one image is required' }),
    location: z.object({
      address: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(4),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    })
  })
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid item ID' })
  }),
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(20).optional(),
    category: z.string().min(2).optional(),
    dailyRate: z.number().positive().optional(),
    weeklyRate: z.number().positive().optional(),
    monthlyRate: z.number().positive().optional(),
    depositAmount: z.number().nonnegative().optional(),
    images: z.array(z.string().url()).min(1).optional(),
    status: z.enum(['available', 'unavailable', 'rented']).optional()
  })
});
