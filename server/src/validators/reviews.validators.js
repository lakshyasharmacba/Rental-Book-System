import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid booking ID' }),
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid item ID' }),
    rating: z.number().int().min(1).max(5, { message: 'Rating must be between 1 and 5' }),
    comment: z.string().min(5, { message: 'Comment must be at least 5 characters' }).max(500)
  })
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid review ID' })
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(5).max(500).optional()
  })
});
