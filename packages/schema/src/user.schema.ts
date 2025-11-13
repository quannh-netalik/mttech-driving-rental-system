import { vEmail } from '@workspace/schema/utils/_validation';
import { z } from 'zod';

export const zUserRole = z.enum(['admin', 'staff', 'executive']);

export const zProfileSchema = z.object({
	email: vEmail,
	firstName: z.string().trim().min(1, 'Vui lòng điền họ'),
	lastName: z.string().trim().min(1, 'Vui lòng điền tên'),
	role: zUserRole,
});

export type ProfileSchema = z.infer<typeof zProfileSchema>;
