import { z } from 'zod';

export const zUserRole = z.enum(['admin', 'staff', 'executive']);

export const zProfileSchema = z.object({
	email: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	role: zUserRole,
});

export type ProfileSchema = z.infer<typeof zProfileSchema>;
