import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid item ID' }),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime' }),
    endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime' }),
    totalPrice: z.number().positive({ message: 'Total price must be positive' }),
    deliveryRequested: z.boolean().default(false),
    deliveryAddress: z.string().optional()
  })
}).refine((data) => {
  if (data.body.deliveryRequested && !data.body.deliveryAddress) {
    return false;
  }
  return true;
}, {
  message: "Delivery address is required when delivery is requested",
  path: ["body", "deliveryAddress"]
}).refine((data) => {
  const start = new Date(data.body.startDate);
  const end = new Date(data.body.endDate);
  return start < end;
}, {
  message: "End date must be after start date",
  path: ["body", "endDate"]
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid booking ID' })
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'])
  })
});
