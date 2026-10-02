import { z } from 'zod';

export const createDisputeSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid booking ID' }),
    reason: z.enum(['item_damaged', 'not_as_described', 'late_return', 'payment_issue', 'other']),
    description: z.string().min(20, { message: 'Please provide a detailed description (min 20 characters)' }),
    evidenceImages: z.array(z.string().url()).optional()
  })
});

export const addDisputeMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid dispute ID' })
  }),
  body: z.object({
    message: z.string().min(1, { message: 'Message cannot be empty' }),
    attachments: z.array(z.string().url()).optional()
  })
});
