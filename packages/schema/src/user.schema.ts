import { vEmail } from '@workspace/schema/utils/_validation';
import { z } from 'zod';

/**
 * User roles defining permission levels in the system.
 * @enum {string}
 */
export const zUserRole = z.enum(['admin', 'staff', 'executive']);

/**
 * User profile schema for validation.
 * @property {string} email - User email address (validated, max 256 chars)
 * @property {string} firstName - User first name (1-100 chars)
 * @property {string} lastName - User last name (1-100 chars)
 * @property {string} role - User role (admin, staff, executive)
 */
export const zProfileSchema = z.object({
	email: vEmail,
	firstName: z.string().trim().min(1, 'Vui lòng điền họ').max(100, 'Họ không được vượt quá 100 ký tự'),
	lastName: z.string().trim().min(1, 'Vui lòng điền tên').max(100, 'Tên không được vượt quá 100 ký tự'),
	role: zUserRole,
});

/**
 * TypeScript type inferred from zProfileSchema.
 * Represents a validated user profile object.
 */
export type ProfileSchema = z.infer<typeof zProfileSchema>;
