import { z } from 'zod';

export const updatePlatformConfigSchema = z.object({
  body: z.object({
    platformFeePercentage: z.number().min(0).max(100).optional(),
    minimumWithdrawalAmount: z.number().positive().optional(),
    maintenanceMode: z.boolean().optional(),
    featuredCategories: z.array(z.string()).optional()
  })
});

export const resolveDisputeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid dispute ID' })
  }),
  body: z.object({
    resolution: z.string().min(10, { message: 'Resolution notes must be at least 10 characters' }),
    refundAmount: z.number().nonnegative().optional(),
    winnerId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid user ID for winner' }).optional()
  })
});

export const banUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid user ID' })
  }),
  body: z.object({
    reason: z.string().min(10, { message: 'Must provide a reason for the ban' })
  })
});
